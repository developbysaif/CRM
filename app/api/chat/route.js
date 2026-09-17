import connectDB from '@/lib/db';
import Conversation from '@/models/Conversation';
import Lead from '@/models/Lead';
import Notification from '@/models/Notification';
import ActivityLog from '@/models/ActivityLog';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api';
import { sendAutomatedEmail } from '@/lib/services/email/email.service';
import OpenAI from 'openai';

const INITIAL_GREETING = `Hi 👋

I'm your AI Business Consultant.

Tell me about your project and I'll help you estimate the cost, timeline and recommend the best technology.`;

// Intelligent Lead Scoring Engine (0 - 100)
function calculateLeadScore(data) {
  let score = 0;

  // 1. Budget scoring (0 - 25 pts)
  const budgetStr = `${data.budget || ''} ${data.rawBudget || ''}`.toLowerCase();
  if (budgetStr.includes('50000') || budgetStr.includes('50k') || budgetStr.includes('100k') || parseInt(budgetStr) >= 50000) score += 25;
  else if (budgetStr.includes('25000') || budgetStr.includes('25k') || budgetStr.includes('30k') || parseInt(budgetStr) >= 20000) score += 20;
  else if (budgetStr.includes('10000') || budgetStr.includes('10k') || parseInt(budgetStr) >= 10000) score += 15;
  else if (budgetStr.includes('5000') || budgetStr.includes('5k') || parseInt(budgetStr) >= 5000) score += 10;
  else if (budgetStr.includes('3000') || budgetStr.includes('3k') || parseInt(budgetStr) >= 3000) score += 6;
  else if (budgetStr) score += 4;

  // 2. Timeline & Urgency scoring (0 - 15 pts)
  const deadline = (data.deadline || '').toLowerCase();
  const urgency = (data.urgency || '').toLowerCase();
  if (urgency === 'critical' || deadline.includes('asap') || deadline.includes('urgent') || deadline.includes('1 month') || deadline.includes('2 weeks')) score += 15;
  else if (urgency === 'high' || deadline.includes('2 month') || deadline.includes('3 month')) score += 12;
  else if (deadline.includes('6 month') || deadline.includes('flexible')) score += 8;
  else score += 5;

  // 3. Project Type scoring (0 - 15 pts)
  const projectType = data.projectType || '';
  const highTier = ['AI Solution', 'ERP', 'SaaS', 'Marketplace', 'CRM', 'Custom Software'];
  const midTier = ['Dashboard', 'Booking System', 'Mobile App'];
  if (highTier.includes(projectType)) score += 15;
  else if (midTier.includes(projectType)) score += 12;
  else score += 8;

  // 4. Industry / Business Type scoring (0 - 10 pts)
  const businessType = data.businessType || '';
  const enterpriseIndustries = ['AI Startup', 'Finance', 'Healthcare', 'Hospital', 'Ecommerce', 'Manufacturing'];
  if (enterpriseIndustries.includes(businessType)) score += 10;
  else if (['Real Estate', 'Education', 'Travel', 'Agency', 'School'].includes(businessType)) score += 8;
  else score += 5;

  // 5. Expected Features requested (0 - 15 pts)
  const feats = Array.isArray(data.expectedFeatures) ? data.expectedFeatures : [];
  let featCount = feats.length;
  if (data.paymentGateway) featCount++;
  if (data.adminDashboard) featCount++;
  if (data.authentication) featCount++;
  if (data.cms) featCount++;
  if (data.booking) featCount++;
  if (data.inventory) featCount++;
  if (data.reports) featCount++;
  if (data.analytics) featCount++;
  if (data.aiFeatures) featCount++;
  score += Math.min(Math.round(featCount * 2.5), 15);

  // 6. Country / High Value Geo (0 - 10 pts)
  const country = (data.country || '').toLowerCase();
  const tier1Countries = ['usa', 'united states', 'uk', 'united kingdom', 'canada', 'australia', 'germany', 'uae', 'dubai', 'singapore', 'switzerland', 'saudi arabia'];
  if (tier1Countries.some(c => country.includes(c))) score += 10;
  else if (country) score += 6;
  else score += 3;

  // 7. Company & Contact completeness (0 - 10 pts)
  if (data.company) score += 5;
  if (data.phone) score += 5;

  return Math.min(Math.max(score, 10), 100);
}

