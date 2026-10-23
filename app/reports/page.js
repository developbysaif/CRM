'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, StatCard, LoadingSkeleton, EmptyState
} from '@/components/ui/index';
import {
  BarChart3, Download, TrendingUp, Users, 
  DollarSign, PieChart as PieIcon, ArrowUpRight, FileText
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import { formatCurrency } from '@/lib/constants';

const CHANNEL_COLORS = {
  google_places: '#2563eb',
  apify: '#4f46e5',
  csv_import: '#10b981',
  manual: '#f59e0b',
};

const CHANNEL_LABELS = {
  google_places: 'Google Places API',
  apify: 'Apify Maps Mining',
  csv_import: 'CSV Bulk Import',
  manual: 'Direct / Manual Entry',
};

export default function ReportsPage() {
  const [dateFilter, setDateFilter] = useState('Quarter');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?period=${encodeURIComponent(dateFilter)}`);
        if (res.ok) {
          const data = await res.json();
          setReportData(data.data);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [dateFilter]);

  const kpi = reportData?.kpi || {};
  const channels = reportData?.channels || [];

  const donutData = channels.map((c) => ({
    name: CHANNEL_LABELS[c.channel] || c.channel,
    value: c.leads || 0,
    fill: CHANNEL_COLORS[c.channel] || '#64748b',
  })).filter(d => d.value > 0);

  const totalLeads = kpi.totalLeads?.value || 0;
  const wonRevenue = kpi.totalRevenue?.value || 0;

  return (
    <AppLayout title="Reports & Analytics">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reports & Executive Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reconciled pipeline yield, verified multi-channel acquisition, and closed revenue metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {['Month', 'Quarter', 'YTD', 'All Time'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDateFilter(d)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  dateFilter === d
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            icon={Download}
            onClick={() => window.print()}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Average Deal Size"
          value={loading ? '...' : (kpi.averageDealSize?.formatted || '£0')}
          delta={kpi.averageDealSize?.delta || '—'}
          trend={kpi.averageDealSize?.delta?.startsWith('+') ? 'up' : 'neutral'}
          comparison={`vs previous ${dateFilter.toLowerCase()}`}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Discovery Conversion"
          value={loading ? '...' : (kpi.discoveryConversion?.formatted || '0%')}
          delta={kpi.totalLeads?.delta || '—'}
          trend="neutral"
          comparison="qualified ÷ mined leads"
          color="indigo"
        />
        <StatCard
          icon={DollarSign}
          label="Total Closed Revenue"
          value={loading ? '...' : (kpi.totalRevenue?.formatted || '£0')}
          delta={kpi.totalRevenue?.delta || '—'}
          trend={kpi.totalRevenue?.delta?.startsWith('+') ? 'up' : 'neutral'}
          comparison="won deals value"
          color="emerald"
        />
        <StatCard
          icon={FileText}
          label="Pipeline Win Rate"
          value={loading ? '...' : (kpi.winRate?.formatted || '0%')}
          delta={kpi.wonDeals?.delta || '—'}
          trend={kpi.winRate?.value > 0 ? 'up' : 'neutral'}
          comparison="won ÷ total closed"
          color="purple"
        />
      </div>

      {/* Performance Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Channel Breakdown Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Acquisition Channel Performance
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {dateFilter} Window
              </Badge>
            </CardHeader>

            <CardContent>
              {loading ? (
                <LoadingSkeleton count={3} />
              ) : channels.length === 0 ? (
                <EmptyState
                  title="No Acquisition Data"
                  description="Generate leads or import CSVs to see channel performance and conversion rates."
                  actionLabel="Go to Leads"
                  onAction={() => window.location.href = '/leads'}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3">Source Channel</th>
                        <th className="pb-3 text-right">Mined Leads</th>
                        <th className="pb-3 text-right">Qualified</th>
                        <th className="pb-3 text-right">Won Deals</th>
                        <th className="pb-3 text-right">Revenue</th>
                        <th className="pb-3 text-right">Conv Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {channels.map((row) => (
                        <tr key={row.channel} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 font-semibold text-slate-900 dark:text-white">
                            {CHANNEL_LABELS[row.channel] || row.channel}
                          </td>
                          <td className="py-3 text-right text-slate-600 dark:text-slate-300">{row.leads}</td>
                          <td className="py-3 text-right text-indigo-600 dark:text-indigo-400 font-bold">{row.qualified}</td>
                          <td className="py-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">{row.won}</td>
                          <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                            {formatCurrency(row.revenue)}
                          </td>
                          <td className="py-3 text-right text-slate-500">
                            {row.winRate}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Source Attribution Donut */}
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                Lead Source Share
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-56 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : donutData.length === 0 ? (
                <div className="h-56 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                    <PieIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    No lead sources recorded
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Sources will populate as leads are added.
                  </span>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
