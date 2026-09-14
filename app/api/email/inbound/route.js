import { apiSuccess, apiError } from '@/lib/api';
import { processInboundEmail } from '@/lib/services/email/reply-classifier.service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { leadId, fromEmail, subject, bodyText, messageId } = body;

    if (!bodyText) {
      return apiError('bodyText is required for reply classification', 400);
    }
    if (!leadId && !fromEmail) {
      return apiError('Either leadId or fromEmail is required to associate reply', 400);
    }

    const result = await processInboundEmail({
      leadId,
      fromEmail,
      subject,
      bodyText,
      messageId: messageId || `in_${Date.now()}`,
    });

    return apiSuccess(
      result,
      `Reply classified as "${result.classification.intent}". CRM stage updated to "${result.newStage}".`
    );
  } catch (error) {
    console.error('Inbound Email Processing Error:', error);
    return apiError('Failed to process inbound email: ' + error.message, 500);
  }
}
