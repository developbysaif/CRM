'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatCard, Spinner, EmptyState } from '@/components/ui/index';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

const PIPELINE_COLORS = {
  'New Lead': '#6366f1', Qualified: '#06b6d4', 'Proposal Sent': '#f59e0b',
  'Meeting Scheduled': '#8b5cf6', Negotiation: '#f97316', 'Contract Signed': '#10b981',
  'Invoice Sent': '#3b82f6', 'Payment Received': '#059669', Completed: '#047857', Lost: '#ef4444',
};
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316', '#3b82f6', '#a855f7'];

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
      const token = localStorage.getItem('token');
      const res = await fetch('/api/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } });
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
      <AppLayout title="Dashboard" subtitle="Overview of your sales pipeline">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
          <div style={{ textAlign: 'center' }}>
            <Spinner size={40} />
            <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading dashboard...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const s = stats?.stats || {};
  const pipelineData = (stats?.leadsByStatus || []).map(d => ({ name: d._id, value: d.count, color: PIPELINE_COLORS[d._id] || '#6366f1' }));
  const industryData = (stats?.leadsByIndustry || []).slice(0, 8).map(d => ({ name: d._id, count: d.count }));
  const countryData = (stats?.leadsByCountry || []).slice(0, 6);
  const revenueData = (stats?.revenueData || []).map(d => ({ month: `${d._id.month}/${d._id.year}`, leads: d.count }));

  return (
    <AppLayout title="Dashboard" subtitle="Real-time sales pipeline overview">
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 28 }}>
        <StatCard icon="👥" label="Total Leads" value={s.totalLeads || 0} sub="All time" gradient="linear-gradient(135deg,#6366f1,#8b5cf6)" />
        <StatCard icon="🆕" label="Today's Leads" value={s.todayLeads || 0} sub="Last 24 hours" gradient="linear-gradient(135deg,#06b6d4,#6366f1)" />
        <StatCard icon="🔥" label="Hot Leads" value={s.hotLeads || 0} sub="Score 70+" gradient="linear-gradient(135deg,#ef4444,#f59e0b)" />
        <StatCard icon="⚡" label="Warm Leads" value={s.warmLeads || 0} sub="Score 40-69" gradient="linear-gradient(135deg,#f59e0b,#10b981)" />
        <StatCard icon="❄️" label="Cold Leads" value={s.coldLeads || 0} sub="Score <40" gradient="linear-gradient(135deg,#3b82f6,#06b6d4)" />
        <StatCard icon="📅" label="Pending Meetings" value={s.pendingMeetings || 0} sub="Upcoming" gradient="linear-gradient(135deg,#8b5cf6,#ec4899)" />
        <StatCard icon="💰" label="Revenue Forecast" value={`$${((s.revenueForcast || 0) / 1000).toFixed(0)}k`} sub="From hot leads" gradient="linear-gradient(135deg,#10b981,#06b6d4)" />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Pipeline Chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Lead Pipeline Status</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Distribution across all stages</p>
            </div>
            <Link href="/leads" className="btn btn-secondary btn-sm">View All →</Link>
          </div>
          {pipelineData.length === 0 ? (
            <EmptyState icon="📊" title="No pipeline data yet" description="Start by getting leads through the AI chat widget" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pipelineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {pipelineData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Lead Status Pie */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Lead Quality</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Hot / Warm / Cold breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={[
                { name: 'Hot 🔥', value: s.hotLeads || 0 },
                { name: 'Warm ⚡', value: s.warmLeads || 0 },
                { name: 'Cold ❄️', value: s.coldLeads || 0 },
              ]} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                {['#ef4444', '#f59e0b', '#60a5fa'].map((color, i) => <Cell key={i} fill={color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {[{ label: '🔥 Hot', val: s.hotLeads || 0, color: '#ef4444' }, { label: '⚡ Warm', val: s.warmLeads || 0, color: '#f59e0b' }, { label: '❄️ Cold', val: s.coldLeads || 0, color: '#60a5fa' }].map(item => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{item.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Top Industries */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Top Industries</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Leads by business type</p>
          {industryData.length === 0 ? <EmptyState icon="🏢" title="No data yet" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {industryData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: PIE_COLORS[i % PIE_COLORS.length] + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>#{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{d.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.count}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill progress-primary" style={{ width: `${(d.count / (industryData[0]?.count || 1)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Countries */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Top Countries</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Where your leads come from</p>
          {countryData.length === 0 ? <EmptyState icon="🌍" title="No location data yet" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {countryData.map((d, i) => (
                <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>🌍</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{d._id}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.count}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(d.count / (countryData[0]?.count || 1)) * 100}%`, background: PIE_COLORS[i] }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Leads</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Latest lead activity</p>
          </div>
          <Link href="/leads" className="btn btn-secondary btn-sm">View Pipeline →</Link>
        </div>
        {!stats?.recentLeads || stats.recentLeads.length === 0 ? (
          <EmptyState icon="👥" title="No leads yet" description="The AI chat widget will automatically capture leads" action={<Link href="/chat" className="btn btn-primary btn-sm">Try AI Chat →</Link>} />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Business</th><th>Project</th><th>Score</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentLeads.map(lead => (
                <tr key={lead._id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/leads/${lead._id}`}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {lead.name?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lead.businessType}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lead.projectType}</td>
                  <td>
                    <span style={{ fontWeight: 800, color: lead.leadScore >= 70 ? '#ef4444' : lead.leadScore >= 40 ? '#f59e0b' : '#60a5fa', fontSize: 14 }}>{lead.leadScore}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: lead.leadStatus === 'Hot' ? 'rgba(239,68,68,0.15)' : lead.leadStatus === 'Warm' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)', color: lead.leadStatus === 'Hot' ? '#ef4444' : lead.leadStatus === 'Warm' ? '#f59e0b' : '#60a5fa' }}>
                      {lead.leadStatus === 'Hot' ? '🔥' : lead.leadStatus === 'Warm' ? '⚡' : '❄️'} {lead.leadStatus}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
