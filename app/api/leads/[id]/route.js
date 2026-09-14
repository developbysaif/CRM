import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import Quotation from '@/models/Quotation';
import Contract from '@/models/Contract';
import Invoice from '@/models/Invoice';
import Meeting from '@/models/Meeting';
import ActivityLog from '@/models/ActivityLog';
import LeadAudit from '@/models/LeadAudit';
import FollowUp from '@/models/FollowUp';
import SuppressionList from '@/models/SuppressionList';
import { apiSuccess, apiError } from '@/lib/api';
import { generateDraftContract } from '@/lib/services/contracts/contract.service';
import { generateDraftProposal } from '@/lib/services/proposals/proposal.service';
import { cancelFollowUpsForLead } from '@/lib/services/followup/followup.service';
import { getLeadEmailThread } from '@/lib/services/email/thread.service';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const lead = await Lead.findById(id).populate('assignedTo', 'name email').lean();
    if (!lead) return apiError('Lead not found', 404);

    const [proposals, quotations, contracts, invoices, meetings, activities, audit, followUps, emailThread] =
      await Promise.all([
        Proposal.find({ leadId: id }).sort({ createdAt: -1 }).lean(),
        Quotation.find({ leadId: id }).sort({ createdAt: -1 }).lean(),
        Contract.find({ leadId: id }).sort({ createdAt: -1 }).lean(),
        Invoice.find({ leadId: id }).sort({ createdAt: -1 }).lean(),
        Meeting.find({ leadId: id }).sort({ startTime: 1 }).lean(),
        ActivityLog.find({ leadId: id }).sort({ createdAt: -1 }).limit(25).lean(),
        LeadAudit.findOne({ $or: [{ leadId: id }, ...(lead.website ? [{ url: lead.website }] : [])] })
          .sort({ createdAt: -1 })
          .lean(),
        FollowUp.find({ leadId: id }).sort({ step: 1 }).lean(),
        getLeadEmailThread(id),
      ]);

    return apiSuccess({
      lead,
      proposals,
      quotations,
      contracts,
      invoices,
      meetings,
      activities,
      audit,
      followUps,
      emailThread,
    });
  } catch (error) {
    console.error('Lead detail error:', error);
    return apiError('Failed to fetch lead: ' + error.message, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const previous = await Lead.findById(id);
    if (!previous) return apiError('Lead not found', 404);

    const updated = await Lead.findByIdAndUpdate(id, body, { new: true, runValidators: true });

    // Handle pipeline stage changes & lifecycle triggers
    if (body.pipelineStatus && body.pipelineStatus !== previous.pipelineStatus) {
      const newStage = body.pipelineStatus;

      await ActivityLog.create({
        organizationId: previous.organizationId,
        leadId: id,
        action: 'stage_changed',
        title: `🔄 Pipeline Stage: ${newStage}`,
        description: `Stage moved from "${previous.pipelineStatus}" to "${newStage}"`,
      });

      // Automation Trigger 1: When lead becomes CLOSED WON -> Auto-generate Contract in DRAFT + Owner Alert
      if (newStage === 'Closed Won') {
        try {
          await generateDraftContract(id);
        } catch (contractErr) {
          console.warn('Auto contract creation notice:', contractErr.message);
        }
      }

      // Automation Trigger 2: When lead becomes INTERESTED -> Auto-generate Proposal in DRAFT
      if (newStage === 'Interested' && !updated.proposalId) {
        try {
          await generateDraftProposal(updated);
        } catch (propErr) {
          console.warn('Auto proposal creation notice:', propErr.message);
        }
      }

      // Automation Trigger 3: When lead is DO NOT CONTACT or CLOSED LOST -> Cancel active followups & suppress
      if (newStage === 'Do Not Contact' || newStage === 'Closed Lost') {
        await cancelFollowUpsForLead(id, `Lead stage moved to ${newStage}`);
        if (newStage === 'Do Not Contact' && updated.email) {
          await SuppressionList.create({
            organizationId: updated.organizationId,
            email: updated.email,
            domain: updated.domain,
            reason: 'do_not_contact',
            source: 'CRM Stage Change',
          });
        }
      }
    }

    if (body.notes && body.notes !== previous.notes) {
      await ActivityLog.create({
        organizationId: previous.organizationId,
        leadId: id,
        action: 'note_added',
        title: `📝 Note Updated`,
        description: body.notes.slice(0, 100) + (body.notes.length > 100 ? '...' : ''),
      });
    }

    return apiSuccess(updated, 'Lead updated successfully');
  } catch (error) {
    return apiError('Failed to update lead: ' + error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) return apiError('Lead not found', 404);
    await cancelFollowUpsForLead(id, 'Lead deleted');
    return apiSuccess(null, 'Lead deleted successfully');
  } catch (error) {
    return apiError('Failed to delete lead: ' + error.message, 500);
  }
}
