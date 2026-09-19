import connectDB from '@/lib/db';
import FollowUp from '@/models/FollowUp';
import Lead from '@/models/Lead';
import SuppressionList from '@/models/SuppressionList';
import ActivityLog from '@/models/ActivityLog';
import ApprovalQueue from '@/models/ApprovalQueue';
import Settings from '@/models/Settings';
import { sendAutomatedEmail } from '@/lib/services/email/email.service';
import { recordEmailMessage } from '@/lib/services/email/thread.service';

/**
 * Schedules the 5-step automated follow-up sequence for a lead
 */
export async function scheduleFollowUpSequence({
  leadId,
  campaignId = null,
  followUpTemplates = [],
  intervalDays = 6,
  organizationId = 'org_default',
}) {
  await connectDB();
  const lead = await Lead.findById(leadId);
  if (!lead) return [];

  // Guard: If lead is in terminal stage (e.g. Answer is NO / Closed Lost / Unsubscribed), DO NOT schedule follow-ups
  const terminalStages = ['Replied', 'Interested', 'Meeting', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost', 'Contract Sent', 'Contract Signed', 'Completed', 'Do Not Contact'];
  if (terminalStages.includes(lead.pipelineStatus) || lead.doNotContact || lead.unsubscribed) {
    return [];
  }

  // Cancel any existing active follow-ups to prevent double-scheduling
  await cancelFollowUpsForLead(leadId, 'Rescheduling follow-up sequence');

  let effectiveInterval = Number(intervalDays) || 6;
  try {
    const settings = await Settings.findOne();
    if (settings?.automations?.followUpIntervalDays) {
      effectiveInterval = settings.automations.followUpIntervalDays;
    }
  } catch {}

  const createdFollowUps = [];
  const now = Date.now();

  for (let i = 0; i < Math.min(followUpTemplates.length, 5); i++) {
    const tpl = followUpTemplates[i];
    const stepNumber = i + 1;
    // Exactly every 6 days: Day 6, Day 12, Day 18, Day 24, Day 30
    const scheduledDate = new Date(now + stepNumber * effectiveInterval * 24 * 60 * 60 * 1000);

    const fu = await FollowUp.create({
      organizationId,
      leadId,
      campaignId,
      step: stepNumber,
      stepName: tpl.name || `Follow-up #${stepNumber}`,
      subject: tpl.subject,
      body: tpl.body,
      scheduledFor: scheduledDate,
      status: 'scheduled',
    });

    createdFollowUps.push(fu);
  }

  // Update lead's next follow up date
  if (createdFollowUps.length > 0) {
    lead.nextFollowUpDate = createdFollowUps[0].scheduledFor;
    await lead.save();
  }

  return createdFollowUps;
}

/**
 * Immediately cancels all scheduled follow-ups for a lead when a terminal event occurs
 * (Replied, Interested, Closed Won/Lost, Unsubscribe, Do Not Contact, Bounced)
 */
export async function cancelFollowUpsForLead(leadId, reason = 'Outreach sequence halted') {
  await connectDB();
  const result = await FollowUp.updateMany(
    {
      leadId,
      status: { $in: ['scheduled', 'approval_required'] },
    },
    {
      $set: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    }
  );

  await Lead.findByIdAndUpdate(leadId, { nextFollowUpDate: null });
  return result;
}

/**
 * Background processor: checks and executes due follow-ups
 * Checks all abort criteria prior to execution.
 */
export async function processDueFollowUps() {
  await connectDB();
  const now = new Date();

  // Find due follow-ups
  const dueFollowUps = await FollowUp.find({
    status: 'scheduled',
    scheduledFor: { $lte: now },
  }).populate('leadId');

  const stats = { processed: 0, sent: 0, cancelled: 0, enqueuedForApproval: 0, errors: [] };

  const settings = (await Settings.findOne()) || {};
  const requireApproval = settings?.automations?.requireApprovalForOutreach !== false;

  for (const fu of dueFollowUps) {
    stats.processed++;
    const lead = fu.leadId;

    if (!lead) {
      fu.status = 'cancelled';
      fu.cancellationReason = 'Lead no longer exists';
      await fu.save();
      stats.cancelled++;
      continue;
    }

    // Abort check 1: Lead status terminal
    const terminalStages = ['Replied', 'Interested', 'Meeting', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost', 'Contract Sent', 'Contract Signed', 'Completed', 'Do Not Contact'];
    if (terminalStages.includes(lead.pipelineStatus) || lead.doNotContact || lead.unsubscribed) {
      fu.status = 'cancelled';
      fu.cancellationReason = `Stage is ${lead.pipelineStatus} / Do Not Contact`;
      await fu.save();
      stats.cancelled++;
      continue;
    }

    // Abort check 2: Suppression list
    const isSuppressed = await SuppressionList.findOne({
      $or: [{ email: lead.email?.toLowerCase() }, { domain: lead.domain || '___' }],
    });
    if (isSuppressed) {
      fu.status = 'cancelled';
      fu.cancellationReason = 'Recipient in suppression list';
      await fu.save();
      stats.cancelled++;
      continue;
    }

    if (!lead.email) {
      fu.status = 'cancelled';
      fu.cancellationReason = 'No email address available for lead';
      await fu.save();
      stats.cancelled++;
      continue;
    }

    if (requireApproval) {
      // Enqueue to Approval Center
      fu.status = 'approval_required';
      await fu.save();

      await ApprovalQueue.create({
        organizationId: fu.organizationId,
        type: 'message',
        leadId: lead._id,
        entityId: fu._id,
        title: `${fu.stepName} for ${lead.companyName || lead.name}`,
        recipient: lead.email,
        channel: 'email',
        subject: fu.subject,
        content: fu.body,
        aiReasoning: `Step ${fu.step} of 5 follow-up sequence. Scheduled cadence reached. No prior reply received.`,
        payload: { followUpId: fu._id, step: fu.step },
        status: 'approval_required',
      });

      stats.enqueuedForApproval++;
    } else {
      // Auto-send if user explicitly disabled approval requirement
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const unsubscribeLink = `${appUrl}/api/unsubscribe/${lead.unsubscribeToken || 'global'}`;
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="white-space: pre-wrap; font-size: 15px;">${fu.body}</div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;" />
            <div style="font-size: 11px; color: #94a3b8;">
              <a href="${unsubscribeLink}" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> to stop future outreach.
            </div>
          </div>
        `;

        const sendRes = await sendAutomatedEmail({
          to: lead.email,
          subject: fu.subject,
          customHtml: emailHtml,
          leadId: lead._id,
        });

        await recordEmailMessage({
          organizationId: fu.organizationId,
          leadId: lead._id,
          direction: 'outbound',
          from: process.env.EMAIL_FROM || 'sales@leadaipro.com',
          to: lead.email,
          subject: fu.subject,
          bodyText: fu.body,
          status: 'sent',
          messageId: sendRes?.id || `fu_${Date.now()}`,
        });

        fu.status = 'sent';
        fu.sentAt = new Date();
        await fu.save();

        lead.followUpCount = (lead.followUpCount || 0) + 1;
        lead.lastContactedAt = new Date();

        // Update next follow up date
        const nextFu = await FollowUp.findOne({
          leadId: lead._id,
          status: 'scheduled',
          step: fu.step + 1,
        });
        lead.nextFollowUpDate = nextFu ? nextFu.scheduledFor : null;
        await lead.save();

        await ActivityLog.create({
          organizationId: fu.organizationId,
          leadId: lead._id,
          action: 'followup_sent',
          title: `✉️ ${fu.stepName} Sent`,
          description: `Dispatched to ${lead.email}`,
        });

        stats.sent++;
      } catch (sendErr) {
        fu.error = sendErr.message;
        await fu.save();
        stats.errors.push({ followUpId: fu._id, error: sendErr.message });
      }
    }
  }

  return stats;
}
