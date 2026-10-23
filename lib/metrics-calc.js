/**
 * Pure Metric Calculations (Client & Server Safe - Zero Database Dependencies)
 */

/**
 * Strips parentheses and non-alphanumeric chars, taking the first letters of the first two words.
 * For example: "Saif (You)" -> "SA", "Admin User" -> "AU"
 */
export function getInitials(name = 'User') {
  if (!name || typeof name !== 'string') return 'U';
  const clean = name.replace(/\(.*?\)/g, '').replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Calculates Average Deal Size: wonValue / wonDeals
 * Verified: 18 won deals with $115,000 gives exactly $6,389.
 */
export function calculateAverageDealSize(wonRevenue = 0, wonDealsCount = 0) {
  if (!wonDealsCount || wonDealsCount <= 0) return 0;
  return Math.round(Number(wonRevenue) / Number(wonDealsCount));
}

/**
 * Calculates Pipeline Win Rate: won / (won + lost)
 * Definition: Won deals divided by total closed deals.
 */
export function calculateWinRate(wonCount = 0, lostCount = 0) {
  const closedCount = Number(wonCount) + Number(lostCount);
  if (closedCount <= 0) return 0;
  return Number(((Number(wonCount) / closedCount) * 100).toFixed(1));
}

/**
 * Calculates Discovery Conversion: qualified / totalDiscovered
 */
export function calculateDiscoveryConversion(qualifiedCount = 0, totalDiscoveredCount = 0) {
  if (!totalDiscoveredCount || totalDiscoveredCount <= 0) return 0;
  return Number(((Number(qualifiedCount) / Number(totalDiscoveredCount)) * 100).toFixed(1));
}

/**
 * Computes percentage delta between current and previous period.
 * Shows '—' when previous value is 0.
 */
export function calculateDelta(current = 0, previous = 0) {
  const curr = Number(current) || 0;
  const prev = Number(previous) || 0;

  if (prev === 0) {
    return '—';
  }

  const delta = ((curr - prev) / prev) * 100;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}%`;
}

/**
 * Computes pipeline health dynamically.
 * Returns 'No data yet' when there are 0 deals.
 */
export function calculatePipelineHealth({ totalDeals = 0, winRate = 0, activeDeals = 0 } = {}) {
  if (!totalDeals || totalDeals === 0) {
    return {
      status: 'No data yet',
      score: 0,
      description: 'Add or import leads to populate pipeline telemetry',
      color: 'text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-400',
    };
  }

  if (winRate >= 40 && activeDeals >= 5) {
    return {
      status: 'Optimal',
      score: 92,
      description: 'Strong conversion velocity and healthy active pipeline',
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400',
    };
  }

  if (winRate >= 20 || activeDeals >= 2) {
    return {
      status: 'Moderate',
      score: 64,
      description: 'Stable flow; accelerate proposal submissions',
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400',
    };
  }

  return {
    status: 'Needs Attention',
    score: 38,
    description: 'Low velocity; review follow-up sequences and objections',
    color: 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400',
  };
}

/**
 * Resolves Date Range for standard CRM periods
 */
export function getDateRangeForPeriod(period = '30d', now = new Date()) {
  const currentEnd = new Date(now);
  let currentStart = new Date(now);
  let previousStart = new Date(now);
  let previousEnd = new Date(now);

  const cleanPeriod = String(period).toLowerCase().trim();

  if (cleanPeriod === 'today') {
    currentStart.setHours(0, 0, 0, 0);
    previousStart.setDate(previousStart.getDate() - 1);
    previousStart.setHours(0, 0, 0, 0);
    previousEnd.setDate(previousEnd.getDate() - 1);
    previousEnd.setHours(23, 59, 59, 999);
  } else if (cleanPeriod === '7d') {
    currentStart.setDate(currentStart.getDate() - 7);
    previousStart.setDate(previousStart.getDate() - 14);
    previousEnd.setDate(previousEnd.getDate() - 7);
  } else if (cleanPeriod === 'month' || cleanPeriod === '30d') {
    currentStart.setDate(currentStart.getDate() - 30);
    previousStart.setDate(previousStart.getDate() - 60);
    previousEnd.setDate(previousEnd.getDate() - 30);
  } else if (cleanPeriod === 'quarter' || cleanPeriod === '90d') {
    currentStart.setDate(currentStart.getDate() - 90);
    previousStart.setDate(previousStart.getDate() - 180);
    previousEnd.setDate(previousEnd.getDate() - 90);
  } else if (cleanPeriod === 'ytd') {
    currentStart = new Date(now.getFullYear(), 0, 1);
    const daysInYear = Math.floor((currentEnd - currentStart) / (1000 * 60 * 60 * 24));
    previousStart = new Date(now.getFullYear() - 1, 0, 1);
    previousEnd = new Date(now.getFullYear() - 1, 0, 1 + daysInYear);
  } else {
    // 'all' / 'all time'
    currentStart = new Date(0);
    previousStart = new Date(0);
    previousEnd = new Date(0);
  }

  return { currentStart, currentEnd, previousStart, previousEnd };
}
