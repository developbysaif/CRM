/**
 * Unified Pipeline Stages across Leads, Kanban, Reports, Automation, and DB.
 */
export const PIPELINE_STAGES = [
  {
    id: 'New Lead',
    label: 'New Lead',
    shortLabel: 'New',
    order: 1,
    color: 'border-blue-500 bg-blue-50/20 text-blue-600',
    badgeVariant: 'default',
  },
  {
    id: 'Contacted',
    label: 'Contacted',
    shortLabel: 'Contacted',
    order: 2,
    color: 'border-sky-500 bg-sky-50/20 text-sky-600',
    badgeVariant: 'info',
  },
  {
    id: 'Qualified',
    label: 'Qualified',
    shortLabel: 'Qualified',
    order: 3,
    color: 'border-indigo-500 bg-indigo-50/20 text-indigo-600',
    badgeVariant: 'primary',
  },
  {
    id: 'Proposal Sent',
    label: 'Proposal Sent',
    shortLabel: 'Proposal',
    order: 4,
    color: 'border-amber-500 bg-amber-50/20 text-amber-600',
    badgeVariant: 'warning',
  },
  {
    id: 'Negotiation',
    label: 'Negotiation',
    shortLabel: 'Negotiation',
    order: 5,
    color: 'border-purple-500 bg-purple-50/20 text-purple-600',
    badgeVariant: 'purple',
  },
  {
    id: 'Closed Won',
    label: 'Closed Won',
    shortLabel: 'Won',
    order: 6,
    color: 'border-emerald-500 bg-emerald-50/20 text-emerald-600',
    badgeVariant: 'success',
  },
  {
    id: 'Closed Lost',
    label: 'Closed Lost',
    shortLabel: 'Lost',
    order: 7,
    color: 'border-red-500 bg-red-50/20 text-red-600',
    badgeVariant: 'danger',
  },
];

export const PIPELINE_STAGE_IDS = PIPELINE_STAGES.map(s => s.id);

/**
 * Valid Acquisition Sources (distinct from verification status)
 */
export const LEAD_SOURCES = [
  { id: 'google_places', label: 'Google Places' },
  { id: 'apify', label: 'Apify Maps' },
  { id: 'csv_import', label: 'CSV Import' },
  { id: 'manual', label: 'Manual Entry' },
];

/**
 * Supported Organization & Deal Currencies
 */
export const DEFAULT_CURRENCY = 'GBP'; // UK Prospects

export function formatCurrency(amount = 0, currency = DEFAULT_CURRENCY, isMinorUnits = false) {
  const numericAmount = Number(amount) || 0;
  const value = isMinorUnits ? numericAmount / 100 : numericAmount;

  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || DEFAULT_CURRENCY,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value);
  } catch (e) {
    return `£${Math.round(value).toLocaleString()}`;
  }
}
