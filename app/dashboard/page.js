'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatCard, Spinner, EmptyState } from '@/components/ui/index';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const PIPELINE_COLORS = {
  'New Lead': '#6366f1',
  Qualified: '#06b6d4',
  'Proposal Sent': '#f59e0b',
  'Meeting Scheduled': '#8b5cf6',
  Negotiation: '#f97316',
  'Contract Signed': '#10b981',
  'Invoice Sent': '#3b82f6',
  'Payment Received': '#059669',
  Completed: '#047857',
  Lost: '#ef4444',
};

const PIE_COLORS = ['#0052ff', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316', '#3b82f6'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
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
            <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Aggregating CRM metrics & pipeline data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const s = stats?.stats || {};
  const pipelineData = (stats?.leadsByStatus || []).map((d) => ({
    name: d._id,
    value: d.count,
    color: PIPELINE_COLORS[d._id] || '#0052ff',
  }));
  const industryData = (stats?.leadsByIndustry || []).slice(0, 6).map((d) => ({ name: d._id, count: d.count }));
  const countryData = (stats?.leadsByCountry || []).slice(0, 6);
  const monthlyTrend = stats?.monthlyTrend || [
    { name: 'Jan', leads: 12, revenue: 14500 },
    { name: 'Feb', leads: 19, revenue: 24000 },
    { name: 'Mar', leads: 28, revenue: 38500 },
    { name: 'Apr', leads: 34, revenue: 49000 },
    { name: 'May', leads: 48, revenue: 67000 },
  ];

  return (
    <AppLayout title="Executive Dashboard" subtitle="AI-driven lead generation & sales automation pipeline">
      {/* Quick Action Banner */}
      <div
        className="card"
        style={{
          padding: '18px 24px',
          marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(0,82,255,0.06), rgba(124,58,237,0.06))',
          border: '1px solid rgba(0,82,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}
          >
            🤖
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>AI Sales Consultant Active</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Automatically qualifying leads, estimating project budgets, and generating executive proposals.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/chat" className="btn btn-primary btn-sm">
            🤖 Test AI Consultant
          </Link>
          <Link href="/estimator" className="btn btn-secondary btn-sm">
            🧮 Project Estimator
          </Link>
          <Link href="/audit" className="btn btn-secondary btn-sm">
            🔍 Audit Website
          </Link>
          <Link href="/automation" className="btn btn-secondary btn-sm">
            ⚡ Automation & Apify
          </Link>
          <Link href="/pipeline" className="btn btn-secondary btn-sm">
            📊 Kanban Board
          </Link>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Leads" value={s.totalLeads || 0} sub="All time captured" gradient="linear-gradient(135deg,#0052ff,#7c3aed)" />
        <StatCard icon="🆕" label="Today's Leads" value={s.todayLeads || 0} sub="Last 24 hours" gradient="linear-gradient(135deg,#06b6d4,#0052ff)" />
        <StatCard icon="🔥" label="Hot Leads" value={s.hotLeads || 0} sub="Score 75+" gradient="linear-gradient(135deg,#ef4444,#f59e0b)" />
        <StatCard icon="⚡" label="Warm Leads" value={s.warmLeads || 0} sub="Score 45-74" gradient="linear-gradient(135deg,#f59e0b,#10b981)" />
        <StatCard icon="📅" label="Pending Meetings" value={s.pendingMeetings || 0} sub="Scheduled calls" gradient="linear-gradient(135deg,#8b5cf6,#ec4899)" />
        <StatCard icon="💰" label="Revenue Collected" value={`$${((s.totalRevenuePaid || 0) / 1000).toFixed(1)}k`} sub="From paid invoices" gradient="linear-gradient(135deg,#10b981,#06b6d4)" />
        <StatCard icon="📈" label="Revenue Forecast" value={`$${((s.revenueForecast || 0) / 1000).toFixed(0)}k`} sub="Weighted pipeline" gradient="linear-gradient(135deg,#0052ff,#10b981)" />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Pipeline & Revenue Trend */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Sales Pipeline Stage Breakdown</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Distribution of leads across sales stages</p>
            </div>
            <Link href="/pipeline" className="btn btn-secondary btn-sm">
              Open Kanban Pipeline →
            </Link>
          </div>

          {pipelineData.length === 0 ? (
            <EmptyState icon="📊" title="Pipeline ready" description="Leads qualified by the AI assistant will populate here" />
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {pipelineData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Lead Quality Breakdown */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Lead Qualification</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Quality distribution (0 - 100)</p>

          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Hot 🔥', value: s.hotLeads || 1 },
                  { name: 'Warm ⚡', value: s.warmLeads || 1 },
                  { name: 'Cold ❄️', value: s.coldLeads || 1 },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {['#ef4444', '#f59e0b', '#3b82f6'].map((color, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#ef4444' }}>{s.hotLeads || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🔥 Hot</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#f59e0b' }}>{s.warmLeads || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>⚡ Warm</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#3b82f6' }}>{s.coldLeads || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>❄️ Cold</div>
            </div>
          </div>
        </div>
      </div>

      {/* Industries & Countries Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Top Industries */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Top Industries</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Highest lead volume sectors</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {industryData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: `${PIE_COLORS[i % PIE_COLORS.length]}20`,
                    color: PIE_COLORS[i % PIE_COLORS.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  #{i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{d.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.count} leads</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill progress-primary" style={{ width: `${(d.count / (industryData[0]?.count || 1)) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Top Countries</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Lead origin by geography</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {countryData.map((d, i) => (
              <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🌍</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{d._id}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.count} leads</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(d.count / (countryData[0]?.count || 1)) * 100}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leads & Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Recent Leads Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Latest Qualified Leads</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Real-time prospects generated by AI Consultant</p>
            </div>
            <Link href="/leads" className="btn btn-secondary btn-sm">
              All Leads →
            </Link>
          </div>

          {!stats?.recentLeads || stats.recentLeads.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No leads yet"
              description="Test the AI Consultant to qualify and add your first lead"
              action={
                <Link href="/chat" className="btn btn-primary btn-sm">
                  Launch AI Consultant →
                </Link>
              }
            />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Industry</th>
                    <th>Project</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLeads.map((lead) => (
                    <tr key={lead._id} style={{ cursor: 'pointer' }} onClick={() => (window.location.href = `/leads/${lead._id}`)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: 'var(--gradient-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 12,
                              fontWeight: 700,
                              color: 'white',
                              flexShrink: 0,
                            }}
                          >
                            {lead.name?.[0] || 'L'}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.company || lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lead.businessType}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lead.projectType}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 800,
                            color: lead.leadScore >= 75 ? '#ef4444' : lead.leadScore >= 45 ? '#f59e0b' : '#3b82f6',
                            fontSize: 13,
                          }}
                        >
                          {lead.leadScore}/100
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            lead.leadStatus === 'Hot' ? 'badge-hot' : lead.leadStatus === 'Warm' ? 'badge-warm' : 'badge-cold'
                          }`}
                        >
                          {lead.leadStatus === 'Hot' ? '🔥' : lead.leadStatus === 'Warm' ? '⚡' : '❄️'} {lead.leadStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Meetings & Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Upcoming Calls */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Upcoming Calls</h3>
              <Link href="/meetings" className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                Calendar →
              </Link>
            </div>
            {!stats?.upcomingCalls || stats.upcomingCalls.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No calls scheduled for today</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.upcomingCalls.map((call) => (
                  <div
                    key={call._id}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{call.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      📅 {new Date(call.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {call.leadId?.name || 'Prospect'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="card" style={{ padding: 20, flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Real-Time Activity</h3>
            {!stats?.recentActivities || stats.recentActivities.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>System activity stream will appear here</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto' }}>
                {stats.recentActivities.slice(0, 5).map((act) => (
                  <div key={act._id} style={{ fontSize: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{act.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                      {act.description} · {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
