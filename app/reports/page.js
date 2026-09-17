'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, StatCard
} from '@/components/ui/index';
import {
  BarChart3, Download, Calendar, TrendingUp, Users, 
  DollarSign, PieChart as PieIcon, ArrowUpRight, FileText
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

export default function ReportsPage() {
  const [dateFilter, setDateFilter] = useState('Quarter');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.data);
        }
      } catch {}
    }
    loadStats();
  }, []);

  const performanceData = [
    { channel: 'Google Places', discovered: 42, qualified: 28, deals: 6, revenue: 38000 },
    { channel: 'Apify Web Crawler', discovered: 35, qualified: 20, deals: 4, revenue: 26000 },
    { channel: 'Direct / Manual Entry', discovered: 18, qualified: 15, deals: 5, revenue: 32000 },
    { channel: 'Hunter Verification', discovered: 24, qualified: 18, deals: 3, revenue: 19000 },
  ];

  const sourceDonut = [
    { name: 'Google Places API', value: 45, fill: '#2563eb' },
    { name: 'Apify Mining', value: 30, fill: '#4f46e5' },
    { name: 'Manual Additions', value: 25, fill: '#10b981' },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reports & Executive Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time pipeline yield, multi-channel discovery acquisition, and revenue conversion metrics.
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
            onClick={() => alert('Downloading Executive Analytics PDF report...')}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Average Deal Size"
          value="$12,450"
          delta="+8.4%"
          trend="up"
          comparison="vs previous quarter"
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Discovery Conversion"
          value="34.2%"
          delta="+5.1%"
          trend="up"
          comparison="ping to qualified lead"
          color="indigo"
        />
        <StatCard
          icon={DollarSign}
          label="Total Closed Pipeline"
          value={`$${(stats?.stats?.pipelineValue || 115000).toLocaleString()}`}
          delta="+19.2%"
          trend="up"
          comparison="won deals value"
          color="emerald"
        />
        <StatCard
          icon={FileText}
          label="Proposal Win Rate"
          value="68.0%"
          delta="+3.5%"
          trend="up"
          comparison="draft to executed"
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Channel Performance Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Discovery Channel Performance & Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 260, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="channel" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', color: '#ffffff', borderRadius: 10, border: 'none', fontSize: 12 }}
                  />
                  <Bar dataKey="discovered" fill="#93c5fd" name="Discovered" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="qualified" fill="#2563eb" name="Qualified" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="deals" fill="#10b981" name="Deals Won" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lead Source Breakdown Donut */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Sources Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceDonut}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sourceDonut.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', color: '#ffffff', borderRadius: 10, border: 'none', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {sourceDonut.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                    {s.name}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-white">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card hover={false} className="overflow-hidden">
        <CardHeader>
          <CardTitle>Detailed Channel Conversion Matrix</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Acquisition Channel</th>
                <th className="p-4">Prospects Mined</th>
                <th className="p-4">Qualified Prospects</th>
                <th className="p-4">Deals Won</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {performanceData.map((row) => (
                <tr key={row.channel} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{row.channel}</td>
                  <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{row.discovered}</td>
                  <td className="p-4 font-semibold text-blue-600">{row.qualified}</td>
                  <td className="p-4 font-bold text-emerald-600">{row.deals}</td>
                  <td className="p-4 font-extrabold text-slate-900 dark:text-white">${row.revenue.toLocaleString()}</td>
                  <td className="p-4">
                    <Badge variant="success">
                      {Math.round((row.deals / row.qualified) * 100)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
