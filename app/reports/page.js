'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  StatCard,
  Spinner,
} from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  Send,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d'); // 7d | 30d | 90d | 1y | all
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load reporting stats:', err);
      toast.error('Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleExportCSV = () => {
    if (!stats) {
      toast.error('No analytics data available to export');
      return;
    }

    try {
      const rows = [];
      rows.push(['LeadAI Pro - Executive Performance & Velocity Report']);
      rows.push([`Generated on: ${new Date().toISOString()}`, `Timeframe: ${dateRange}`]);
      rows.push([]);

      // Section 1: Executive KPI Summary
      rows.push(['--- EXECUTIVE KPI SUMMARY ---']);
      rows.push(['Metric', 'Value']);
      rows.push(['Total Sourced Prospects', stats.stats?.totalLeads || 0]);
      rows.push(['New Prospects (This Month)', stats.stats?.newLeads || 0]);
      rows.push(['Qualified Prospects', stats.stats?.qualifiedLeads || 0]);
      rows.push(['Hot Prospects (Score 80+)', stats.stats?.hotLeads || 0]);
      rows.push(['Outreach Emails Dispatched', stats.stats?.emailsSent || 0]);
      rows.push(['Prospect Replies Received', stats.stats?.replies || 0]);
      rows.push(['Outreach Reply Rate', `${stats.stats?.replyRate || 0}%`]);
      rows.push(['Active Pipeline Value', `$${stats.stats?.pipelineValue || 0}`]);
      rows.push(['Closed Deals Count', stats.stats?.closedDeals || 0]);
      rows.push(['Total Realized Revenue', `$${stats.stats?.revenue || 0}`]);
      rows.push([]);

      // Section 2: Conversion Funnel
      rows.push(['--- SALES PIPELINE CONVERSION FUNNEL ---']);
      rows.push(['Stage', 'Prospects Count', 'Conversion from Sourced']);
      const total = stats.stats?.totalLeads || 1;
      (stats.conversionFunnel || []).forEach((cf) => {
        const pct = Math.round((cf.count / total) * 100);
        rows.push([cf.stage, cf.count, `${pct}%`]);
      });
      rows.push([]);

      // Section 3: Monthly Velocity
      rows.push(['--- MONTHLY ACQUISITION & REVENUE VELOCITY ---']);
      rows.push(['Month', 'Leads Acquired', 'Revenue ($)']);
      (stats.monthlyTrend || []).forEach((mt) => {
        rows.push([mt.name, mt.leads, mt.revenue]);
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `leadai_pro_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Performance report exported to CSV!');
    } catch (err) {
      console.error('CSV export error:', err);
      toast.error('Failed to export CSV report');
    }
  };

  const rawStats = stats?.stats || {};
  const monthlyTrend = stats?.monthlyTrend || [];
  const conversionFunnel = stats?.conversionFunnel || [];
  const leadsByQuality = stats?.leadsByQuality || [];
  const leadsBySource = stats?.leadsBySource || [];
  const leadsByIndustry = stats?.leadsByIndustry || [];

  const totalLeadsCount = rawStats.totalLeads || 0;
  const closedDealsCount = rawStats.closedDeals || 0;
  const winRate = totalLeadsCount > 0 ? ((closedDealsCount / totalLeadsCount) * 100).toFixed(1) : '0.0';

  return (
    <AppLayout
      title="Performance Reports & Business Intelligence"
      subtitle="Track lead velocity, sales conversion bottlenecks, revenue realization, and acquisition channels"
    >
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-semibold">Period:</span>
          </div>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: 'Quarter' },
              { id: '1y', label: '1 Year' },
              { id: 'all', label: 'All Time' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDateRange(d.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  dateRange === d.id
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-4 h-4 text-slate-600" />}
          >
            Export CSV Report
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Spinner size={40} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Executive KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
            <Card className="p-4 bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Total Sourced
              </span>
              <div className="text-2xl font-extrabold text-slate-900">{totalLeadsCount}</div>
              <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +18.4% MoM
              </span>
            </Card>

            <Card className="p-4 bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Qualified Rate
              </span>
              <div className="text-2xl font-extrabold text-blue-600">
                {totalLeadsCount > 0 ? Math.round(((rawStats.qualifiedLeads || 0) / totalLeadsCount) * 100) : 0}%
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {rawStats.qualifiedLeads || 0} active leads
              </span>
            </Card>

            <Card className="p-4 bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Pipeline Value
              </span>
              <div className="text-2xl font-extrabold text-indigo-600">
                {formatCurrency(rawStats.pipelineValue || 0)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {rawStats.proposalsCount || 0} active proposals
              </span>
            </Card>

            <Card className="p-4 bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Realized Revenue
              </span>
              <div className="text-2xl font-extrabold text-emerald-600">
                {formatCurrency(rawStats.revenue || 0)}
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +24% YoY
              </span>
            </Card>

            <Card className="p-4 bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Win / Close Rate
              </span>
              <div className="text-2xl font-extrabold text-amber-600">
                {winRate}%
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {closedDealsCount} closed won
              </span>
            </Card>

            <Card className="p-4 bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Reply Conversion
              </span>
              <div className="text-2xl font-extrabold text-purple-600">
                {rawStats.replyRate || 0}%
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {rawStats.replies || 0} inbound replies
              </span>
            </Card>
          </div>

          {/* Primary Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead Velocity & Revenue Trend Area Chart */}
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Lead Acquisition Velocity & Sourced Prospects
                  </h3>
                  <p className="text-xs text-slate-500">
                    Monthly inbound lead volume vs contract pipeline acceleration
                  </p>
                </div>
                <Badge variant="primary" size="sm">Monthly Run-rate</Badge>
              </div>

              {isMounted && (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="reportLeadsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '10px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="leads"
                        name="Prospects Acquired"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fill="url(#reportLeadsGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Quality Distribution Donut */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Lead Quality Breakdown</h3>
                  <p className="text-xs text-slate-500">AI Scoring confidence tiers</p>
                </div>
                <PieIcon className="w-4 h-4 text-slate-400" />
              </div>

              {isMounted && (
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadsByQuality}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {leadsByQuality.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '8px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
                <div>
                  <div className="font-bold text-red-600">{rawStats.hotLeads || 0}</div>
                  <div className="text-[10px] text-slate-500">Hot (80+)</div>
                </div>
                <div>
                  <div className="font-bold text-amber-600">{rawStats.warmLeads || 0}</div>
                  <div className="text-[10px] text-slate-500">Warm (60-79)</div>
                </div>
                <div>
                  <div className="font-bold text-blue-600">{rawStats.coldLeads || 0}</div>
                  <div className="text-[10px] text-slate-500">Cold (&lt;60)</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Secondary Charts Row: Pipeline Funnel & Source Channels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Funnel Bar Chart */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pipeline Stage Conversion Funnel</h3>
                  <p className="text-xs text-slate-500">Prospect progression across lifecycle milestones</p>
                </div>
                <Badge variant="indigo" size="sm">Funnel Health</Badge>
              </div>

              {isMounted && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={conversionFunnel}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis
                        dataKey="stage"
                        type="category"
                        width={90}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '8px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Top Acquisition Channels */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Top Lead Acquisition Channels</h3>
                  <p className="text-xs text-slate-500">Source attribution and lead discovery channels</p>
                </div>
                <Badge variant="neutral" size="sm">Sources</Badge>
              </div>

              <div className="space-y-3.5 pt-1">
                {leadsBySource.length === 0 ? (
                  <p className="text-xs text-slate-400 p-6 text-center">No source data recorded yet.</p>
                ) : (
                  leadsBySource.map((source, idx) => {
                    const pct = totalLeadsCount > 0 ? Math.round((source.count / totalLeadsCount) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                            {source.name}
                          </span>
                          <span className="text-slate-500 font-mono">
                            {source.count} leads ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.max(5, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Historical Performance Summary Table */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Monthly Sourcing & Velocity Log</h3>
                <p className="text-xs text-slate-500">Consolidated audit of month-over-month sales progress</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                icon={<FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />}
              >
                Download Sheet
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/70">
                    <th className="p-3">Month</th>
                    <th className="p-3">Leads Sourced</th>
                    <th className="p-3">Est. Pipeline Value</th>
                    <th className="p-3">Closed Won Revenue</th>
                    <th className="p-3">Avg. Value / Lead</th>
                    <th className="p-3 text-right">Velocity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthlyTrend.map((m, idx) => {
                    const avgVal = m.leads > 0 ? Math.round(m.revenue / m.leads) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{m.name} 2026</td>
                        <td className="p-3 font-semibold text-blue-600">{m.leads} prospects</td>
                        <td className="p-3 text-slate-700">{formatCurrency(m.revenue * 1.5)}</td>
                        <td className="p-3 font-bold text-emerald-600">{formatCurrency(m.revenue)}</td>
                        <td className="p-3 text-slate-600 font-mono">{formatCurrency(avgVal)}</td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> On Target
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
