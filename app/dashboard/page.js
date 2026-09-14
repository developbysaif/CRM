'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatCard, Spinner, LeadScoreBadge } from '@/components/ui/index';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
          <div style={{ textAlign: 'center' }}>
            <Spinner size={40} />
            <p style={{ marginTop: 16, color: '#64748b' }}>Aggregating CRM metrics & pipeline data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const s = stats?.stats || {};
  const funnelData = stats?.conversionFunnel || [];
  const monthlyTrend = stats?.monthlyTrend || [];
  const qualityData = stats?.leadsByQuality || [];
  const sourceData = stats?.leadsBySource || [];
  const recentLeads = stats?.recentLeads || [];
  const pendingApprovals = s.pendingApprovals || 0;

  return (
    <AppLayout title="Executive Dashboard" subtitle="Real-time B2B sales automation & pipeline intelligence">
      {/* Pending Approvals Notice Banner */}
      {pendingApprovals > 0 && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: 8,
            padding: '12px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                {pendingApprovals} Items Awaiting Human Authorization
              </span>
              <span style={{ fontSize: 12, color: '#b45309', marginLeft: 8 }}>
                AI has prepared outreach drafts and proposals waiting for your review.
              </span>
            </div>
          </div>
          <Link href="/approvals" className="btn btn-primary btn-sm" style={{ background: '#d97706', borderColor: '#d97706' }}>
            Open Approval Center →
          </Link>
        </div>
      )}

      {/* Top 4 Core Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <StatCard
          icon="👥"
          label="Total Leads"
          value={s.totalLeads || 0}
          subtext={`+${s.todayLeads || 0} discovered today`}
          trend="up"
        />
        <StatCard
          icon="🔥"
          label="Hot Prospects"
          value={s.hotLeads || 0}
          subtext="Score 80-100 high commercial intent"
          trend="up"
        />
        <StatCard
          icon="✉️"
          label="Outreach Sent"
          value={s.emailsSent || 0}
          subtext={`${s.replies || 0} replies (${s.replyRate || 0}% rate)`}
          trend="neutral"
        />
        <StatCard
          icon="💰"
          label="Pipeline Value"
          value={`$${(s.pipelineValue || 0).toLocaleString()}`}
          subtext={`$${(s.revenue || 0).toLocaleString()} closed/signed`}
          trend="up"
        />
      </div>

      {/* Secondary 4 KPI Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Interested Leads
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#059669', marginTop: 2 }}>
            {s.interestedLeads || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Client Reply Rate
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#2563eb', marginTop: 2 }}>
            {s.replyRate || 0}%
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Proposals & Contracts
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#7c3aed', marginTop: 2 }}>
            {(s.proposalsCount || 0) + (s.contractsCount || 0)}
          </div>
        </div>

        <div className="card" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Follow-ups Pending
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#d97706', marginTop: 2 }}>
            {s.followUpsPending || 0}
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Conversion Funnel */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Sales Conversion Funnel
              </h3>
              <div style={{ fontSize: 12, color: '#64748b' }}>From Discovery to Closed Deal</div>
            </div>
            <Link href="/pipeline" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              View Kanban →
            </Link>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis dataKey="stage" type="category" tick={{ fill: '#0f172a', fontSize: 11 }} width={90} />
                <Tooltip
                  formatter={(val) => [`${val} prospects`, 'Volume']}
                  contentStyle={{ background: '#0f172a', color: 'white', borderRadius: 8, fontSize: 12, border: 'none' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Quality Distribution */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            Prospect Quality Rating
          </h3>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>Based on 0-100 Digital Scoring</div>

          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
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

          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 11, fontWeight: 600, marginTop: 8 }}>
            <span style={{ color: '#dc2626' }}>● Hot ({s.hotLeads || 0})</span>
            <span style={{ color: '#d97706' }}>● Warm ({s.warmLeads || 0})</span>
            <span style={{ color: '#2563eb' }}>● Cold ({s.coldLeads || 0})</span>
          </div>
        </div>
      </div>

      {/* Trend Area Chart & Recent Discovered Leads */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Monthly Trend */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            Monthly Lead Volume Trend
          </h3>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Last 6 Months Discovery Rate</div>

          <div style={{ height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', color: 'white', borderRadius: 8, fontSize: 12, border: 'none' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#2563eb" fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Discovered Leads */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Recent Discovered Leads
            </h3>
            <Link href="/leads" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
              All Leads →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentLeads.slice(0, 5).map((lead) => (
              <div
                key={lead._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: '1px solid #f1f5f9',
                  background: '#f8fafc',
                }}
              >
                <div>
                  <Link
                    href={`/leads/${lead._id}`}
                    style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}
                  >
                    {lead.companyName || lead.company || lead.name}
                  </Link>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {lead.industry || 'Business'} {lead.city ? `· ${lead.city}` : ''}
                  </div>
                </div>

                <LeadScoreBadge score={lead.leadScore} status={lead.leadStatus} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
