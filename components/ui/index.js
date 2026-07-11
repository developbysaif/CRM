'use client';

export function LeadScoreBadge({ score }) {
  const getClass = () => {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-mid';
    return 'score-low';
  };
  return (
    <div className={`score-ring ${getClass()}`} title={`Lead Score: ${score}/100`}>
      {score}
    </div>
  );
}

export function LeadStatusBadge({ status }) {
  const map = { Hot: 'badge-hot', Warm: 'badge-warm', Cold: 'badge-cold' };
  const icons = { Hot: '🔥', Warm: '⚡', Cold: '❄️' };
  return (
    <span className={`badge ${map[status] || 'badge-primary'}`}>
      {icons[status]} {status}
    </span>
  );
}

export function PipelineBadge({ status }) {
  const colors = {
    'New Lead': { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
    Qualified: { bg: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
    'Proposal Sent': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
    'Meeting Scheduled': { bg: 'rgba(168,85,247,0.15)', color: '#c084fc', border: 'rgba(168,85,247,0.3)' },
    Negotiation: { bg: 'rgba(249,115,22,0.15)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' },
    'Contract Signed': { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
    'Invoice Sent': { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
    'Payment Received': { bg: 'rgba(16,185,129,0.2)', color: '#10b981', border: 'rgba(16,185,129,0.4)' },
    Completed: { bg: 'rgba(16,185,129,0.25)', color: '#059669', border: 'rgba(16,185,129,0.5)' },
    Lost: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
  };
  const c = colors[status] || colors['New Lead'];
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

export function Spinner({ size = 24 }) {
  return (
    <div style={{ width: size, height: size, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 12, width: '80%', marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: '40%' }} />
    </div>
  );
}

export function EmptyState({ icon = '📭', title = 'No data yet', description = '', action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 16 }}>
      <div style={{ fontSize: 48 }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
      {description && <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 300 }}>{description}</p>}
      {action}
    </div>
  );
}

export function StatCard({ icon, label, value, sub, gradient, trend }) {
  return (
    <div className="stat-card" style={{ '--card-gradient': gradient }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: gradient || 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {icon}
        </div>
        {trend !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 600, color: trend >= 0 ? '#10b981' : '#ef4444', background: trend >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '3px 8px', borderRadius: 'var(--radius-full)' }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
