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
    return apiSuccess({ audit, job }, 'Website audit completed via Apify & AI engine');
  } catch (error) {
    console.error('Apify website audit API error:', error);
    return apiError('Failed to audit website with Apify: ' + error.message, 500);
  }
}
