import connectDB from '@/lib/db';
import ApifyJob from '@/models/ApifyJob';
import { apiSuccess, apiError } from '@/lib/api';
import { getActorRun } from '@/lib/services/apify/apify.client';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { runId } = await params;

    const job = await ApifyJob.findOne({
      $or: [{ _id: runId.match(/^[0-9a-fA-F]{24}$/) ? runId : null }, { runId }],
    });

    let liveApifyRun = null;
    if (job?.runId) {
      try {
        liveApifyRun = await getActorRun(job.runId);
      } catch {}
    }

    if (!job && !liveApifyRun) {
      return apiError('Apify run not found', 404);
    }

    return apiSuccess({ job, liveApifyRun });
  } catch (error) {
    return apiError('Failed to fetch Apify run detail: ' + error.message, 500);
  }
}
