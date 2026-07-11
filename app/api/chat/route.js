import connectDB from '@/lib/db';
import Conversation from '@/models/Conversation';
import Lead from '@/models/Lead';
import Notification from '@/models/Notification';
import { apiSuccess, apiError } from '@/lib/api';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function calculateLeadScore(data) {
  let score = 0;

  // Budget scoring (0-25)
  const budgetStr = (data.budget || '').toLowerCase();
  if (budgetStr.includes('50000') || budgetStr.includes('50k') || parseInt(budgetStr) >= 50000) score += 25;
  else if (budgetStr.includes('20000') || budgetStr.includes('20k') || parseInt(budgetStr) >= 20000) score += 18;
  else if (budgetStr.includes('10000') || budgetStr.includes('10k') || parseInt(budgetStr) >= 10000) score += 12;
  else if (budgetStr.includes('5000') || budgetStr.includes('5k') || parseInt(budgetStr) >= 5000) score += 7;
  else if (budgetStr) score += 3;

  // Timeline scoring (0-15)
  const deadline = (data.deadline || '').toLowerCase();
  if (deadline.includes('1 month') || deadline.includes('urgent') || deadline.includes('asap')) score += 15;
  else if (deadline.includes('2') || deadline.includes('3 month')) score += 10;
  else if (deadline.includes('6') || deadline.includes('half')) score += 5;
  else if (deadline) score += 2;

  // Project type scoring (0-15)
  const projectType = data.projectType || '';
  const highValueProjects = ['AI Solution', 'ERP', 'SaaS', 'Marketplace', 'CRM'];
  if (highValueProjects.includes(projectType)) score += 15;
  else if (['Dashboard', 'Booking System', 'Custom Software'].includes(projectType)) score += 10;
  else score += 5;

  // Business type scoring (0-10)
  const businessType = data.businessType || '';
  const highValueBusiness = ['AI Startup', 'Finance', 'Healthcare', 'Ecommerce'];
  if (highValueBusiness.includes(businessType)) score += 10;
  else score += 5;

  // Features requested (0-15)
  const features = [];
  if (data.paymentGateway) features.push(1);
  if (data.adminDashboard) features.push(1);
  if (data.authentication) features.push(1);
  if (data.cms) features.push(1);
  if (data.booking) features.push(1);
  if (data.inventory) features.push(1);
  if (data.reports) features.push(1);
  if (data.analytics) features.push(1);
  if (data.aiFeatures) features.push(1);
  score += Math.min(features.length * 2, 15);

  // Country scoring (0-10)
  const country = (data.country || '').toLowerCase();
  const highValueCountries = ['usa', 'united states', 'uk', 'united kingdom', 'canada', 'australia', 'germany', 'uae', 'dubai'];
  if (highValueCountries.some(c => country.includes(c))) score += 10;
  else score += 4;

  // Company provided (0-5)
  if (data.company) score += 5;

  // Phone provided (0-5)
  if (data.phone) score += 5;

  return Math.min(score, 100);
}

function getLeadStatus(score) {
  if (score >= 70) return 'Hot';
  if (score >= 40) return 'Warm';
  return 'Cold';
}

