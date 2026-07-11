import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import Meeting from '@/models/Meeting';
import Notification from '@/models/Notification';
import { apiSuccess, apiError } from '@/lib/api';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    if (auth.error) return apiError(auth.error, auth.status);

    await connectDB();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [
      totalLeads,
      todayLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      leadsByStatus,
      leadsByIndustry,
      leadsByCountry,
      recentLeads,
      pendingMeetings,
      proposalStats,
      revenueData,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } }),
      Lead.countDocuments({ leadStatus: 'Hot' }),
      Lead.countDocuments({ leadStatus: 'Warm' }),
      Lead.countDocuments({ leadStatus: 'Cold' }),
      Lead.aggregate([
        { $group: { _id: '$pipelineStatus', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Lead.aggregate([
        { $group: { _id: '$businessType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Lead.aggregate([
        { $match: { country: { $ne: '' } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Lead.find().sort({ createdAt: -1 }).limit(10).populate('assignedTo', 'name').lean(),
      Meeting.countDocuments({ status: 'Scheduled', startTime: { $gte: now } }),
      Proposal.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        {
          $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    // Revenue forecast based on hot leads average budget
    const hotLeadsList = await Lead.find({ leadStatus: 'Hot' }).select('budget').lean();
    const revenueForcast = hotLeadsList.reduce((sum, l) => {
      const maxBudget = l.budget?.max || 0;
      return sum + maxBudget;
    }, 0);

    return apiSuccess({
      stats: {
        totalLeads,
        todayLeads,
        hotLeads,
        warmLeads,
        coldLeads,
        pendingMeetings,
        revenueForcast,
      },
      leadsByStatus,
      leadsByIndustry,
      leadsByCountry,
      recentLeads,
      proposalStats,
      revenueData,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return apiError('Failed to fetch dashboard stats', 500);
  }
}
