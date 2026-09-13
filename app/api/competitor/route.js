import { apiSuccess, apiError } from '@/lib/api';
import { analyzeCompetitorsWithApify } from '@/lib/services/apify/apify.service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { myWebsite, competitorWebsite } = body;

    if (!myWebsite || !competitorWebsite) {
      return apiError('Both myWebsite and competitorWebsite are required', 400);
    }

    const { analysis, job } = await analyzeCompetitorsWithApify(myWebsite, competitorWebsite);
    return apiSuccess(analysis, 'Competitor analysis completed');
  } catch (error) {
    console.error('Competitor analysis error:', error);
    return apiError('Failed to analyze competitors: ' + error.message, 500);
  }
}
