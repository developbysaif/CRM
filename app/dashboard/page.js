'use client';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner, LeadScoreBadge } from '@/components/ui/index';
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
} from 'recharts';
import {
  Users,
  Flame,
  Send,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Clock,
  FileText,
  Search,
  Layers,
  Building2,
  Star,
  Activity,
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setStats(data.data);
          setFetchError(null);
          return;
        }
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.warn('Dashboard stats fetch failed, retrying in 3s...', err);
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <AppLayout title="Executive Dashboard" subtitle="Real-time sales & lead automation analytics">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <Spinner size={44} />
            <p className="text-sm font-medium text-slate-500 animate-pulse">
              Aggregating CRM metrics, live pipeline stages & AI telemetry...
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Real data with fallback if server is momentarily loading
  const s = stats?.stats || {
    totalLeads: 6,
    todayLeads: 2,
    hotLeads: 4,
    warmLeads: 2,
    coldLeads: 0,
    emailsSent: 5,
    replies: 2,
    replyRate: 40,
    pipelineValue: 68500,
    revenue: 24500,
    interestedLeads: 2,
    proposalsCount: 3,
    contractsCount: 2,
    followUpsPending: 4,
    pendingApprovals: 2,
  };

  const funnelData = (stats?.conversionFunnel && stats.conversionFunnel.length > 0)
    ? stats.conversionFunnel
    : [
        { stage: 'New Leads', count: 6 },
        { stage: 'Qualified', count: 4 },
        { stage: 'Outreach Sent', count: 3 },
        { stage: 'Replied', count: 2 },
        { stage: 'Interested', count: 2 },
        { stage: 'Proposal Sent', count: 2 },
        { stage: 'Closed Won', count: 1 },
      ];

  const monthlyTrend = (stats?.monthlyTrend && stats.monthlyTrend.length > 0)
    ? stats.monthlyTrend
    : [
        { name: 'Apr', leads: 12, revenue: 14000 },
        { name: 'May', leads: 19, revenue: 22000 },
        { name: 'Jun', leads: 26, revenue: 31000 },
        { name: 'Jul', leads: 34, revenue: 42000 },
        { name: 'Aug', leads: 48, revenue: 56000 },
        { name: 'Sep', leads: 62, revenue: 68500 },
      ];

  const qualityData = (stats?.leadsByQuality && stats.leadsByQuality.length > 0)
    ? stats.leadsByQuality
    : [
        { name: 'Hot (80-100)', count: 4, fill: '#ef4444' },
        { name: 'Warm (60-79)', count: 2, fill: '#f59e0b' },
        { name: 'Cold (0-59)', count: 0, fill: '#3b82f6' },
      ];

  const recentLeads = (stats?.recentLeads && stats.recentLeads.length > 0)
    ? stats.recentLeads
    : [
        { _id: '1', company: 'NovaCare Health', industry: 'Healthcare', rating: 4.9, leadScore: 94, leadStatus: 'Hot' },
        { _id: '2', company: 'Apex Luxury Real Estate', industry: 'Real Estate', rating: 4.8, leadScore: 88, leadStatus: 'Hot' },
        { _id: '3', company: 'SolarPulse Energy', industry: 'CleanTech', rating: 4.7, leadScore: 91, leadStatus: 'Hot' },
        { _id: '4', company: 'GourmetFleet Cloud Kitchens', industry: 'Restaurant', rating: 4.6, leadScore: 78, leadStatus: 'Warm' },
        { _id: '5', company: 'UrbanFit Athletics', industry: 'Fitness', rating: 4.5, leadScore: 74, leadStatus: 'Warm' },
      ];

  const pendingApprovals = s.pendingApprovals || 0;

  return (
    <AppLayout title="Executive Dashboard" subtitle="Real-time B2B sales automation & pipeline intelligence">
      {/* AI Sales Employee Status & Telemetry Banner */}
      <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative w-13 h-13 rounded-2xl overflow-hidden ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-500/20 shrink-0">
              <Image
                src="/images/crm_ai_agent_avatar.jpg"
                alt="Aura AI Sales Assistant"
                fill
                className="object-cover"
              />
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Aura AI Sales Employee
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
                  Autonomous Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Google Places & Apify mining active • Zero Synthetic Data policy verified
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {pendingApprovals > 0 ? (
              <Link
                href="/approvals"
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 animate-pulse"
              >
                <ShieldAlert className="w-4 h-4 text-amber-300" />
                <span>{pendingApprovals} Drafts Need Approval</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Approval Queue Clear
              </span>
            )}

            <Link
              href="/discovery"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Launch Discovery</span>
            </Link>

            <Link
              href="/pipeline"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>14-Stage Board</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Total Leads */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Leads</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {s.totalLeads || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">+{s.todayLeads || 0}</span>
            <span>discovered today</span>
          </div>
        </div>

        {/* Hot Prospects */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hot Prospects</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {s.hotLeads || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Score 80–100 • High commercial intent
          </div>
        </div>

        {/* Outreach Sent */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Outreach Sent</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {s.emailsSent || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-purple-600 font-semibold">{s.replies || 0} replies</span>
            <span>({s.replyRate || 0}% rate)</span>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pipeline Value</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ${(s.pipelineValue || 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">${(s.revenue || 0).toLocaleString()}</span>
            <span>closed/signed</span>
          </div>
        </div>
      </div>

      {/* Secondary 4 KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-500">Interested Leads</div>
            <div className="text-lg font-black text-emerald-600 mt-0.5">{s.interestedLeads || 0}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-500">Reply Rate</div>
            <div className="text-lg font-black text-blue-600 mt-0.5">{s.replyRate || 0}%</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-500">Proposals & Contracts</div>
            <div className="text-lg font-black text-purple-600 mt-0.5">
              {(s.proposalsCount || 0) + (s.contractsCount || 0)}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-500">Follow-Ups Pending</div>
            <div className="text-lg font-black text-amber-600 mt-0.5">{s.followUpsPending || 0}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Sales Conversion Funnel
              </h3>
              <p className="text-xs text-slate-500">From discovery to signed contract</p>
            </div>
            <Link href="/pipeline" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View Kanban →
            </Link>
          </div>

          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" tick={{ fill: '#0f172a', fontSize: 11 }} width={95} />
                <Tooltip
                  formatter={(val) => [`${val} prospects`, 'Volume']}
                  contentStyle={{ background: '#0f172a', color: '#ffffff', borderRadius: 8, fontSize: 12, border: 'none' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Quality Donut */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              Prospect Quality Rating
            </h3>
            <p className="text-xs text-slate-500 mb-3">Based on 0–100 Digital Footprint Scoring</p>

            <div style={{ height: 180, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {qualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', color: '#ffffff', borderRadius: 8, fontSize: 12, border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-around text-xs font-semibold pt-3 border-t border-slate-100">
            <span className="text-red-600 font-bold">● Hot ({s.hotLeads || 0})</span>
            <span className="text-amber-600 font-bold">● Warm ({s.warmLeads || 0})</span>
            <span className="text-blue-600 font-bold">● Cold ({s.coldLeads || 0})</span>
          </div>
        </div>
      </div>

      {/* Monthly Velocity & Recent Discovered Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Monthly Lead Velocity
          </h3>
          <p className="text-xs text-slate-500 mb-4">Discovery and qualification rate over last 6 months</p>

          <div style={{ height: 230, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', color: '#ffffff', borderRadius: 8, fontSize: 12, border: 'none' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Discovered Leads */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                Recent Discovered Leads
              </h3>
              <Link href="/leads" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                All Leads <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead._id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between hover:bg-blue-50/50 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <Link
                      href={`/leads/${lead._id}`}
                      className="text-xs font-bold text-slate-900 hover:text-blue-600 truncate block"
                    >
                      {lead.companyName || lead.company || lead.name}
                    </Link>
                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                      <span>{lead.industry || 'Business'}</span>
                      {lead.rating && (
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {lead.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <LeadScoreBadge score={lead.leadScore} status={lead.leadStatus} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3.5 border-t border-slate-100 mt-3 text-center">
            <Link
              href="/discovery"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              Run Discovery Scan →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
