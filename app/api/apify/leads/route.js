import { apiSuccess, apiError } from '@/lib/api';
import { generateLeadsWithApify } from '@/lib/services/apify/apify.service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, location, industry, limit = 5 } = body;

    const result = await generateLeadsWithApify({
      query,
      location,
      industry,
      limit: Number(limit) || 5,
    });

    return apiSuccess(result, `Apify lead generation finished: ${result.savedCount} new leads saved (${result.duplicatesDetected} duplicates filtered)`);
  } catch (error) {
    console.error('Apify lead gen API error:', error);
    return apiError('Failed to generate leads with Apify: ' + error.message, 500);
  }
}
