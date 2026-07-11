import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Meeting from '@/models/Meeting';
import { apiSuccess, apiError } from '@/lib/api';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return apiError(auth.error, auth.status);
    await connectDB();

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let filter = {};
    if (leadId) filter.leadId = leadId;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      filter.startTime = { $gte: start, $lte: end };
    }

    const meetings = await Meeting.find(filter)
      .populate('leadId', 'name email company')
      .populate('assignedTo', 'name email')
      .sort({ startTime: 1 });

    return apiSuccess(meetings);
  } catch (error) {
    return apiError('Failed to fetch meetings', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return apiError(auth.error, auth.status);
    await connectDB();

    const body = await request.json();
    const meeting = await Meeting.create(body);

    // Update lead pipeline status
    if (body.leadId) {
      await Lead.findByIdAndUpdate(body.leadId, { pipelineStatus: 'Meeting Scheduled' });
    }

    return apiSuccess(meeting, 'Meeting scheduled successfully', 201);
  } catch (error) {
    console.error('Meeting error:', error);
    return apiError('Failed to schedule meeting', 500);
  }
}
