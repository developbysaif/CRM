import connectDB from '@/lib/db';
import Contract from '@/models/Contract';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import Settings from '@/models/Settings';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import ApprovalQueue from '@/models/ApprovalQueue';
import OpenAI from 'openai';

/**
 * Automatically creates a project contract in DRAFT status when a deal is CLOSED WON
 * and triggers immediate CRM Owner Alert Notification
 */
export async function generateDraftContract(leadId, { totalAmount = null, currency = 'USD' } = {}) {
  await connectDB();
  const lead = await Lead.findById(leadId);
  if (!lead) throw new Error('Lead not found');

  const company = lead.companyName || lead.company || lead.name;
  const settings = (await Settings.findOne({ organizationId: lead.organizationId })) || (await Settings.findOne()) || {};
  const agencyName = settings.companyName || 'LeadAI Pro Software Agency';

  // Check if lead already has a proposal for pricing reference
  let contractAmount = totalAmount;
  if (!contractAmount && lead.proposalId) {
    const proposal = await Proposal.findById(lead.proposalId);
    if (proposal?.pricing?.total) {
      contractAmount = proposal.pricing.total;
    }
  }
  if (!contractAmount) contractAmount = 5500;

  let contractClauses = null;
  const apiKey = process.env.OPENAI_API_KEY || settings.openaiApiKey;

  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const openai = new OpenAI({ apiKey });
      const prompt = `Generate a formal commercial software engineering contract for:
Client: ${company} (Contact: ${lead.name}, Email: ${lead.email || 'client@example.com'})
Agency: ${agencyName}
Project: Modern Web Application & Digital System
Total Value: ${contractAmount} ${currency}

Return strict JSON:
{
  "projectDescription": "Comprehensive engineering, UX/UI, and deployment description",
  "projectScope": "Clear technical scope breakdown",
  "deliverables": ["Deliverable 1", "Deliverable 2", "Deliverable 3", "Deliverable 4"],
  "responsibilities": "Client is responsible for providing timely content assets and feedback within 48h. Agency is responsible for architecture, QA, and security.",
  "revisionPolicy": "Up to 2 rounds of standard revisions per milestone. Additional requests handled via written change order at agreed hourly rates.",
  "ownershipClause": "Upon full and final payment, all intellectual property, bespoke source code, and design assets are irrevocably assigned to ${company}.",
  "confidentialityClause": "Both parties agree to hold all technical and business data in strict confidentiality for 5 years.",
  "supportClause": "Agency provides 30 calendar days of post-launch warranty, covering bug fixes and technical stability.",
  "maintenanceClause": "Optional ongoing hosting and SLA maintenance available under separate monthly agreement.",
  "terminationClause": "Either party may terminate upon 14 days written notice. Client compensates agency for completed milestone deliverables.",
  "disputeTerms": "Disputes resolved via good-faith negotiation, followed by binding mediation under governing laws.",
  "governingLaw": "State of California, United States",
  "paymentSchedule": [
    { "milestone": "Deposit upon Contract Signing", "amount": ${Math.round(contractAmount * 0.5)}, "status": "Pending" },
    { "milestone": "Final Handover & Production Launch", "amount": ${Math.round(contractAmount * 0.5)}, "status": "Pending" }
  ]
}`;

      const completion = await openai.chat.completions.create({
        model: settings.openaiModel || 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.25,
        response_format: { type: 'json_object' },
      });

      contractClauses = JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.warn('OpenAI contract synthesis notice:', err.message);
    }
  }

  if (!contractClauses) {
    contractClauses = {
      projectDescription: `Software engineering, UX/UI design, database architecture, and deployment for ${company}'s web application.`,
      projectScope: 'Includes frontend user interface, RESTful backend APIs, database integration, role-based authentication, and 30-day post-launch warranty.',
      deliverables: [
        'Production Next.js Web Application & Source Code Repository',
        'Configured Cloud Hosting & Production Environment',
        'Administrative Management Dashboard',
        'System Architecture & API Documentation',
      ],
      responsibilities: `Client provides domain DNS access and brand assets. ${agencyName} oversees all technical development, deployment, and testing.`,
      revisionPolicy: 'Two rounds of iterative feedback per milestone included. Major scope changes handled via formal change order.',
      ownershipClause: `Upon receipt of full contract payment, all intellectual property rights and repository code transfer irrevocably to ${company}.`,
      confidentialityClause: 'Both parties agree to hold all proprietary trade secrets, customer records, and confidential technical architecture in strict confidence for 5 years.',
      supportClause: 'The Agency provides 30 days of complimentary bug fixes and critical support following production deployment.',
      maintenanceClause: 'Optional ongoing maintenance and SLA hosting available under preferred monthly support terms.',
      terminationClause: 'Either party may terminate this agreement with 14 calendar days written notice. Client is billed solely for completed milestones.',
      disputeTerms: 'Any dispute arising under this Agreement shall first be submitted to good-faith executive mediation.',
      governingLaw: 'State of California, United States',
      paymentSchedule: [
        { milestone: 'Initial Deposit upon Signing', amount: Math.round(contractAmount * 0.5), status: 'Pending' },
        { milestone: 'Final Production Deployment & Handover', amount: Math.round(contractAmount * 0.5), status: 'Pending' },
      ],
    };
  }

  // 1. Create Contract in DRAFT status
  const contract = await Contract.create({
    organizationId: lead.organizationId,
    leadId: lead._id,
    version: 1,
    clientName: lead.name,
    clientEmail: lead.email || '',
    clientCompany: company,
    clientAddress: lead.address || lead.city || lead.country || '',
    clientPhone: lead.phone || '',
    companyName: agencyName,
    companyEmail: settings.companyEmail || 'sales@leadaipro.com',
    companyAddress: settings.companyAddress || '100 Innovation Way, San Francisco, CA',
    projectName: `${lead.projectType || 'Software'} Solution - ${company}`,
    totalAmount: contractAmount,
    currency,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: 'Draft',
    ...contractClauses,
  });

  // 2. Link to Lead
  lead.contractId = contract._id;
  await lead.save();

  // 3. Register in Approval Queue
  const queueItem = await ApprovalQueue.create({
    organizationId: lead.organizationId,
    type: 'contract',
    leadId: lead._id,
    entityId: contract._id,
    title: `Contract Draft: ${contract.contractNumber} for ${company}`,
    recipient: lead.email || 'Client',
    channel: 'contract',
    subject: `Digital Service Contract - ${contract.projectName}`,
    content: contract.projectDescription,
    aiReasoning: `Lead moved to CLOSED WON. Contract automatically prepared for $${contract.totalAmount.toLocaleString()} ${contract.currency}. Awaiting owner review.`,
    payload: { contractId: contract._id, totalAmount: contract.totalAmount },
    status: 'approval_required',
  });

  // 4. CONTRACT ALERT: Immediate Owner Notification
  await Notification.create({
    organizationId: lead.organizationId,
    type: 'contract_signed',
    title: `⚡ Contract Generated: ${company}`,
    message: `Contract ${contract.contractNumber} ($${contract.totalAmount.toLocaleString()} ${contract.currency}) generated for ${company}. Review, Download PDF or Send.`,
    link: `/contracts/${contract._id}`,
  });

  await ActivityLog.create({
    organizationId: lead.organizationId,
    leadId: lead._id,
    action: 'contract_created',
    title: `📝 Contract Draft Prepared: ${contract.contractNumber}`,
    description: `Generated for ${company} ($${contract.totalAmount.toLocaleString()}) upon reaching CLOSED WON.`,
  });

  return { contract, queueItem };
}
