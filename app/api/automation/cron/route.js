import crypto from 'crypto';
import { apiSuccess, apiError } from '@/lib/api';
import { processDueFollowUps } from '@/lib/services/followup/followup.service';
import { requireRole } from '@/lib/auth';

export const maxDuration = 60;

function verifyCronSecret(request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);

  const tokenBuf = Buffer.from(token, 'utf8');
  const secretBuf = Buffer.from(cronSecret, 'utf8');

  if (tokenBuf.length !== secretBuf.length) return false;
  return crypto.timingSafeEqual(tokenBuf, secretBuf);
}

/**
 * GET handler - Vercel Cron runner
 * Protected with Authorization: Bearer ${CRON_SECRET} (constant-time compare)
 */
export async function GET(request) {
  if (!verifyCronSecret(request)) {
    return apiError('Unauthorized cron request. Invalid or missing Bearer CRON_SECRET.', 401);
  }

  return executeAutomationCycle();
}

/**
 * POST handler - Manual "Run Now" trigger from Automation page
 * Requires authenticated admin user (or Bearer CRON_SECRET)
 */
export async function POST(request) {
  const isCronAuthorized = verifyCronSecret(request);
  if (!isCronAuthorized) {
    const auth = await requireRole(request, ['admin']);
    if (auth.error) {
      return apiError('Forbidden. Manual cron execution requires an authenticated Admin session.', auth.status || 403);
    }
  }

  return executeAutomationCycle();
}

/**
 * Idempotent execution function with lock & execution telemetry
 */
async function executeAutomationCycle() {
  const startTime = Date.now();
  try {
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
    }, 'Idempotent automation cycle executed successfully');
  } catch (error) {
    console.error('[Automation Cron Error]:', error);
    return apiError('Automation cycle execution failed: ' + error.message, 500);
  }
}
