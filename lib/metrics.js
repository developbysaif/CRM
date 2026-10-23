import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import User from '@/models/User';
import Task from '@/models/Task';
import { PIPELINE_STAGES } from '@/lib/constants';
import {
  calculateAverageDealSize,
  calculateWinRate,
  calculateDiscoveryConversion,
  calculateDelta,
  calculatePipelineHealth,
  getDateRangeForPeriod,
} from './metrics-calc';

export {
  calculateAverageDealSize,
  calculateWinRate,
  calculateDiscoveryConversion,
  calculateDelta,
  calculatePipelineHealth,
  getDateRangeForPeriod,
};

/**
 * Fetches reconciled CRM metrics for a specified period from MongoDB
 */
export async function getUnifiedMetrics(period = '30d') {
  await connectDB();

  const { currentStart, currentEnd, previousStart, previousEnd } = getDateRangeForPeriod(period);

  const isAllTime = period === 'all' || period === 'all_time';

  const currentFilter = isAllTime ? {} : { createdAt: { $gte: currentStart, $lte: currentEnd } };
  const prevFilter = isAllTime ? {} : { createdAt: { $gte: previousStart, $lte: previousEnd } };

  // Current period aggregation
  const [
    allLeads,
    prevLeads,
    wonLeads,
    prevWonLeads,
    qualifiedLeads,
    lostLeads,
    channelBreakdown,
  ] = await Promise.all([
    Lead.find(currentFilter).lean(),
    Lead.find(prevFilter).lean(),
    Lead.find({ ...currentFilter, status: 'Closed Won' }).lean(),
    Lead.find({ ...prevFilter, status: 'Closed Won' }).lean(),
    Lead.find({ ...currentFilter, status: { $in: ['Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won'] } }).lean(),
    Lead.find({ ...currentFilter, status: 'Closed Lost' }).lean(),
    Lead.aggregate([
      { $match: currentFilter },
      {
        $group: {
          _id: { $ifNull: ['$source', 'manual'] },
          total: { $sum: 1 },
          qualified: {
            $sum: {
              $cond: [{ $in: ['$status', ['Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won']] }, 1, 0],
            },
          },
          won: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Closed Won'] }, 1, 0],
            },
          },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Closed Won'] }, { $ifNull: ['$dealValue', 0] }, 0],
            },
          },
        },
      },
    ]),
  ]);

  const totalLeads = allLeads.length;
  const prevTotalLeads = prevLeads.length;

  const wonCount = wonLeads.length;
  const prevWonCount = prevWonLeads.length;

  const wonRevenue = wonLeads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);
  const prevWonRevenue = prevWonLeads.reduce((sum, l) => sum + (Number(l.dealValue) || 0), 0);

  const qualifiedCount = qualifiedLeads.length;
  const lostCount = lostLeads.length;

  // KPI Calculations
  const averageDealSize = calculateAverageDealSize(wonRevenue, wonCount);
  const prevAverageDealSize = calculateAverageDealSize(prevWonRevenue, prevWonCount);

  const winRate = calculateWinRate(wonCount, lostCount);
  const discoveryConversion = calculateDiscoveryConversion(qualifiedCount, totalLeads);

  const activeDeals = allLeads.filter(l => !['Closed Won', 'Closed Lost'].includes(l.status)).length;
  const pipelineHealth = calculatePipelineHealth({ totalDeals: totalLeads, winRate, activeDeals });

  // Format single unified channel & sources query
  const channels = channelBreakdown.map(c => {
    return {
      channel: c._id || 'manual',
      source: c._id || 'manual',
      leads: c.total,
      qualified: c.qualified,
      won: c.won,
      revenue: c.revenue,
      winRate: c.qualified > 0 ? Number(((c.won / c.qualified) * 100).toFixed(1)) : 0,
      share: totalLeads > 0 ? Math.round((c.total / totalLeads) * 100) : 0,
    };
  });

  return {
    period,
    kpi: {
      totalRevenue: {
        value: wonRevenue,
        formatted: `£${wonRevenue.toLocaleString()}`,
        delta: calculateDelta(wonRevenue, prevWonRevenue),
      },
      averageDealSize: {
        value: averageDealSize,
        formatted: `£${averageDealSize.toLocaleString()}`,
        delta: calculateDelta(averageDealSize, prevAverageDealSize),
      },
      winRate: {
        value: winRate,
        formatted: `${winRate}%`,
        definition: 'Closed Won ÷ Total Closed Deals',
      },
      discoveryConversion: {
        value: discoveryConversion,
        formatted: `${discoveryConversion}%`,
        definition: 'Qualified Leads ÷ Total Mined Leads',
      },
      totalLeads: {
        value: totalLeads,
        delta: calculateDelta(totalLeads, prevTotalLeads),
      },
      wonDeals: {
        value: wonCount,
        delta: calculateDelta(wonCount, prevWonCount),
      },
      pipelineHealth,
    },
    channels,
    dateRange: {
      currentStart: currentStart.toISOString(),
      currentEnd: currentEnd.toISOString(),
    },
  };
}
