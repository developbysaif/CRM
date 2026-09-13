import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import Notification from '@/models/Notification';
import ActivityLog from '@/models/ActivityLog';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api';
import { sendAutomatedEmail } from '@/lib/services/email/email.service';
import OpenAI from 'openai';

function generateFallbackProposal(lead) {
  const projectType = lead.projectType || 'Software Solution';
  const businessType = lead.businessType || 'Enterprise';
  const name = lead.name || 'Valued Client';
  const company = lead.company || `${name}'s Organization`;

  return {
    executiveSummary: `This executive proposal outlines the technical strategy, architecture, and deployment plan for ${company}'s new ${projectType}. Tailored specifically for the ${businessType} domain, this solution modernizes workflows, eliminates operational bottlenecks, and accelerates business growth through intelligent engineering and high-performance cloud architecture.`,
    businessGoals: `1. Accelerate digital customer acquisition and automate lead capture.\n2. Provide a 99.9% uptime, blazing-fast, mobile-optimized experience.\n3. Integrate seamless automated workflows, reporting, and secure payment processing.\n4. Ensure long-term scalability and security compliance.`,
    projectScope: `The project entails end-to-end UX/UI design, full-stack development, database modeling, REST/GraphQL API integration, third-party services configuration (Stripe, Cloudinary, OpenAI), automated testing, and secure production deployment on enterprise cloud infrastructure.`,
    features: [
      'Next.js 15 Server-Side Rendered Architecture & Instant Page Transitions',
      'Interactive AI Lead Capture Assistant & Conversational Qualification',
      'Role-Based Access Control (RBAC) & Secure JWT Authentication',
      'Real-Time Analytics Dashboard with KPIs & Visual Charts',
      'Integrated Stripe / Multi-currency Payment Gateway',
      'Automated Email & Transactional Notification System',
      'Mobile-First Responsive Layout with Dark/Light Mode Support',
    ],
    technologyStack: [
      'Next.js 15 (App Router)',
      'TypeScript',
      'Tailwind CSS',
      'Node.js & Express',
      'MongoDB & Mongoose',
      'Redis Caching',
      'Stripe Payments',
      'Docker & AWS',
      'OpenAI API Integration',
    ],
    timeline: '6-8 Weeks Total Duration',
    milestones: [
      {
        title: 'Phase 1: Architecture, Wireframes & UX/UI Prototyping',
        description: 'Complete user journeys, Figma design system, and technical schema specification.',
        duration: '2 Weeks',
        deliverables: ['Figma interactive prototype', 'Database entity-relationship diagram', 'API specification'],
      },
      {
        title: 'Phase 2: Full-Stack Core Development & Feature Integration',
        description: 'Frontend component building, backend controllers, authentication, and core business logic.',
        duration: '3 Weeks',
        deliverables: ['Responsive web frontend', 'Secure API endpoints', 'Authentication system'],
      },
      {
        title: 'Phase 3: Integrations, AI Automation & Payment Gateway',
        description: 'OpenAI conversational assistant integration, Stripe checkout, and automated notification triggers.',
        duration: '2 Weeks',
        deliverables: ['Live payment processing', 'AI chat consultant', 'Admin dashboard'],
      },
      {
        title: 'Phase 4: QA, Security Audit, Cloud Deployment & Handover',
        description: 'Cross-browser testing, penetration testing, CDN edge configuration, and staff training.',
        duration: '1 Week',
        deliverables: ['Production cloud deployment', 'SSL & DNS handover', 'Documentation & source code access'],
      },
    ],
    deliverables: [
      'Complete Production-Ready Web Application & Source Code',
      'Enterprise Cloud Infrastructure Deployment (AWS / Vercel / MongoDB Atlas)',
      'Admin Management Dashboard & Operational Analytics',
      'Comprehensive Technical & API Documentation',
      '30-Day Post-Launch Warranty & Dedicated Bug Fix Support',
    ],
    pricing: {
      subtotal: 18500,
      discount: 1500,
      tax: 1700,
      total: 18700,
      currency: 'USD',
      paymentPlan: '30% upfront deposit upon contract signing, 40% upon completion of Phase 2 milestone, 30% upon final production launch.',
    },
    terms: `1. All deliverables and source code will be exclusively owned by ${company} upon receipt of final milestone payment.\n2. Includes 30 days of complimentary post-launch maintenance, bug fixing, and technical support.\n3. Scope alterations requested during active development will be evaluated and quoted via formal change orders.`,
    conclusion: `We are enthusiastic about the prospect of engineering this transformative ${projectType} for ${company}. Our team is prepared to commence immediately upon proposal approval.`,
    estimatedTimeline: '6-8 Weeks',
    recommendedStack: ['Next.js 15', 'Node.js', 'MongoDB', 'Redis', 'Docker', 'Stripe'],
    projectComplexity: 'Medium',
    requiredDevelopers: 2,
  };
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { leadId } = body;

    if (!leadId) return apiError('Lead ID is required', 400);

    const lead = await Lead.findById(leadId);
    if (!lead) return apiError('Lead not found', 404);

    let proposalData = null;

    let apiKey = process.env.OPENAI_API_KEY;
    try {
      const settings = await Settings.findOne();
      if (settings?.openaiApiKey) apiKey = settings.openaiApiKey;
    } catch {}

    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        const openai = new OpenAI({ apiKey });
        const prompt = `Generate a comprehensive professional project proposal for the following client:
Client: ${lead.name}
Company: ${lead.company || 'Enterprise'}
Country: ${lead.country || 'USA'}
Business Type: ${lead.businessType}
Project Type: ${lead.projectType}
Goals: ${lead.businessGoals || 'Modernize and scale sales'}
Budget: ${lead.budget?.raw || '$15k - $30k'}
Deadline: ${lead.deadline || '4-8 weeks'}

Return JSON:
{
  "executiveSummary": "2-3 paragraphs",
  "businessGoals": "bullet points",
  "projectScope": "scope description",
  "features": ["feature 1", "feature 2", ...],
  "technologyStack": ["Next.js 15", "Node.js", ...],
  "timeline": "string",
  "milestones": [{"title": "...", "description": "...", "duration": "...", "deliverables": ["..."]}],
  "deliverables": ["del 1", ...],
  "pricing": { "subtotal": number, "discount": number, "tax": number, "total": number, "currency": "USD", "paymentPlan": "..." },
  "terms": "legal terms",
  "conclusion": "closing remarks",
  "estimatedTimeline": "e.g., 6 weeks",
  "recommendedStack": ["..."],
  "projectComplexity": "Simple|Medium|Complex|Enterprise",
  "requiredDevelopers": 2
}`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 2000,
          response_format: { type: 'json_object' },
        });

        proposalData = JSON.parse(completion.choices[0].message.content);
      } catch (err) {
        console.warn('OpenAI proposal error, fallback engaged:', err.message);
      }
    }

    if (!proposalData) {
      proposalData = generateFallbackProposal(lead);
    }

    const proposal = await Proposal.create({
      leadId: lead._id,
      clientName: lead.name,
      clientEmail: lead.email,
      clientCompany: lead.company || '',
      clientCountry: lead.country || '',
      ...proposalData,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Sent',
      sentAt: new Date(),
    });

    await Lead.findByIdAndUpdate(leadId, {
      proposalId: proposal._id,
      pipelineStatus: 'Proposal Sent',
      estimatedTimeline: proposalData.estimatedTimeline || '6-8 weeks',
      recommendedStack: proposalData.recommendedStack || ['Next.js', 'Node.js', 'MongoDB'],
    });

    await ActivityLog.create({
      leadId: lead._id,
      action: 'proposal_created',
      title: `📄 Proposal Created: ${proposal.proposalNumber}`,
      description: `Executive proposal generated for ${lead.name} ($${(proposal.pricing?.total || 0).toLocaleString()})`,
    });

    await Notification.create({
      type: 'proposal_accepted',
      title: `📄 Proposal Generated: ${proposal.proposalNumber}`,
      message: `Created for ${lead.name} (${lead.projectType})`,
      link: `/proposals/${proposal._id}`,
    });

    // Auto-send Proposal Email if configured
    const settings = await Settings.findOne();
    if (settings?.automations?.sendProposalEmail !== false && lead.email) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await sendAutomatedEmail({
          to: lead.email,
          template: 'proposal',
          variables: {
            clientName: lead.name,
            projectName: lead.projectType || 'Software Development',
            proposalNumber: proposal.proposalNumber,
            total: proposal.pricing?.total,
            timeline: proposal.timeline,
            proposalUrl: `${appUrl}/proposals/${proposal._id}`,
          },
          leadId: lead._id,
          dedupKey: `proposal_${proposal._id}`,
        });
      } catch (mailErr) {
        console.warn('Proposal email dispatch notice:', mailErr.message);
      }
    }

    return apiSuccess(proposal, 'Proposal generated successfully', 201);
  } catch (error) {
    console.error('Proposal route error:', error);
    return apiError('Failed to generate proposal: ' + error.message, 500);
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    const filter = leadId ? { leadId } : {};
    const proposals = await Proposal.find(filter).populate('leadId', 'name email company').sort({ createdAt: -1 });

    return apiSuccess(proposals);
  } catch (error) {
    return apiError('Failed to fetch proposals: ' + error.message, 500);
  }
}
