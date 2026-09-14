import { apiSuccess, apiError } from '@/lib/api';
import { getLeadEmailThread } from '@/lib/services/email/thread.service';
import { enqueueForApproval } from '@/lib/services/approvals/approval.service';
import Lead from '@/models/Lead';
import connectDB from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { leadId } = await params;
    const threadData = await getLeadEmailThread(leadId);

    return apiSuccess(threadData || { messages: [], status: 'no_thread' });
  } catch (error) {
    console.error('Thread GET Error:', error);
    return apiError('Failed to fetch thread: ' + error.message, 500);
  }
}

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { leadId } = await params;
    const body = await request.json();
    const { subject, message, sendNow = false } = body;

    const lead = await Lead.findById(leadId);
    if (!lead) return apiError('Lead not found', 404);
    if (!lead.email) return apiError('Lead has no verified email address', 400);

    const queued = await enqueueForApproval({
      organizationId: lead.organizationId,
      type: 'message',
      leadId: lead._id,
      title: `Email Reply to ${lead.companyName || lead.name}`,
      recipient: lead.email,
      channel: 'email',
      subject: subject || `Re: Discussion with ${lead.companyName || lead.name}`,
      content: message,
      aiReasoning: 'Manual or AI reply drafted by CRM user. Awaiting final send authorization.',
      status: sendNow ? 'approved' : 'approval_required',
    });

    return apiSuccess(queued, 'Reply enqueued in Approval Center');
  } catch (error) {
    console.error('Thread POST Error:', error);
    return apiError('Failed to post reply: ' + error.message, 500);
  }
}
