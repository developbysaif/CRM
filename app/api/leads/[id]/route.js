import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import Quotation from '@/models/Quotation';
import Contract from '@/models/Contract';
import Invoice from '@/models/Invoice';
import Meeting from '@/models/Meeting';
import ActivityLog from '@/models/ActivityLog';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const lead = await Lead.findById(id).populate('assignedTo', 'name email').lean();
    if (!lead) return apiError('Lead not found', 404);

    const [proposals, quotations, contracts, invoices, meetings, activities] = await Promise.all([
      Proposal.find({ leadId: id }).sort({ createdAt: -1 }).lean(),
      Quotation.find({ leadId: id }).sort({ createdAt: -1 }).lean(),
      Contract.find({ leadId: id }).sort({ createdAt: -1 }).lean(),
      Invoice.find({ leadId: id }).sort({ createdAt: -1 }).lean(),
      Meeting.find({ leadId: id }).sort({ startTime: 1 }).lean(),
      ActivityLog.find({ leadId: id }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    return apiSuccess({
      lead,
      proposals,
      quotations,
      contracts,
      invoices,
      meetings,
      activities,
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

    // Track stage changes in activity log
    if (body.pipelineStatus && body.pipelineStatus !== previous.pipelineStatus) {
      await ActivityLog.create({
        leadId: id,
        action: 'stage_changed',
        title: `🔄 Pipeline Stage: ${body.pipelineStatus}`,
        description: `Stage moved from "${previous.pipelineStatus}" to "${body.pipelineStatus}"`,
      });
    }

    if (body.notes && body.notes !== previous.notes) {
      await ActivityLog.create({
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
    return apiSuccess(null, 'Lead deleted successfully');
  } catch (error) {
    return apiError('Failed to delete lead: ' + error.message, 500);
  }
}