const SYSTEM_PROMPT = `You are an expert AI Business Consultant for a premium software development agency called "LeadAI Pro". Your role is to guide website visitors through an intelligent conversation to understand their business needs, qualify them as leads, and collect the information needed to generate a proposal.

Be professional, warm, and conversational. Use emojis sparingly but effectively. Ask ONE question at a time.

Your goal is to collect the following information naturally through conversation:
1. Their name and email (required first)
2. Phone number and company name
3. Country/location
4. Business type (Restaurant, Hospital, Real Estate, School, Travel, AI Startup, Ecommerce, Portfolio, Agency, Manufacturing, Healthcare, Finance, Education)
5. Project type (Website, Mobile App, AI Solution, CRM, ERP, Dashboard, Marketplace, SaaS, Booking System, Custom Software)
6. Target audience
7. Business goals
8. Current website (if any)
9. Expected features (payment gateway, admin dashboard, authentication, CMS, booking, inventory, reports, analytics, AI features)
10. Preferred technology stack
11. Budget range
12. Deadline/timeline
13. Urgency

After collecting information, provide:
- AI analysis of their project
- Estimated budget range
- Recommended technology stack
- Project complexity assessment
- Timeline estimate
- Lead score interpretation

Always maintain conversation context. If the user has already provided information, don't ask for it again. When you have enough information (at least name, email, business type, project type, and budget), offer to generate a proposal.

Extract structured data from responses and update the collectedData object accordingly.

When responding, always include a JSON block at the end of your message (hidden from display) in this format:
[DATA_UPDATE: {"field": "value", ...}]

Available fields: name, email, phone, company, country, businessType, projectType, targetAudience, businessGoals, currentWebsite, preferredTechnology (array), budget, deadline, expectedFeatures (array), paymentGateway (bool), adminDashboard (bool), authentication (bool), cms (bool), booking (bool), inventory (bool), reports (bool), analytics (bool), aiFeatures (bool)

When ready to convert, add: [READY_TO_CONVERT: true]`;

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { message, sessionId, collectedData = {} } = body;

    if (!sessionId) return apiError('Session ID required', 400);

    // Find or create conversation
    let conversation = await Conversation.findOne({ sessionId });
    if (!conversation) {
      conversation = await Conversation.create({
        sessionId,
        messages: [],
        collectedData: {},
        status: 'active',
      });
    }

    // Add user message
    conversation.messages.push({ role: 'user', content: message });

    // Build messages for OpenAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversation.messages.slice(-20).map(m => ({ role: m.role, content: m.content })),
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const assistantMessage = completion.choices[0].message.content;

    // Parse data updates from AI response
    const dataUpdateMatch = assistantMessage.match(/\[DATA_UPDATE:\s*({.*?})\]/s);
    const isReadyToConvert = assistantMessage.includes('[READY_TO_CONVERT: true]');

    let updatedData = { ...conversation.collectedData.toObject?.() || conversation.collectedData, ...collectedData };
    if (dataUpdateMatch) {
      try {
        const parsedUpdate = JSON.parse(dataUpdateMatch[1]);
        updatedData = { ...updatedData, ...parsedUpdate };
      } catch (e) {
        console.log('Failed to parse data update');
      }
    }

    // Clean display message (remove data blocks)
    const displayMessage = assistantMessage
      .replace(/\[DATA_UPDATE:.*?\]/gs, '')
      .replace(/\[READY_TO_CONVERT:.*?\]/g, '')
      .trim();

    // Add assistant message to conversation
    conversation.messages.push({ role: 'assistant', content: displayMessage });
    conversation.collectedData = updatedData;

    let leadId = conversation.leadId;

    // Convert to lead if ready and have minimum data
    if (isReadyToConvert && updatedData.email && updatedData.name && !conversation.isConverted) {
      const leadScore = calculateLeadScore(updatedData);
      const leadStatus = getLeadStatus(leadScore);

      const leadData = {
        name: updatedData.name || 'Unknown',
        email: updatedData.email,
        phone: updatedData.phone || '',
        company: updatedData.company || '',
        country: updatedData.country || '',
        website: updatedData.currentWebsite || '',
        businessType: updatedData.businessType || 'Other',
        projectType: updatedData.projectType || 'Website',
        targetAudience: updatedData.targetAudience || '',
        businessGoals: updatedData.businessGoals || '',
        preferredTechnology: Array.isArray(updatedData.preferredTechnology) ? updatedData.preferredTechnology : [],
        budget: {
          raw: updatedData.budget || '',
          min: 0,
          max: 0,
        },
        deadline: updatedData.deadline || '',
        leadScore,
        leadStatus,
        source: 'AI Chat Widget',
      };

      const lead = await Lead.create(leadData);
      leadId = lead._id;
      conversation.leadId = leadId;
      conversation.isConverted = true;

      // Create notification
      await Notification.create({
        type: 'new_lead',
        title: '🔥 New Lead from AI Chat',
        message: `${updatedData.name} (${leadStatus} Lead - Score: ${leadScore}) is interested in ${updatedData.projectType}`,
        link: `/leads/${lead._id}`,
        metadata: { leadId: lead._id, leadScore, leadStatus },
      });
    }

    await conversation.save();

    return apiSuccess({
      message: displayMessage,
      sessionId,
      collectedData: updatedData,
      isReadyToConvert,
      leadId,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return apiError('Chat service unavailable: ' + error.message, 500);
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) return apiError('Session ID required', 400);

    const conversation = await Conversation.findOne({ sessionId });
    if (!conversation) return apiSuccess({ messages: [], collectedData: {} });

    return apiSuccess({
      messages: conversation.messages,
      collectedData: conversation.collectedData,
      leadId: conversation.leadId,
    });
  } catch (error) {
    return apiError('Failed to fetch conversation', 500);
  }
}
