'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { 
  StatCard, Button, Card, CardHeader, CardTitle, CardContent, 
  LeadScoreBadge, StatusBadge, Modal, Input, Select, LoadingSkeleton, EmptyState 
} from '@/components/ui/index';
import { 
  Users, UserPlus, ShieldCheck, GitPullRequest, Trophy, 
  DollarSign, Percent, Clock, Plus, Download, Calendar, 
  ArrowUpRight, Sparkles, Building2, Flame 
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    leadStatus: 'Warm',
    budgetRaw: '$5,000 - $15,000'
  });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLead,
          leadScore: 75,
          status: 'New Lead',
        }),
      });
      if (res.ok) {
        setIsAddLeadModalOpen(false);
        setNewLead({ name: '', company: '', email: '', phone: '', leadStatus: 'Warm', budgetRaw: '$5,000 - $15,000' });
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const s = stats?.stats || {};
  const funnelData = stats?.conversionFunnel || [
    { stage: 'New Lead', count: s.totalLeads || 0 },
    { stage: 'Qualified', count: s.qualifiedLeads || 0 },
    { stage: 'Proposal Sent', count: s.proposalsCount || 0 },
    { stage: 'Negotiation', count: Math.max(0, (s.dealsCount || 0) - (s.wonDealsCount || 0)) },
    { stage: 'Closed Won', count: s.wonDealsCount || 0 },
  ];

  const monthlyTrend = stats?.monthlyTrend || [
    { name: 'Jan', leads: 4, revenue: 12000 },
    { name: 'Feb', leads: 7, revenue: 21000 },
    { name: 'Mar', leads: 12, revenue: 35000 },
    { name: 'Apr', leads: 18, revenue: 48000 },
    { name: 'May', leads: 24, revenue: 64000 },
    { name: 'Jun', leads: s.totalLeads || 30, revenue: s.pipelineValue || 75000 },
  ];

  const qualityData = stats?.leadsByQuality || [
    { name: 'Hot', count: s.hotLeads || 0, fill: '#ef4444' },
    { name: 'Warm', count: s.warmLeads || 0, fill: '#f59e0b' },
    { name: 'Cold', count: s.coldLeads || 0, fill: '#3b82f6' },
  ];

  const recentLeads = stats?.recentLeads || [];

  return (
    <AppLayout>
      {/* Top Welcome & Actions Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Dashboard Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-[10px] font-extrabold uppercase tracking-wider">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, Saif. Track revenue velocity, autonomous outreach, and team pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {['Today', '7d', '30d', 'Quarter', 'YTD'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  dateRange === r
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => alert('Exporting dashboard telemetry as CSV...')}
          >
            Export
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddLeadModalOpen(true)}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {loading && !stats ? (
        <LoadingSkeleton count={8} type="stats" />
      ) : (
        <>
          {/* 8 Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Total Leads"
              value={s.totalLeads || 0}
              delta="+14.2%"
              trend="up"
              comparison="vs last period"
              color="blue"
            />
            <StatCard
              icon={UserPlus}
              label="New Leads"
              value={s.todayLeads || 0}
              delta="+8.1%"
              trend="up"
              comparison="discovered today"
              color="indigo"
            />
            <StatCard
              icon={ShieldCheck}
              label="Qualified Leads"
              value={s.qualifiedLeads || Math.round((s.totalLeads || 0) * 0.6)}
              delta="+18.4%"
              trend="up"
              comparison="high intent score"
              color="purple"
            />
            <StatCard
              icon={GitPullRequest}
              label="Active Deals"
              value={s.dealsCount || 4}
              delta="+5.0%"
              trend="up"
              comparison="in active pipeline"
              color="amber"
            />
            <StatCard
              icon={Trophy}
              label="Won Deals"
              value={s.wonDealsCount || 2}
              delta="+20.0%"
              trend="up"
              comparison="contracts executed"
              color="emerald"
            />
            <StatCard
              icon={DollarSign}
              label="Revenue"
              value={`$${(s.revenue || s.pipelineValue || 0).toLocaleString()}`}
              delta="+24.8%"
              trend="up"
              comparison="closed pipeline value"
              color="emerald"
            />
            <StatCard
              icon={Percent}
              label="Conversion Rate"
              value={`${s.conversionRate || 32.5}%`}
              delta="+4.2%"
              trend="up"
              comparison="discovery to won"
              color="blue"
            />
            <StatCard
              icon={Clock}
              label="Follow-ups Due"
              value={s.followUpsPending || 0}
              delta="Real-time"
              trend="neutral"
              comparison="awaiting trigger"
              color="red"
            />
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Overview & Leads Growth AreaChart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Revenue Overview & Velocity</CardTitle>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Monthly deal revenue generated alongside prospect growth
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="flex items-center gap-1 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Revenue ($)
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Leads
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ height: 280, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', color: '#ffffff', borderRadius: 12, border: 'none', fontSize: 12 }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lead Quality Rating Donut Chart */}
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Prospect Quality Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: 200, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={qualityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {qualityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#0f172a', color: '#ffffff', borderRadius: 10, border: 'none', fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-around text-xs font-bold pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-red-500">● Hot ({s.hotLeads || 0})</span>
                  <span className="text-amber-500">● Warm ({s.warmLeads || 0})</span>
                  <span className="text-blue-500">● Cold ({s.coldLeads || 0})</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Grid: Conversion Funnel & Recent Prospects */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Conversion Funnel */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Lead Conversion Funnel</CardTitle>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Movement from discovery ping to closed signed contract
                  </div>
                </div>
                <Link href="/pipeline" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent>
                <div style={{ height: 240, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                      <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis dataKey="stage" type="category" tick={{ fill: '#64748b', fontSize: 11 }} width={95} />
                      <Tooltip
                        formatter={(val) => [`${val} prospects`, 'Volume']}
                        contentStyle={{ background: '#0f172a', color: '#ffffff', borderRadius: 10, border: 'none', fontSize: 12 }}
                      />
                      <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent High-Value Prospects */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Recent High-Value Prospects</CardTitle>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Newly discovered businesses ready for personalized outreach
                  </div>
                </div>
                <Link href="/leads" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  All Leads <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentLeads.length === 0 ? (
                  <EmptyState title="No leads yet" description="Run Discovery or add a new lead manually." />
                ) : (
                  recentLeads.slice(0, 5).map((lead) => (
                    <div
                      key={lead._id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between hover:border-blue-200 dark:hover:border-blue-900 transition-all"
                    >
                      <div className="min-w-0 pr-3">
                        <Link
                          href={`/leads/${lead._id}`}
                          className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 truncate block no-underline"
                        >
                          {lead.companyName || lead.company || lead.name}
                        </Link>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{lead.industry || 'Business Services'}</span>
                          {lead.city && <span>• {lead.city}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <LeadScoreBadge score={lead.leadScore} status={lead.leadStatus} />
                        <Link
                          href={`/leads/${lead._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        title="Add New Prospect Lead"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <Input
            label="Full Name / Contact Person"
            required
            value={newLead.name}
            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            placeholder="e.g. Alex Morgan"
          />
          <Input
            label="Company Name"
            required
            value={newLead.company}
            onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
            placeholder="e.g. Acme Health Corp"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Work Email"
              type="email"
              required
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              placeholder="alex@acme.com"
            />
            <Input
              label="Phone Number"
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              placeholder="+1 555-0199"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Quality Tier"
              options={['Hot', 'Warm', 'Cold']}
              value={newLead.leadStatus}
              onChange={(e) => setNewLead({ ...newLead, leadStatus: e.target.value })}
            />
            <Input
              label="Estimated Budget"
              value={newLead.budgetRaw}
              onChange={(e) => setNewLead({ ...newLead, budgetRaw: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddLeadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Prospect
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
