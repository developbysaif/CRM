import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import { apiSuccess, apiError } from '@/lib/api';
import { generateLeadPersonalization } from '@/lib/services/ai/personalization.service';
import { enqueueForApproval } from '@/lib/services/approvals/approval.service';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const lead = await Lead.findById(id);
    if (!lead) return apiError('Lead not found', 404);

    const personalization = await generateLeadPersonalization(lead);

    return apiSuccess({ lead, personalization });
  } catch (error) {
    console.error('Personalize GET Error:', error);
    return apiError('Failed to generate personalization: ' + error.message, 500);
  }
}

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { enqueue = true } = body;

    const lead = await Lead.findById(id);
    if (!lead) return apiError('Lead not found', 404);

    const personalization = await generateLeadPersonalization(lead);

    let queueItem = null;
    if (enqueue && lead.email) {
      queueItem = await enqueueForApproval({
        organizationId: lead.organizationId,
        type: 'message',
        leadId: lead._id,
        title: `Cold Outreach: ${lead.companyName || lead.company || lead.name}`,
        recipient: lead.email,
        channel: 'email',
        subject: personalization.emailSubject,
        content: personalization.coldEmail,
        aiReasoning: `${personalization.companySummary} Pain points: ${personalization.painPoints.join(', ')}. Recommended pitch: ${personalization.recommendedService}`,
        payload: {
          followUps: personalization.followUps,
          linkedInMessage: personalization.linkedInMessage,
          whatsAppMessage: personalization.whatsAppMessage,
        },
        status: 'approval_required',
      });
    }

    return apiSuccess(
      { personalization, queueItem },
      queueItem
        ? 'AI Personalization generated and submitted to Approval Center'
        : 'AI Personalization generated successfully'
    );
  } catch (error) {
    console.error('Personalize POST Error:', error);
    return apiError('Failed to generate and enqueue personalization: ' + error.message, 500);
  }
}