function getLeadStatus(score) {
  if (score >= 75) return 'Hot';
  if (score >= 45) return 'Warm';
  return 'Cold';
}

function getComplexityAndEstimate(projectType, featuresCount, budget) {
  let complexity = 'Medium';
  let devWeeks = '4-8 weeks';
  let devCount = 2;
  let recommendedStack = ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Node.js', 'MongoDB', 'Redis'];

  if (projectType === 'AI Solution' || projectType === 'ERP' || projectType === 'SaaS' || featuresCount >= 5) {
    complexity = 'Complex';
    devWeeks = '8-14 weeks';
    devCount = 3;
    recommendedStack = ['Next.js 15 App Router', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'OpenAI API', 'Stripe'];
  } else if (projectType === 'Website' || projectType === 'Portfolio') {
    complexity = 'Simple';
    devWeeks = '2-4 weeks';
    devCount = 1;
    recommendedStack = ['Next.js 15', 'Tailwind CSS', 'Shadcn UI', 'Cloudinary', 'Vercel'];
  }

  return { complexity, devWeeks, devCount, recommendedStack };
}

// Built-in intelligent heuristic consultant fallback
function generateHeuristicResponse(userMessage, conversationHistory, collectedData) {
  const msg = (userMessage || '').toLowerCase();
  const updated = { ...collectedData };

  // 1. Name & Email extraction
  const emailMatch = userMessage.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch && !updated.email) {
    updated.email = emailMatch[0];
  }

  // Name extraction heuristic
  if (!updated.name) {
    const nameMatch = userMessage.match(/(?:my name is|i am|i'm|this is|call me)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
    if (nameMatch) {
      updated.name = nameMatch[1];
    } else if (emailMatch) {
      const parts = userMessage.replace(emailMatch[0], '').trim().split(/\s+/);
      if (parts.length > 0 && parts[0].length > 1 && !parts[0].includes('@')) {
        updated.name = parts.slice(0, 2).join(' ');
      }
    }
  }

  // 2. Business Type extraction
  const businessTypes = ['Restaurant', 'Hospital', 'Real Estate', 'School', 'Travel', 'AI Startup', 'Ecommerce', 'Portfolio', 'Agency', 'Manufacturing', 'Healthcare', 'Finance', 'Education'];
  for (const bt of businessTypes) {
    if (msg.includes(bt.toLowerCase())) {
      updated.businessType = bt;
      break;
    }
  }

  // 3. Project Type extraction
  const projectTypes = ['Website', 'Mobile App', 'AI Solution', 'CRM', 'ERP', 'Dashboard', 'Marketplace', 'SaaS', 'Booking System', 'Custom Software'];
  for (const pt of projectTypes) {
    if (msg.includes(pt.toLowerCase())) {
      updated.projectType = pt;
      break;
    }
  }

  // 4. Budget extraction
  const budgetMatch = userMessage.match(/(\$?\d+[\d,]*\s*(?:k|usd|dollars)?(?:\s*-\s*\$?\d+[\d,]*\s*(?:k|usd|dollars)?)?)/i);
  if (budgetMatch && (msg.includes('budget') || msg.includes('$') || msg.includes('k') || msg.includes('usd') || msg.includes('thousand'))) {
    updated.budget = budgetMatch[1];
  }

  // 5. Timeline / Urgency
  if (msg.includes('month') || msg.includes('week') || msg.includes('asap') || msg.includes('urgent')) {
    updated.deadline = userMessage.trim();
  }

  // 6. Features extraction
  if (!updated.expectedFeatures) updated.expectedFeatures = [];
  const featureKeywords = [
    { key: 'Payment Gateway', test: /payment|stripe|checkout|paypal/i, prop: 'paymentGateway' },
    { key: 'Admin Dashboard', test: /admin|dashboard|panel|manage/i, prop: 'adminDashboard' },
    { key: 'Authentication', test: /auth|login|signup|jwt|oauth/i, prop: 'authentication' },
    { key: 'CMS', test: /cms|content management|blog/i, prop: 'cms' },
    { key: 'Booking System', test: /book|schedule|appointment/i, prop: 'booking' },
    { key: 'Inventory', test: /inventory|stock|warehouse/i, prop: 'inventory' },
    { key: 'Reports & Analytics', test: /report|analytics|chart|metrics/i, prop: 'analytics' },
    { key: 'AI Features', test: /ai|bot|assistant|chatgpt|openai|llm/i, prop: 'aiFeatures' },
  ];

  featureKeywords.forEach(({ key, test, prop }) => {
    if (test.test(msg)) {
      if (!updated.expectedFeatures.includes(key)) updated.expectedFeatures.push(key);
      updated[prop] = true;
    }
  });

  // Country
  const countries = ['United States', 'USA', 'UK', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'UAE', 'Dubai', 'Saudi Arabia', 'India', 'Pakistan', 'Singapore', 'France'];
  for (const c of countries) {
    if (msg.includes(c.toLowerCase())) {
      updated.country = c;
      break;
    }
  }

  // Company Name
  const companyMatch = userMessage.match(/(?:company is|company name is|at|from)\s+([A-Za-z0-9\s&]+)/i);
  if (companyMatch && !updated.company) {
    updated.company = companyMatch[1].trim();
  }

  // Determine stage and next question
  let reply = '';
  let isReadyToConvert = false;

  if (!updated.name || !updated.email) {
    reply = `Great to meet you! To personalize your consultation and prepare your custom scope, could you please share your **Name**, **Email Address**, and your **Company Name**?`;
  } else if (!updated.businessType) {
    reply = `Thank you, **${updated.name}**! 🚀\n\nWhat industry or business type does your organization operate in?\n\n*(Options: Restaurant, Hospital, Real Estate, School, Travel, AI Startup, Ecommerce, Portfolio, Agency, Manufacturing, Healthcare, Finance, Education)*`;
  } else if (!updated.projectType) {
    reply = `Got it! Operating in the **${updated.businessType}** sector. What type of software solution are you looking to build?\n\n*(Options: Website, Mobile App, AI Solution, CRM, ERP, Dashboard, Marketplace, SaaS, Booking System, Custom Software)*`;
  } else if (!updated.expectedFeatures || updated.expectedFeatures.length === 0) {
    reply = `Excellent choice. A **${updated.projectType}** for **${updated.businessType}** offers immense ROI.\n\nWhat key features do you require? For example:\n- **Payment Gateway (Stripe/PayPal)**\n- **Admin Dashboard & Analytics**\n- **User Authentication (JWT/OAuth)**\n- **AI Assistant / Automation**\n- **Booking / Inventory / CMS**`;
  } else if (!updated.budget) {
    reply = `Understood! Those features are right in our wheelhouse. What estimated **budget range** and **timeline/deadline** are you targeting for this project?`;
  } else {
    // Qualification complete!
    const score = calculateLeadScore(updated);
    const status = getLeadStatus(score);
    const { complexity, devWeeks, devCount, recommendedStack } = getComplexityAndEstimate(updated.projectType, (updated.expectedFeatures || []).length, updated.budget);

    isReadyToConvert = true;
    reply = `🎯 **AI Project Assessment & Technical Blueprint:**\n\n` +
      `• **Lead Score:** **${score}/100** (${status} Lead)\n` +
      `• **Project Complexity:** **${complexity}**\n` +
      `• **Estimated Timeline:** **${devWeeks}**\n` +
      `• **Recommended Team:** **${devCount} Senior Engineers + 1 UI/UX Architect**\n` +
      `• **Recommended Tech Stack:** ${recommendedStack.slice(0, 6).join(', ')}\n\n` +
      `I have qualified your project and automatically created your CRM profile. Would you like me to generate your full **Executive Proposal**, **Quotation**, or **Schedule a Discovery Call** with our engineering lead? 📄📅`;
  }

  return { reply, updatedData: updated, isReadyToConvert };
}

const SYSTEM_PROMPT = `You are a Senior AI Business Consultant & Enterprise Software Architect for "LeadAI Pro". 
Your mission is to qualify prospective business leads, gather technical requirements, recommend architectures, and estimate cost/timelines.

Follow these strict guidelines:
1. Greet professionally and ask ONE question at a time.
2. Inquire about: Name, Email, Company, Country, Business Type (Restaurant, Hospital, Real Estate, AI Startup, Ecommerce, Healthcare, Finance, etc.), Project Type (Website, Mobile App, AI Solution, CRM, ERP, SaaS, etc.), Core Features, Budget, and Deadline.
3. Recommend modern tech stacks: Next.js 15, TypeScript, Tailwind CSS, Node.js, MongoDB, PostgreSQL, Redis, Docker, AWS, Stripe.
4. Calculate Lead Score (0-100), Hot/Warm/Cold classification, and development timeline.
5. Provide structured update block at the end of your response:
[DATA_UPDATE: {"name": "...", "email": "...", "businessType": "...", "projectType": "...", "budget": "...", "deadline": "...", "expectedFeatures": ["..."]}]
When qualified and ready to convert, add: [READY_TO_CONVERT: true]`;

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { message, sessionId, collectedData = {} } = body;

    const activeSessionId = sessionId || `session_default`;

    // Retrieve or create conversation
    let conversation = await Conversation.findOne({ sessionId: activeSessionId });
    if (!conversation) {
      conversation = await Conversation.create({
        sessionId: activeSessionId,
        messages: [{ role: 'assistant', content: INITIAL_GREETING }],
        collectedData: {},
        status: 'active',
      });
    }

    // Append user message
    conversation.messages.push({ role: 'user', content: message });

    let displayMessage = '';
    let updatedData = { ...(conversation.collectedData?.toObject?.() || conversation.collectedData || {}), ...collectedData };
    let isReadyToConvert = false;

    // Check system settings for API Key
    let apiKey = process.env.OPENAI_API_KEY;
    try {
      const settings = await Settings.findOne();
      if (settings?.openaiApiKey) apiKey = settings.openaiApiKey;
    } catch {}

    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        const openai = new OpenAI({ apiKey });
        const messagesPayload = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...conversation.messages.slice(-15).map(m => ({ role: m.role, content: m.content })),
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: messagesPayload,
          temperature: 0.7,
          max_tokens: 800,
        });

        const rawReply = completion.choices[0].message.content;
        const dataMatch = rawReply.match(/\[DATA_UPDATE:\s*({.*?})\]/s);
        if (dataMatch) {
          try {
            const parsed = JSON.parse(dataMatch[1]);
            updatedData = { ...updatedData, ...parsed };
          } catch {}
        }
        if (rawReply.includes('[READY_TO_CONVERT: true]')) {
          isReadyToConvert = true;
        }

        displayMessage = rawReply
          .replace(/\[DATA_UPDATE:.*?\]/gs, '')
          .replace(/\[READY_TO_CONVERT:.*?\]/g, '')
          .trim();
      } catch (err) {
        console.warn('OpenAI fallback engaged:', err.message);
        const heuristic = generateHeuristicResponse(message, conversation.messages, updatedData);
        displayMessage = heuristic.reply;
        updatedData = heuristic.updatedData;
        isReadyToConvert = heuristic.isReadyToConvert;
      }
    } else {
      // Heuristic engine fallback
      const heuristic = generateHeuristicResponse(message, conversation.messages, updatedData);
      displayMessage = heuristic.reply;
      updatedData = heuristic.updatedData;
      isReadyToConvert = heuristic.isReadyToConvert;
    }

    // Save assistant reply
    conversation.messages.push({ role: 'assistant', content: displayMessage });
    conversation.collectedData = updatedData;

    let leadId = conversation.leadId;

    // Convert into Lead if ready with valid email
    if (isReadyToConvert && updatedData.email && (!conversation.isConverted || !leadId)) {
      const leadScore = calculateLeadScore(updatedData);
      const leadStatus = getLeadStatus(leadScore);
      const { complexity, devWeeks, devCount, recommendedStack } = getComplexityAndEstimate(
        updatedData.projectType,
        (updatedData.expectedFeatures || []).length,
        updatedData.budget
      );

      // Check if lead already exists with this email
      let lead = await Lead.findOne({ email: updatedData.email.toLowerCase() });
      if (!lead) {
        lead = await Lead.create({
          name: updatedData.name || 'Qualified Prospect',
          email: updatedData.email.toLowerCase(),
          phone: updatedData.phone || '',
          company: updatedData.company || '',
          country: updatedData.country || '',
          website: updatedData.currentWebsite || '',
          businessType: updatedData.businessType || 'AI Startup',
          projectType: updatedData.projectType || 'AI Solution',
          targetAudience: updatedData.targetAudience || '',
          businessGoals: updatedData.businessGoals || '',
          preferredTechnology: recommendedStack,
          expectedFeatures: Array.isArray(updatedData.expectedFeatures) ? updatedData.expectedFeatures : [],
          budget: {
            raw: updatedData.budget || '$10k - $25k',
            min: 10000,
            max: 25000,
            currency: 'USD',
          },
          deadline: updatedData.deadline || '4-8 weeks',
          urgency: updatedData.urgency || 'Medium',
          leadScore,
          leadStatus,
          projectComplexity: complexity,
          estimatedBudget: updatedData.budget || '$15,000 - $25,000',
          estimatedTimeline: devWeeks,
          recommendedStack,
          requiredDevelopers: devCount,
          aiSummary: `Qualified lead for a ${updatedData.projectType} in the ${updatedData.businessType} sector. Requires ${updatedData.expectedFeatures?.join(', ') || 'core architecture'}.`,
          pipelineStatus: 'Qualified',
          source: 'AI Business Consultant',
        });

        // Activity log
        await ActivityLog.create({
          leadId: lead._id,
          action: 'lead_created',
          title: '🔥 New Lead Qualified by AI Consultant',
          description: `${lead.name} from ${lead.company || 'Enterprise'} (${lead.leadStatus} Lead - Score: ${lead.leadScore})`,
          metadata: { score: lead.leadScore, projectType: lead.projectType },
        });

        // Real-time Notification
        await Notification.create({
          type: 'new_lead',
          title: `🔥 ${lead.leadStatus} Lead: ${lead.name}`,
          message: `Qualified with Score ${leadScore}/100 for ${lead.projectType} (${lead.businessType})`,
          link: `/leads/${lead._id}`,
          metadata: { leadId: lead._id, score: leadScore, status: leadStatus },
        });

        // Trigger Automated Welcome Email if enabled
        const settings = await Settings.findOne();
        if (settings?.automations?.sendWelcomeEmail !== false && lead.email) {
          try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            await sendAutomatedEmail({
              to: lead.email,
              template: 'welcome',
              variables: {
                clientName: lead.name,
                projectType: lead.projectType || 'Software Development',
                portalUrl: `${appUrl}/leads/${lead._id}`,
              },
              leadId: lead._id,
              dedupKey: `welcome_${lead._id}`,
            });
          } catch (mailErr) {
            console.warn('Welcome email trigger notice:', mailErr.message);
          }
        }
      }

      leadId = lead._id;
      conversation.leadId = leadId;
      conversation.isConverted = true;
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
    console.error('Chat API Error:', error);
    return apiError('AI Consultant service error: ' + error.message, 500);
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) return apiError('Session ID is required', 400);

    const conversation = await Conversation.findOne({ sessionId });
    if (!conversation) return apiSuccess({ messages: [{ role: 'assistant', content: INITIAL_GREETING }], collectedData: {} });

    return apiSuccess({
      messages: conversation.messages,
      collectedData: conversation.collectedData,
      leadId: conversation.leadId,
      isConverted: conversation.isConverted,
    });
  } catch (error) {
    return apiError('Failed to retrieve conversation: ' + error.message, 500);
  }
}
