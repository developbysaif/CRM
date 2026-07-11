import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import Notification from '@/models/Notification';
import { apiSuccess, apiError } from '@/lib/api';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) return apiError('Lead ID required', 400);

    const lead = await Lead.findById(leadId);
    if (!lead) return apiError('Lead not found', 404);

    // Generate proposal content with AI
    const prompt = `Generate a comprehensive professional project proposal for the following client and project:

Client: ${lead.name}
Company: ${lead.company || 'N/A'}
Country: ${lead.country || 'N/A'}
Business Type: ${lead.businessType}
Project Type: ${lead.projectType}
Business Goals: ${lead.businessGoals || 'Not specified'}
Target Audience: ${lead.targetAudience || 'Not specified'}
Budget: ${lead.budget?.raw || 'To be discussed'}
Deadline: ${lead.deadline || 'Flexible'}

Generate a JSON response with these exact fields:
{
  "executiveSummary": "2-3 paragraph executive summary",
  "businessGoals": "detailed business goals section",
  "projectScope": "detailed project scope",
  "features": ["feature1", "feature2", ...],
  "technologyStack": ["tech1", "tech2", ...],
  "timeline": "overall timeline string",
  "milestones": [{"title": "...", "description": "...", "duration": "...", "deliverables": ["..."]}],
  "deliverables": ["deliverable1", "deliverable2", ...],
  "pricing": {
    "subtotal": number,
    "discount": number,
    "tax": number,
    "total": number,
    "currency": "USD",
    "paymentPlan": "payment plan description"
  },
  "terms": "standard terms and conditions",
  "conclusion": "closing paragraph",
  "estimatedTimeline": "e.g., 3-4 months",
  "recommendedStack": ["Next.js", "Node.js", ...],
  "projectComplexity": "Simple|Medium|Complex|Enterprise",
  "requiredDevelopers": number
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const proposalData = JSON.parse(completion.choices[0].message.content);

    // Create proposal in DB
    const proposal = await Proposal.create({
      leadId: lead._id,
      clientName: lead.name,
      clientEmail: lead.email,
      clientCompany: lead.company || '',
      clientCountry: lead.country || '',
      ...proposalData,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    // Update lead
    await Lead.findByIdAndUpdate(leadId, {
      proposalId: proposal._id,
      pipelineStatus: 'Proposal Sent',
      estimatedTimeline: proposalData.estimatedTimeline,
      recommendedStack: proposalData.recommendedStack,
      projectComplexity: proposalData.projectComplexity,
      requiredDevelopers: proposalData.requiredDevelopers,
    });

    await Notification.create({
      type: 'new_lead',
      title: 'Proposal Generated',
      message: `Proposal created for ${lead.name}`,
      link: `/proposals/${proposal._id}`,
    });

    return apiSuccess(proposal, 'Proposal generated successfully', 201);
  } catch (error) {
    console.error('Proposal generation error:', error);
    return apiError('Failed to generate proposal: ' + error.message, 500);
  }
}

export async function GET(request) {
  try {
    const auth = { user: true }; // allow public access for now
    await connectDB();

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    const filter = leadId ? { leadId } : {};
    const proposals = await Proposal.find(filter).populate('leadId', 'name email company').sort({ createdAt: -1 });

    return apiSuccess(proposals);
  } catch (error) {
    return apiError('Failed to fetch proposals', 500);
  }
}
