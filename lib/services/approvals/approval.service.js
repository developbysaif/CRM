import connectDB from '@/lib/db';
import ApprovalQueue from '@/models/ApprovalQueue';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import Contract from '@/models/Contract';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import SuppressionList from '@/models/SuppressionList';
import { sendAutomatedEmail } from '@/lib/services/email/email.service';
import { recordEmailMessage } from '@/lib/services/email/thread.service';
import { scheduleFollowUpSequence } from '@/lib/services/followup/followup.service';

/**
 * Enqueues an AI-generated draft into the Approval Center
 */
export async function enqueueForApproval({
  organizationId = 'org_default',
  type, // 'message' | 'proposal' | 'contract' | 'campaign'
  leadId = null,
  entityId = null,
  title,
  recipient = '',
  channel = 'email',
  subject = '',
  content,
  aiReasoning = '',
  payload = {},
  status = 'approval_required',
}) {
  await connectDB();

  const item = await ApprovalQueue.create({
    organizationId,
    type,
    leadId,
    entityId,
    title,
    recipient,
    channel,
    subject,
    content,
    aiReasoning,
    payload,
    status,
  });

  return item;
}

/**
 * Executes user approval for a queued item
 */
export async function approveItem(approvalId, { userId = null, sendNow = true } = {}) {
  await connectDB();
  const item = await ApprovalQueue.findById(approvalId);
  if (!item) throw new Error('Approval item not found');

  if (item.status === 'sent') {
    throw new Error('This item has already been sent');
  }

  // Handle based on item type
  if (item.type === 'message') {
    const lead = item.leadId ? await Lead.findById(item.leadId) : null;

    // Check suppression list
    const isSuppressed = await SuppressionList.findOne({
      $or: [{ email: item.recipient.toLowerCase() }, { domain: lead?.domain || '___' }],
    });

    if (isSuppressed || lead?.doNotContact || lead?.unsubscribed) {
      item.status = 'rejected';
      item.rejectionReason = 'Recipient is in suppression list or marked Do Not Contact';
      await item.save();
      throw new Error(`Cannot send: ${item.recipient} is in suppression list / unsubscribed`);
    }

    if (sendNow) {
      // 1. Dispatch Email
      let sendResult;
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const unsubscribeLink = `${appUrl}/api/unsubscribe/${lead?.unsubscribeToken || 'global'}`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="white-space: pre-wrap; font-size: 15px;">${item.content}</div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;" />
            <div style="font-size: 11px; color: #94a3b8;">
              You received this email because of your public business profile.
              <br />
              <a href="${unsubscribeLink}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> or reply "Unsubscribe" to stop future contact.
            </div>
          </div>
        `;

        sendResult = await sendAutomatedEmail({
          to: item.recipient,
          subject: item.subject,
          customHtml: emailHtml,
          leadId: lead?._id,
        });
      } catch (sendErr) {
        item.status = 'approved';
        item.error = sendErr.message;
        await item.save();
        throw sendErr;
      }

      // 2. Record in Email Thread & Messages
      if (lead) {
        await recordEmailMessage({
          leadId: lead._id,
          direction: 'outbound',
          from: process.env.EMAIL_FROM || 'sales@leadaipro.com',
          to: item.recipient,
          subject: item.subject,
          bodyText: item.content,
          status: 'sent',
          messageId: sendResult?.id || `out_${Date.now()}`,
        });

        // 3. Move Lead Pipeline Stage to 'Contacted'
        if (['New Lead', 'Qualified'].includes(lead.pipelineStatus)) {
          lead.pipelineStatus = 'Contacted';
          lead.lastContactedAt = new Date();
          await lead.save();

          await ActivityLog.create({
            leadId: lead._id,
            action: 'email_sent',
            title: `✉️ Outreach Sent: "${item.subject}"`,
            description: `Approved and sent to ${item.recipient}`,
          });
        }

        // 4. Schedule 5-step automated follow-up sequence if lead has follow-up drafts
        if (item.payload?.followUps && Array.isArray(item.payload.followUps)) {
          await scheduleFollowUpSequence({
            leadId: lead._id,
            followUpTemplates: item.payload.followUps,
          });
        }
      }

      item.status = 'sent';
      item.sentAt = new Date();
    } else {
      item.status = 'approved';
    }
  } else if (item.type === 'proposal') {
    if (item.entityId) {
      const proposal = await Proposal.findById(item.entityId);
      if (proposal) {
        proposal.status = sendNow ? 'Sent' : 'Approved';
        proposal.approvedAt = new Date();
        proposal.approvedBy = userId;
        if (sendNow) proposal.sentAt = new Date();
        await proposal.save();

        if (sendNow && proposal.clientEmail) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          await sendAutomatedEmail({
            to: proposal.clientEmail,
            template: 'proposal',
            variables: {
              clientName: proposal.clientName,
              projectName: proposal.proposalTitle,
              proposalNumber: proposal.proposalNumber,
              total: proposal.pricing?.total,
              timeline: proposal.timeline,
              proposalUrl: `${appUrl}/proposals/${proposal._id}`,
            },
            leadId: proposal.leadId,
            dedupKey: `prop_${proposal._id}`,
          });
        }

        await Lead.findByIdAndUpdate(proposal.leadId, { pipelineStatus: 'Proposal Sent' });
      }
    }
    item.status = sendNow ? 'sent' : 'approved';
    item.sentAt = new Date();
  } else if (item.type === 'contract') {
    if (item.entityId) {
      const contract = await Contract.findById(item.entityId);
      if (contract) {
        contract.status = sendNow ? 'Sent' : 'Approved';
        contract.approvedAt = new Date();
        contract.approvedBy = userId;
        if (sendNow) contract.sentAt = new Date();
        await contract.save();

        if (sendNow && contract.clientEmail) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          await sendAutomatedEmail({
            to: contract.clientEmail,
            template: 'contract',
            variables: {
              clientName: contract.clientName,
              projectName: contract.projectName,
              contractNumber: contract.contractNumber,
              totalAmount: contract.totalAmount,
              contractUrl: `${appUrl}/contracts/${contract._id}`,
            },
            leadId: contract.leadId,
            dedupKey: `con_${contract._id}`,
          });
        }

        await Lead.findByIdAndUpdate(contract.leadId, { pipelineStatus: 'Contract Sent' });
      }
    }
    item.status = sendNow ? 'sent' : 'approved';
    item.sentAt = new Date();
  }

  item.approvedAt = new Date();
  item.approvedBy = userId;
  await item.save();

  return item;
}

/**
 * Rejects an item with an optional reason
 */
export async function rejectItem(approvalId, reason = 'User rejected') {
  await connectDB();
  const item = await ApprovalQueue.findById(approvalId);
  if (!item) throw new Error('Approval item not found');

  item.status = 'rejected';
  item.rejectedAt = new Date();
  item.rejectionReason = reason;
  await item.save();

  return item;
}

/**
 * Bulk approval of multiple items
 */
export async function bulkApproveItems(approvalIds, userId = null) {
  const results = { approved: 0, failed: 0, errors: [] };
  for (const id of approvalIds) {
    try {
      await approveItem(id, { userId, sendNow: true });
      results.approved++;
    } catch (err) {
      results.failed++;
      results.errors.push({ id, error: err.message });
    }
  }
  return results;
}
