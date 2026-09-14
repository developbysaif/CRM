'use client';
import { useEffect, useState } from 'react';
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
  ArrowRight,
  CheckCircle2,
  Building2,
  Star,
  Zap,
  Bot,
  Activity,
  ChevronRight,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
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

  const s = stats?.stats || {};
  const funnelData = stats?.conversionFunnel || [];
  const monthlyTrend = stats?.monthlyTrend || [];
  const qualityData = stats?.leadsByQuality || [];
  const recentLeads = stats?.recentLeads || [];
  const pendingApprovals = s.pendingApprovals || 0;

  return (
    <AppLayout title="Executive Dashboard" subtitle="Real-time B2B sales automation & pipeline intelligence">
      {/* AI Sales Employee Status & Telemetry Banner */}
      <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/10 shrink-0">
              <Image
                src="/images/crm_ai_agent_avatar.jpg"
                alt="Aura AI Sales Assistant"
                fill
                className="object-cover"
              />
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                  Aura AI Sales Employee
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
                  Autonomous Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring Google Places & Apify registries • Zero Synthetic Data Policy active
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {pendingApprovals > 0 ? (
              <Link
                href="/approvals"
                className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-amber-500/5 animate-pulse"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>{pendingApprovals} Drafts Awaiting Approval</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Approval Queue Clear
              </span>
            )}

            <Link
              href="/discovery"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Launch Discovery</span>
            </Link>

            <Link
              href="/pipeline"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>14-Stage Board</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary 4 Core Stat Cards with Lucide Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Leads */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Leads</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {s.totalLeads || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">+{s.todayLeads || 0}</span>
            <span>discovered today</span>
          </div>
        </div>

        {/* Hot Prospects */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hot Prospects</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {s.hotLeads || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Score 80–100 • High commercial intent
          </div>
        </div>

        {/* Outreach Sent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Outreach Sent</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {s.emailsSent || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-purple-600 font-semibold">{s.replies || 0} replies</span>
            <span>({s.replyRate || 0}% rate)</span>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pipeline Value</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
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
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Interested Leads</div>
            <div className="text-lg font-black text-emerald-600 mt-0.5">{s.interestedLeads || 0}</div>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Reply Rate</div>
            <div className="text-lg font-black text-blue-600 mt-0.5">{s.replyRate || 0}%</div>
          </div>
          <TrendingUp className="w-4 h-4 text-blue-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Proposals & Contracts</div>
            <div className="text-lg font-black text-purple-600 mt-0.5">
              {(s.proposalsCount || 0) + (s.contractsCount || 0)}
            </div>
          </div>
          <FileText className="w-4 h-4 text-purple-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Follow-Ups Pending</div>
            <div className="text-lg font-black text-amber-600 mt-0.5">{s.followUpsPending || 0}</div>
          </div>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                Sales Conversion Funnel
              </h3>
              <p className="text-xs text-slate-400">From discovery to signed contract</p>
            </div>
            <Link href="/pipeline" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View Kanban →
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" tick={{ fill: '#0f172a', fontSize: 11 }} width={95} />
                <Tooltip
                  formatter={(val) => [`${val} prospects`, 'Volume']}
                  contentStyle={{ background: '#0f172a', color: 'white', borderRadius: 8, fontSize: 12, border: 'none' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Quality Distribution Donut */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              Prospect Quality Rating
            </h3>
            <p className="text-xs text-slate-400 mb-4">Based on 0–100 Digital Scoring</p>

            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {qualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0f172a', color: 'white', borderRadius: 8, fontSize: 12, border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-around text-xs font-semibold pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-red-500">● Hot ({s.hotLeads || 0})</span>
            <span className="text-amber-500">● Warm ({s.warmLeads || 0})</span>
            <span className="text-blue-500">● Cold ({s.coldLeads || 0})</span>
          </div>
        </div>
      </div>

      {/* Monthly Velocity Area Chart & Recent Discovered Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Monthly Lead Volume Velocity
          </h3>
          <p className="text-xs text-slate-400 mb-4">Last 6 months discovery & import velocity</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', color: 'white', borderRadius: 8, fontSize: 12, border: 'none' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Discovered Leads */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-500" />
                Recent Discovered Leads
              </h3>
              <Link href="/leads" className="text-xs font-semibold text-blue-600 hover:underline">
                All Leads →
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead._id}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <Link
                      href={`/leads/${lead._id}`}
                      className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 truncate block"
                    >
                      {lead.companyName || lead.company || lead.name}
                    </Link>
                    <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                      <span>{lead.industry || 'Business'}</span>
                      {lead.rating && (
                        <span className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />
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

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-3 text-center">
            <Link
              href="/discovery"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              Discover More Verified Prospects →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
