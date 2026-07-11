'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';

function GradeCircle({ grade, score, label }) {
  const classes = { A: 'grade-a', B: 'grade-b', C: 'grade-c', D: 'grade-d', F: 'grade-f' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div className={`audit-score-circle ${classes[grade] || 'grade-c'}`}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>{grade}</div>
        <div style={{ fontSize: 11, fontWeight: 600 }}>{score}</div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function AuditPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleAudit(e) {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        toast.success('Audit completed!');
      } else {
        toast.error(data.message || 'Audit failed');
      }
    } catch { toast.error('Audit failed. Check your OpenAI API key.'); }
    setLoading(false);
  }

  const categories = result ? [
    { key: 'performance', label: 'Performance', icon: '⚡' },
    { key: 'seo', label: 'SEO', icon: '🔍' },
    { key: 'accessibility', label: 'Accessibility', icon: '♿' },
    { key: 'security', label: 'Security', icon: '🔒' },
    { key: 'responsive', label: 'Responsive', icon: '📱' },
    { key: 'ux', label: 'UX Design', icon: '🎨' },
  ] : [];

  return (
    <AppLayout title="Website Audit" subtitle="AI-powered comprehensive website analysis">
      {/* Search Form */}
      <div className="card" style={{ padding: 28, marginBottom: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>🔍 Analyze Any Website</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Enter a website URL to get a complete AI-powered audit covering performance, SEO, accessibility, security, and more.</p>
        </div>
        <form onSubmit={handleAudit} style={{ display: 'flex', gap: 12 }}>
          <input
            className="input"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            type="url"
            required
            style={{ flex: 1, fontSize: 15 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 140 }}>
            {loading ? <><Spinner size={16} /> Analyzing...</> : '🔍 Audit Now'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 2s infinite' }}>🔍</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Analyzing Website...</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI is scanning performance, SEO, accessibility, security, and Core Web Vitals</p>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}><Spinner size={32} /></div>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Overall Score */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Audit Report: {result.url}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{result.summary}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 52, fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{result.overallScore}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Overall Score / 100</div>
              </div>
            </div>
          </div>

          {/* Category Grades */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 24 }}>Category Scores</h3>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'space-around', flexWrap: 'wrap' }}>
              {categories.map(cat => {
                const data = result[cat.key];
                if (!data) return null;
                return (
                  <div key={cat.key} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{cat.icon}</div>
                    <GradeCircle grade={data.grade} score={data.score} label={cat.label} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core Web Vitals */}
          {result.coreWebVitals && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>⚡ Core Web Vitals</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {Object.entries(result.coreWebVitals).map(([key, val]) => {
                  const statusColors = { Good: '#10b981', 'Needs Improvement': '#f59e0b', Poor: '#ef4444' };
                  const color = statusColors[val.status] || '#6366f1';
                  return (
                    <div key={key} style={{ padding: 18, background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 8 }}>{key.toUpperCase()}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color, marginBottom: 4 }}>{val.value}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color, background: `${color}20`, padding: '2px 8px', borderRadius: 20, display: 'inline-block' }}>{val.status}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Issues & Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {categories.slice(0, 4).map(cat => {
              const data = result[cat.key];
              if (!data || ((!data.issues || data.issues.length === 0) && (!data.recommendations || data.recommendations.length === 0))) return null;
              return (
                <div key={cat.key} className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{cat.icon} {cat.label}</h3>
                  {data.issues?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Issues Found</div>
                      {data.issues.map((issue, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                          <span style={{ color: '#ef4444', flexShrink: 0 }}>✕</span> {issue}
                        </div>
                      ))}
                    </div>
                  )}
                  {data.recommendations?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Recommendations</div>
                      {data.recommendations.map((rec, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                          <span style={{ color: '#10b981', flexShrink: 0 }}>→</span> {rec}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Priority Actions */}
          {result.priorityActions?.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🎯 Priority Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.priorityActions.map((action, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{action}</span>
                  </div>
                ))}
              </div>
              {result.estimatedImprovementCost && (
                <div style={{ marginTop: 16, padding: 14, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>💡 <strong style={{ color: 'var(--primary-light)' }}>Estimated Improvement Cost:</strong> {result.estimatedImprovementCost}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
