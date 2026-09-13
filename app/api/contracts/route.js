import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Contract from '@/models/Contract';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api';
import { sendAutomatedEmail } from '@/lib/services/email/email.service';
import OpenAI from 'openai';

function generateFallbackContract(lead, totalAmount, currency) {
  const company = lead.company || lead.name;
  const numAmount = Number(totalAmount) || 16500;

  return {
    projectDescription: `Software engineering, UX/UI design, database architecture, and deployment for ${company}'s ${lead.projectType || 'Software'} application.`,
    projectScope: 'Includes frontend user interface, RESTful backend APIs, database integration, role-based authentication, payment gateway setup, and 30-day post-launch warranty.',
    ownershipClause: `Upon receipt of full contract payment, all intellectual property rights, proprietary source code, assets, and documentation shall be irrevocably transferred to ${company}. The Agency retains no ongoing claim to the resulting work product.`,
    confidentialityClause: 'Both parties agree to hold all proprietary trade secrets, business logic, customer records, and confidential technical architecture in strict confidence for a period of 5 years following project completion.',
    supportClause: 'The Agency provides 90 days of complimentary bug fixes, patch updates, and critical support following the production deployment date.',
    maintenanceClause: 'Optional ongoing maintenance, SLA hosting support, and feature expansion may be engaged at a preferred rate of $75/hour.',
    terminationClause: 'Either party may terminate this agreement with 14 calendar days written notice. In the event of early termination, the Client shall be invoiced solely for work delivered and milestones completed through the termination date.',
    governingLaw: 'This Agreement shall be governed by and construed in accordance with the laws of the State of California, United States.',
    deliverables: [
      'Production Web Application & Complete Source Code Repository',
      'Configured Cloud Hosting & Production Environment',
      'Administrative CMS / Management Dashboard',
      'System Architecture & API Documentation',
    ],
    paymentSchedule: [
      { milestone: 'Initial Deposit & Project Kickoff', amount: Math.round(numAmount * 0.35), status: 'Pending' },
      { milestone: 'Midpoint Feature Delivery & Testing', amount: Math.round(numAmount * 0.4), status: 'Pending' },
      { milestone: 'Final Production Deployment & Handover', amount: Math.round(numAmount * 0.25), status: 'Pending' },
    ],
  };
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { leadId, totalAmount, currency = 'USD' } = body;

    if (!leadId) return apiError('Lead ID is required', 400);

    const lead = await Lead.findById(leadId);
    if (!lead) return apiError('Lead not found', 404);

    let contractContent = null;

    let apiKey = process.env.OPENAI_API_KEY;
    try {
      const settings = await Settings.findOne();
      if (settings?.openaiApiKey) apiKey = settings.openaiApiKey;
    } catch {}

    if (apiKey && apiKey.startsWith('sk-')) {
      try {
        const openai = new OpenAI({ apiKey });
        const prompt = `Generate a formal software development legal contract for:
Client: ${lead.name} (${lead.company || 'Enterprise'})
Email: ${lead.email}
Project: ${lead.projectType}
Total: ${totalAmount || 15000} ${currency}

Return JSON with ownershipClause, confidentialityClause, supportClause, maintenanceClause, terminationClause, governingLaw, deliverables (array), paymentSchedule (array of objects), projectDescription.`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: 'json_object' },
        });

        contractContent = JSON.parse(completion.choices[0].message.content);
      } catch (err) {
        console.warn('OpenAI contract error, using fallback:', err.message);
      }
    }

    if (!contractContent) {
      contractContent = generateFallbackContract(lead, totalAmount, currency);
    }

    const contract = await Contract.create({
      leadId: lead._id,
      clientName: lead.name,
      clientEmail: lead.email,
      clientCompany: lead.company || '',
      clientAddress: lead.country || '',
      clientPhone: lead.phone || '',
      projectName: `${lead.projectType || 'Software'} - ${lead.company || lead.name}`,
      totalAmount: totalAmount || 16500,
      currency,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: 'Sent',
      sentAt: new Date(),
      ...contractContent,
    });

    await Lead.findByIdAndUpdate(leadId, {
      contractId: contract._id,
      pipelineStatus: 'Negotiation',
    });

    await ActivityLog.create({
      leadId: lead._id,
      action: 'contract_created',
      title: `📝 Contract Generated: ${contract.contractNumber}`,
      description: `Contract for ${contract.projectName} ($${(contract.totalAmount || 0).toLocaleString()})`,
    });

    await Notification.create({
      type: 'contract_signed',
      title: `📝 Contract ${contract.contractNumber} Prepared`,
      message: `Contract for ${lead.name} is ready for digital signature`,
      link: `/contracts/${contract._id}`,
    });

    // Auto-send Contract Email if configured
    const settings = await Settings.findOne();
    if (settings?.automations?.sendContractEmail !== false && lead.email) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await sendAutomatedEmail({
          to: lead.email,
          template: 'contract',
          variables: {
            clientName: lead.name,
            projectName: contract.projectName,
            contractNumber: contract.contractNumber,
            contractUrl: `${appUrl}/contracts/${contract._id}`,
          },
          leadId: lead._id,
          dedupKey: `contract_${contract._id}`,
        });
      } catch (mailErr) {
        console.warn('Contract email dispatch notice:', mailErr.message);
      }
    }

    return apiSuccess(contract, 'Contract generated successfully', 201);
  } catch (error) {
    console.error('Contract error:', error);
    return apiError('Failed to generate contract: ' + error.message, 500);
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const filter = leadId ? { leadId } : {};
    const contracts = await Contract.find(filter).populate('leadId', 'name email company').sort({ createdAt: -1 });
    return apiSuccess(contracts);
  } catch (error) {
    return apiError('Failed to fetch contracts', 500);
  }
}
