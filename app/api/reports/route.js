import { getUnifiedMetrics } from '@/lib/metrics';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'Quarter';

    const metrics = await getUnifiedMetrics(period);
    return apiSuccess(metrics, 'Reports metrics calculated');
  } catch (error) {
    console.error('Reports API error:', error);
    return apiError('Failed to load reports metrics: ' + error.message, 500);
  }
}
