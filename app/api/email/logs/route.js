import connectDB from '@/lib/db';
import EmailLog from '@/models/EmailLog';
import { apiSuccess, apiError, paginate } from '@/lib/api';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const recipient = searchParams.get('recipient');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const { skip } = paginate(page, limit);

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (recipient) query.recipient = new RegExp(recipient, 'i');

    const [total, logs] = await Promise.all([
      EmailLog.countDocuments(query),
      EmailLog.find(query)
        .populate('leadId', 'name email company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const stats = {
      totalSent: await EmailLog.countDocuments({ status: 'sent' }),
      totalFailed: await EmailLog.countDocuments({ status: 'failed' }),
      totalPending: await EmailLog.countDocuments({ status: 'pending' }),
      totalAll: await EmailLog.countDocuments(),
    };

    return apiSuccess({
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
      stats,
    });
  } catch (error) {
    return apiError('Failed to fetch email logs: ' + error.message, 500);
  }
}
