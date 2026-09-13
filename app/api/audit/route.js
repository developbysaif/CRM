import { apiSuccess, apiError } from '@/lib/api';
import { auditWebsiteWithApify } from '@/lib/services/apify/apify.service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return apiError('Website URL is required', 400);
    }

    const { audit, job } = await auditWebsiteWithApify(url);
    return apiSuccess(audit, 'Website audit completed');
  } catch (error) {
    console.error('Audit route error:', error);
    return apiError('Failed to audit website: ' + error.message, 500);
  }
}
