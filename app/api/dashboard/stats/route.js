import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import Contract from '@/models/Contract';
import ActivityLog from '@/models/ActivityLog';
import EmailMessage from '@/models/EmailMessage';
import FollowUp from '@/models/FollowUp';
import ApprovalQueue from '@/models/ApprovalQueue';
import { apiSuccess, apiError } from '@/lib/api';
import { getUnifiedMetrics, getDateRangeForPeriod } from '@/lib/metrics';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    const now = new Date();
    const { currentStart, currentEnd } = getDateRangeForPeriod(period, now);
    const isAllTime = period === 'all' || period === 'all_time';

    const periodFilter = isAllTime ? {} : { createdAt: { $gte: currentStart, $lte: currentEnd } };

    // Fetch unified metrics for reconciliation
    const unified = await getUnifiedMetrics(period);

    const [
      totalLeads,
      todayLeads,
      newLeadsCount,
      qualifiedLeadsCount,
      activeWonLeads,
      emailsSentCount,
      emailsRepliedCount,
      followUpsPendingCount,
      pendingApprovalsCount,
      leadsByStatusAgg,
      leadsBySourceAgg,
      recentLeads,
      recentActivities,
    ] = await Promise.all([
      Lead.countDocuments(periodFilter),
      Lead.countDocuments({ createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } }),
      Lead.countDocuments({ ...periodFilter, status: 'New Lead' }),
      Lead.countDocuments({ ...periodFilter, status: 'Qualified' }),
      Lead.find({ ...periodFilter, status: 'Closed Won' }).select('dealValue').lean(),
      EmailMessage.countDocuments({ direction: 'outbound', status: 'sent' }),
      EmailMessage.countDocuments({ direction: 'inbound' }),
      FollowUp.countDocuments({ status: 'scheduled' }),
      ApprovalQueue.countDocuments({ status: 'approval_required' }),
      Lead.aggregate([
        { $match: periodFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: periodFilter },
        { $group: { _id: { $ifNull: ['$source', 'manual'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Lead.find(periodFilter).sort({ createdAt: -1 }).limit(6).lean(),
      ActivityLog.find().sort({ createdAt: -1 }).limit(8).populate('leadId', 'name company companyName').lean(),
    ]);

    // Reconciled Financials from unified metrics
    const wonRevenue = unified.kpi.totalRevenue.value;
    const closedWonCount = activeWonLeads.length;
    const replyRate = emailsSentCount > 0 ? Math.round((emailsRepliedCount / emailsSentCount) * 100) : 0;

    // Conversion Funnel
    const statusMap = {};
    leadsByStatusAgg.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    const conversionFunnel = [
      { stage: 'New Leads', count: totalLeads },
      { stage: 'Contacted', count: (statusMap['Contacted'] || 0) + (statusMap['Qualified'] || 0) + (statusMap['Proposal Sent'] || 0) + (statusMap['Negotiation'] || 0) + closedWonCount },
      { stage: 'Qualified', count: (statusMap['Qualified'] || 0) + (statusMap['Proposal Sent'] || 0) + (statusMap['Negotiation'] || 0) + closedWonCount },
      { stage: 'Proposal Sent', count: (statusMap['Proposal Sent'] || 0) + (statusMap['Negotiation'] || 0) + closedWonCount },
      { stage: 'Negotiation', count: (statusMap['Negotiation'] || 0) + closedWonCount },
      { stage: 'Closed Won', count: closedWonCount },
    ];

    // Real Monthly Trend (Last 6 Months, zero synthetic inflation)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const mName = monthNames[d.getMonth()];

      const mLeads = await Lead.countDocuments({ createdAt: { $gte: d, $lte: mEnd } });
      const mWon = await Lead.find({ status: 'Closed Won', createdAt: { $gte: d, $lte: mEnd } }).select('dealValue').lean();
      const mRev = mWon.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);

      monthlyTrend.push({
        name: mName,
        leads: mLeads,
        revenue: mRev,
      });
    }

    return apiSuccess({
      stats: {
        totalLeads,
        todayLeads,
        newLeads: newLeadsCount,
        qualifiedLeads: qualifiedLeadsCount,
        closedDeals: closedWonCount,
        emailsSent: emailsSentCount,
        replies: emailsRepliedCount,
        replyRate,
        followUpsPending: followUpsPendingCount,
        pendingApprovals: pendingApprovalsCount,
        revenue: wonRevenue,
        averageDealSize: unified.kpi.averageDealSize.value,
        winRate: unified.kpi.winRate.value,
        deltas: {
          revenue: unified.kpi.totalRevenue.delta,
          averageDealSize: unified.kpi.averageDealSize.delta,
          totalLeads: unified.kpi.totalLeads.delta,
          wonDeals: unified.kpi.wonDeals.delta,
        },
      },
      conversionFunnel,
      monthlyTrend,
      leadsBySource: leadsBySourceAgg.map((s) => ({ name: s._id || 'manual', count: s.count })),
      recentLeads,
      recentActivities,
    });
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return apiError('Failed to fetch dashboard statistics: ' + error.message, 500);
  }
}
