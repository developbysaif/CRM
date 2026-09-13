'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';

function GradeCircle({ grade, score, label }) {
  const classes = { A: 'grade-a', B: 'grade-b', C: 'grade-c', D: 'grade-d', F: 'grade-f' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div className={`audit-score-circle ${classes[grade] || 'grade-c'}`}>
        <div style={{ fontSize: 20, fontWeight: 900 }}>{grade}</div>
        <div style={{ fontSize: 11, fontWeight: 600 }}>{score}/100</div>
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
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        toast.success('Website audit completed!');
      } else {
        toast.error(data.message || 'Audit failed');
      }
    } catch {
      toast.error('Audit failed');
    } finally {
      setLoading(false);
    }
  }

  const categories = result
    ? [
        { key: 'performance', label: 'Performance', icon: '⚡' },
        { key: 'seo', label: 'SEO Optimization', icon: '🔍' },
        { key: 'accessibility', label: 'Accessibility', icon: '♿' },
        { key: 'security', label: 'Security & SSL', icon: '🔒' },
        { key: 'responsive', label: 'Responsive Design', icon: '📱' },
        { key: 'ux', label: 'UX & Lead Capture', icon: '🎨' },
      ]
    : [];

  return (
    <AppLayout title="AI Website Audit" subtitle="Deep automated performance, SEO, accessibility & Core Web Vitals analysis">
      {/* Input Form */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            🔍 Audit Website Architecture
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Enter any domain to generate an architectural audit with actionable recommendations and lead capture opportunities.
          </p>
        </div>
        <form onSubmit={handleAudit} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            type="url"
            required
            style={{ flex: 1, minWidth: 260, fontSize: 14 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 150 }}>
            {loading ? <><Spinner size={16} /> Auditing...</> : '🔍 Run Audit Report'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Analyzing Page Architecture & Core Web Vitals...
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Evaluating performance benchmarks, security headers, mobile touch UX, and SEO schema.
          </p>
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
            <Spinner size={32} />
          </div>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Score Banner */}
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Comprehensive Audit
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {result.url}
                </h2>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.summary}</p>
              </div>
              <div style={{ textAlign: 'center', minWidth: 140 }}>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {result.overallScore}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Overall Health / 100</div>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Category Diagnostic Breakdown</h3>
            <div style={{ display: 'flex', gap: 18, justifyContent: 'space-around', flexWrap: 'wrap' }}>
              {categories.map((cat) => {
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
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>⚡ Core Web Vitals (Real-World UX)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                {Object.entries(result.coreWebVitals).map(([key, val]) => {
                  const statusColors = { Good: '#10b981', 'Needs Improvement': '#f59e0b', Poor: '#ef4444' };
                  const color = statusColors[val.status] || '#0052ff';
                  return (
                    <div
                      key={key}
                      style={{
                        padding: 16,
                        background: `${color}10`,
                        border: `1px solid ${color}30`,
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                        {key.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, color, marginBottom: 4 }}>{val.value}</div>
                      <div
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color,
                          background: `${color}20`,
                          padding: '2px 8px',
                          borderRadius: 20,
                          display: 'inline-block',
                        }}
                      >
                        {val.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Issues and Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {categories.slice(0, 4).map((cat) => {
              const data = result[cat.key];
              if (!data) return null;
              return (
                <div key={cat.key} className="card" style={{ padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
                    {cat.icon} {cat.label}
                  </h3>
                  {data.issues?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: 6 }}>
                        Detected Bottlenecks:
                      </div>
                      {data.issues.map((issue, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                          <span style={{ color: '#ef4444', flexShrink: 0 }}>✕</span> {issue}
                        </div>
                      ))}
                    </div>
                  )}
                  {data.recommendations?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: 6 }}>
                        Recommended Fixes:
                      </div>
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

          {/* Priority Action Items & Remediation Proposal */}
          {result.priorityActions?.length > 0 && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>🎯 Strategic Roadmap & Priority Actions</h3>
                {result.estimatedImprovementCost && (
                  <span className="badge badge-warning" style={{ fontSize: 12, padding: '4px 10px' }}>
                    Remediation Cost: {result.estimatedImprovementCost}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {result.priorityActions.map((action, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 14,
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{action}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/estimator" className="btn btn-primary btn-sm">
                  🧮 Calculate Optimization Budget
                </Link>
                <Link href="/chat" className="btn btn-secondary btn-sm">
                  🤖 Discuss Remediations with AI
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
