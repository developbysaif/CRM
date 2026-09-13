import { apiSuccess, apiError } from '@/lib/api';
import { retryEmail } from '@/lib/services/email/email.service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { logId } = body;

    if (!logId) {
      return apiError('logId is required to retry an email', 400);
    }

    const result = await retryEmail(logId);
    return apiSuccess(result, 'Email retry executed');
  } catch (error) {
    return apiError('Failed to retry email: ' + error.message, 500);
  }
}
