import connectDB from '@/lib/db';
import ApprovalQueue from '@/models/ApprovalQueue';
import { apiSuccess, apiError } from '@/lib/api';
import { approveItem, rejectItem, bulkApproveItems } from '@/lib/services/approvals/approval.service';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'approval_required';

    const query = {};
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;

    const items = await ApprovalQueue.find(query)
      .populate('leadId', 'name company companyName email phone leadScore leadStatus website')
      .sort({ createdAt: -1 })
      .lean();

    const counts = {
      all: await ApprovalQueue.countDocuments({ status: 'approval_required' }),
      message: await ApprovalQueue.countDocuments({ type: 'message', status: 'approval_required' }),
      proposal: await ApprovalQueue.countDocuments({ type: 'proposal', status: 'approval_required' }),
      contract: await ApprovalQueue.countDocuments({ type: 'contract', status: 'approval_required' }),
      campaign: await ApprovalQueue.countDocuments({ type: 'campaign', status: 'approval_required' }),
    };

    return apiSuccess({ items, counts });
  } catch (error) {
    console.error('Approvals GET Error:', error);
    return apiError('Failed to fetch approval queue: ' + error.message, 500);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { action, id, ids, reason, sendNow = true } = body;

    if (action === 'approve') {
      if (!id) return apiError('Approval ID is required', 400);
      const result = await approveItem(id, { sendNow });
      return apiSuccess(result, 'Item approved and executed successfully');
    }

    if (action === 'reject') {
      if (!id) return apiError('Approval ID is required', 400);
      const result = await rejectItem(id, reason || 'Rejected by user');
      return apiSuccess(result, 'Item rejected');
    }

    if (action === 'bulk_approve') {
      if (!Array.isArray(ids) || ids.length === 0) {
        return apiError('Array of approval IDs is required', 400);
      }
      const results = await bulkApproveItems(ids);
      return apiSuccess(results, `Bulk approval finished: ${results.approved} approved, ${results.failed} failed`);
    }

    return apiError('Invalid action specified (must be approve, reject, or bulk_approve)', 400);
  } catch (error) {
    console.error('Approvals POST Error:', error);
    return apiError(error.message || 'Failed to process approval action', 500);
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, subject, content, recipient } = body;

    if (!id) return apiError('Approval ID is required', 400);

    const updated = await ApprovalQueue.findByIdAndUpdate(
      id,
      {
        ...(subject !== undefined && { subject }),
        ...(content !== undefined && { content }),
        ...(recipient !== undefined && { recipient }),
      },
      { new: true }
    );

    if (!updated) return apiError('Item not found', 404);
    return apiSuccess(updated, 'Approval item content updated successfully');
  } catch (error) {
    return apiError('Failed to update item: ' + error.message, 500);
  }
}
