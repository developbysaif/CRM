import connectDB from '@/lib/db';
import Proposal from '@/models/Proposal';
import Lead from '@/models/Lead';
import Settings from '@/models/Settings';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import ApprovalQueue from '@/models/ApprovalQueue';
import OpenAI from 'openai';

/**
 * Generates an AI-crafted project proposal in DRAFT status and adds it to the Approval Center
 */
export async function generateDraftProposal(lead) {
  await connectDB();
  const company = lead.companyName || lead.company || lead.name;
  const industry = lead.industry || lead.category || lead.businessType || 'business';
  const hasSite = Boolean(lead.website);

  const settings = (await Settings.findOne({ organizationId: lead.organizationId })) || (await Settings.findOne()) || {};
  const companyName = settings.companyName || 'LeadAI Pro Software Agency';

  let apiKey = process.env.OPENAI_API_KEY || settings.openaiApiKey;
  let proposalData = null;

  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const openai = new OpenAI({ apiKey });
      const prompt = `Generate a high-converting software/agency project proposal tailored to this client.
Target Client: ${company}
Contact: ${lead.name}
Industry: ${industry}
Has Website: ${hasSite ? lead.website : 'NO (Needs new web presence)'}
Google Rating: ${lead.rating || 'N/A'} (${lead.reviewCount || 0} reviews)
Agency Name: ${companyName}

Return strict JSON:
{
  "proposalTitle": "Strategic Next.js Digital Transformation & Lead Automation for ${company}",
  "executiveSummary": "2-paragraph executive overview addressing their growth bottlenecks",
  "clientProblem": "Detailed assessment of their commercial and technical friction points",
  "recommendedSolution": "Engineered solution architecture including modern SSR frontend and AI lead capture",
  "projectScope": "Scope description covering UX/UI, frontend, API, database, and launch",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5"],
  "technologyStack": ["Next.js 16", "React 19", "Tailwind CSS", "Node.js", "MongoDB", "OpenAI"],
  "timeline": "3-5 Weeks",
  "milestones": [
    { "title": "Phase 1: Architecture & UX Prototype", "description": "Figma design system and technical schema", "duration": "1 Week", "deliverables": ["Interactive prototype", "Design system"] },
    { "title": "Phase 2: Core Engineering & Integrations", "description": "Full-stack development and responsive layout", "duration": "2 Weeks", "deliverables": ["Web application", "API integration"] },
    { "title": "Phase 3: QA, Performance & Handover", "description": "Lighthouse audit, SEO verification, and cloud deploy", "duration": "1 Week", "deliverables": ["Live deployment", "Documentation"] }
  ],
  "deliverables": [
    "Production Web Application & Complete Source Code",
    "Custom Conversational AI Qualifier Widget",
    "SEO & Core Web Vitals Optimization (95+ score target)",
    "30-Day Post-Launch Technical Warranty"
  ],
  "pricing": {
    "subtotal": 6500,
    "discount": 500,
    "tax": 600,
    "total": 6600,
    "currency": "USD",
    "paymentPlan": "50% upfront deposit upon contract signing, 50% upon final production launch"
  },
  "assumptions": "Client will provide brand assets, copy review turnaround within 48 hours, and domain DNS access.",
  "nextSteps": "1. Approve proposal -> 2. Sign digital contract -> 3. Milestone kickoff sprint",
  "terms": "Work commences immediately upon agreement. Intellectual property transfers upon final invoice settlement.",
  "conclusion": "We look forward to transforming ${company}'s sales funnel and establishing category leadership."
}`;

      const model = process.env.OPENAI_MODEL || settings.openaiModel || 'gpt-4o-mini';
      const completion = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      proposalData = JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.warn('OpenAI token-optimized proposal generation notice:', err.message);
    }
  }

  // Realistic fallback proposal
  if (!proposalData) {
    proposalData = {
      proposalTitle: `Modern Web Presence & Lead Generation for ${company}`,
      executiveSummary: `This executive proposal outlines the deployment of an enterprise Next.js web application and AI sales funnel engineered specifically for ${company}. Our goal is to convert your high local visibility into predictable inbound commercial inquiries.`,
      clientProblem: !hasSite
        ? `${company} has established market demand but lacks an authoritative official web property, losing valuable customers searching online to local competitors.`
        : `${company}'s digital funnel currently has mobile conversion bottlenecks and lacks automated 24/7 client qualification tools.`,
      recommendedSolution: `Deliver a modern, sub-second loading web architecture with built-in conversational AI qualification and one-click scheduling.`,
      projectScope: `Complete end-to-end UX/UI prototype, Next.js App Router engineering, mobile responsiveness, SEO optimization, and production cloud launch.`,
      features: [
        'Next.js 16 Server-Side Rendered Web Architecture',
        'Mobile-First Responsive Layout with Sub-second Load Times',
        '24/7 AI Lead Qualifier & Appointment Scheduler',
        'Google LocalBusiness Schema Markup for Local Rank Boost',
        'SSL Security & Fast Edge CDN Delivery',
      ],
      technologyStack: ['Next.js 16', 'React 19', 'Tailwind CSS', 'Node.js', 'MongoDB', 'OpenAI'],
      timeline: '3-4 Weeks',
      milestones: [
        { title: 'Sprint 1: UX/UI & Technical Architecture', description: 'Wireframes, color styling, and content structure', duration: '1 Week', deliverables: ['Figma Prototype', 'Architecture Spec'] },
        { title: 'Sprint 2: Engineering & Integrations', description: 'Component development, booking forms, and AI widget', duration: '2 Weeks', deliverables: ['Staging Environment', 'AI Integration'] },
        { title: 'Sprint 3: Optimization & Cloud Handover', description: 'Speed audit, cross-device testing, and DNS launch', duration: '1 Week', deliverables: ['Production Deployment', 'Admin Access'] },
      ],
      deliverables: [
        'Production Web Application & Source Code Handover',
        'Interactive AI Lead Capture Assistant',
        'LocalBusiness SEO Schema Implementation',
        '30-Day Complimentary Post-Launch Bug Warranty',
      ],
      pricing: {
        subtotal: 5500,
        discount: 500,
        tax: 500,
        total: 5500,
        currency: 'USD',
        paymentPlan: '50% initial deposit upon contract execution, 50% upon final production deployment.',
      },
      assumptions: 'Timely review of design milestones within 2 business days.',
      nextSteps: '1. Review proposal -> 2. Approve -> 3. Sign standard digital contract',
      terms: 'All intellectual property and code repository ownership transfers to client upon final milestone payment.',
      conclusion: `We are eager to partner with ${company} to unlock modern digital conversion velocity.`,
    };
  }

  // 1. Create Proposal Document with status: 'Draft'
  const proposal = await Proposal.create({
    organizationId: lead.organizationId,
    leadId: lead._id,
    clientName: lead.name,
    clientEmail: lead.email || '',
    clientCompany: company,
    clientCountry: lead.country || lead.city || '',
    ...proposalData,
    status: 'Draft',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  // 2. Link to Lead
  await Lead.findByIdAndUpdate(lead._id, { proposalId: proposal._id });

  // 3. Register in Human Approval Queue
  const queueItem = await ApprovalQueue.create({
    organizationId: lead.organizationId,
    type: 'proposal',
    leadId: lead._id,
    entityId: proposal._id,
    title: `Proposal Draft: ${proposal.proposalNumber} for ${company}`,
    recipient: lead.email || 'Client',
    channel: 'proposal',
    subject: proposal.proposalTitle,
    content: proposal.executiveSummary,
    aiReasoning: `Automatically prepared because ${company} expressed positive interest. Awaiting user review and approval.`,
    payload: { proposalId: proposal._id, total: proposal.pricing?.total },
    status: 'approval_required',
  });

  // 4. Activity Log & Notification
  await ActivityLog.create({
    organizationId: lead.organizationId,
    leadId: lead._id,
    action: 'proposal_created',
    title: `📄 Proposal Prepared: ${proposal.proposalNumber} (DRAFT)`,
    description: `Awaiting human review in Approval Center ($${(proposal.pricing?.total || 0).toLocaleString()})`,
  });

  await Notification.create({
    organizationId: lead.organizationId,
    type: 'general',
    title: `📄 Proposal Draft Ready: ${company}`,
    message: `Proposal ${proposal.proposalNumber} prepared ($${(proposal.pricing?.total || 0).toLocaleString()}). Review and approve in Approval Center.`,
    link: `/approvals`,
  });

  return { proposal, queueItem };
}
