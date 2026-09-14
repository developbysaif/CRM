import { apiSuccess, apiError } from '@/lib/api';
import { processDueFollowUps } from '@/lib/services/followup/followup.service';

export async function GET(request) {
  return handleCronJob(request);
}

export async function POST(request) {
  return handleCronJob(request);
}

async function handleCronJob(request) {
  const startTime = Date.now();
  try {
    // Optional bearer token authentication for cron endpoints
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In development or local, allow execution if secret not explicitly enforced
      if (process.env.NODE_ENV === 'production') {
        return apiError('Unauthorized cron request', 401);
      }
    }

    // 1. Process Due Follow-ups (5-step sequence runner with abort guards)
    const followUpStats = await processDueFollowUps();

    const durationMs = Date.now() - startTime;

    return apiSuccess({
      success: true,
      timestamp: new Date().toISOString(),
      durationMs,
      jobs: {
        followUpScheduler: followUpStats,
      },
    }, 'Idempotent automation cron executed successfully');
  } catch (error) {
    console.error('Automation Cron Error:', error);
    return apiError('Automation cron failed: ' + error.message, 500);
  }
}
