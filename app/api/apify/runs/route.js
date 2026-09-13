import connectDB from '@/lib/db';
import ApifyJob from '@/models/ApifyJob';
import { apiSuccess, apiError, paginate } from '@/lib/api';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const jobType = searchParams.get('jobType');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const { skip } = paginate(page, limit);

    const query = {};
    if (jobType) query.jobType = jobType;
    if (status) query.status = status;

    const [total, jobs] = await Promise.all([
      ApifyJob.countDocuments(query),
      ApifyJob.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    const stats = {
      totalJobs: await ApifyJob.countDocuments(),
      running: await ApifyJob.countDocuments({ status: 'running' }),
      succeeded: await ApifyJob.countDocuments({ status: 'succeeded' }),
      failed: await ApifyJob.countDocuments({ status: 'failed' }),
      leadGenJobs: await ApifyJob.countDocuments({ jobType: 'lead_generation' }),
      websiteAudits: await ApifyJob.countDocuments({ jobType: 'website_audit' }),
      competitorAnalyses: await ApifyJob.countDocuments({ jobType: 'competitor_analysis' }),
    };

    return apiSuccess({
      jobs,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats,
    });
  } catch (error) {
    return apiError('Failed to fetch Apify runs: ' + error.message, 500);
  }
}
