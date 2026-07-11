'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';

function ScoreBar({ myScore, competitorScore, label }) {
  const myBetter = myScore >= competitorScore;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
          <span style={{ color: myBetter ? '#10b981' : '#ef4444', fontWeight: 700 }}>Me: {myScore}</span>
          <span style={{ color: myBetter ? '#ef4444' : '#10b981', fontWeight: 700 }}>Competitor: {competitorScore}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <div style={{ flex: 1 }}>
          <div className="progress-bar">
            <div style={{ height: '100%', borderRadius: 'var(--radius-full)', background: myBetter ? 'linear-gradient(90deg,#10b981,#059669)' : 'linear-gradient(90deg,#ef4444,#dc2626)', width: `${myScore}%`, transition: 'width 1s ease' }} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="progress-bar">
            <div style={{ height: '100%', borderRadius: 'var(--radius-full)', background: myBetter ? 'linear-gradient(90deg,#ef4444,#dc2626)' : 'linear-gradient(90deg,#10b981,#059669)', width: `${competitorScore}%`, transition: 'width 1s ease' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompetitorPage() {
  const [form, setForm] = useState({ myWebsite: '', competitorWebsite: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/competitor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { setResult(data.data); toast.success('Analysis complete!'); }
      else toast.error(data.message || 'Analysis failed');
    } catch { toast.error('Analysis failed. Check your OpenAI API key.'); }
    setLoading(false);
  }

  return (
    <AppLayout title="Competitor Analysis" subtitle="AI-powered competitive intelligence">
      {/* Input Form */}
      <div className="card" style={{ padding: 28, marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>⚔️ Compare Websites</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Enter your website and a competitor's URL for an AI-powered comparison analysis.</p>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12 }}>
          <div className="form-group">
            <label className="input-label">Your Website</label>
            <input className="input" type="url" required value={form.myWebsite} onChange={e => setForm(p => ({ ...p, myWebsite: e.target.value }))} placeholder="https://your-site.com" />
          </div>
          <div className="form-group">
            <label className="input-label">Competitor Website</label>
            <input className="input" type="url" required value={form.competitorWebsite} onChange={e => setForm(p => ({ ...p, competitorWebsite: e.target.value }))} placeholder="https://competitor.com" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: 140, height: 42 }}>
              {loading ? <><Spinner size={16} /> Analyzing...</> : '⚔️ Analyze'}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Running Competitor Analysis...</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>AI is comparing features, SEO, performance, design and business opportunities</p>
          <div style={{ marginTop: 24 }}><Spinner size={32} /></div>
        </div>
      )}

      {result && (
        <div>
          {/* Winner Banner */}
          <div className="card" style={{ padding: 24, marginBottom: 20, background: result.overallAdvantage === 'me' ? 'rgba(16,185,129,0.08)' : result.overallAdvantage === 'competitor' ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)', border: `1px solid ${result.overallAdvantage === 'me' ? 'rgba(16,185,129,0.3)' : result.overallAdvantage === 'competitor' ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 36 }}>{result.overallAdvantage === 'me' ? '🏆' : result.overallAdvantage === 'competitor' ? '⚠️' : '🤝'}</span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {result.overallAdvantage === 'me' ? 'You\'re Winning! Great competitive position.' : result.overallAdvantage === 'competitor' ? 'Competitor has the edge — but you can catch up!' : 'It\'s a close competition!'}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.executiveSummary}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 20 }}>
            {['overview', 'features', 'opportunities'].map(t => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t === 'overview' ? '📊 Scores' : t === 'features' ? '🔧 Features' : '💡 Opportunities'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 24 }}>Score Comparison</h3>
              <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: 14, background: 'rgba(16,185,129,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginBottom: 4 }}>Your Website</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{result.myWebsite}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 20 }}>⚔️</div>
                <div style={{ flex: 1, textAlign: 'center', padding: 14, background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>Competitor</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{result.competitorWebsite}</div>
                </div>
              </div>
              <ScoreBar myScore={result.seoComparison?.myScore || 0} competitorScore={result.seoComparison?.competitorScore || 0} label="SEO Score" />
              <ScoreBar myScore={result.performanceComparison?.myScore || 0} competitorScore={result.performanceComparison?.competitorScore || 0} label="Performance Score" />
              <ScoreBar myScore={result.designComparison?.myRating || 0} competitorScore={result.designComparison?.competitorRating || 0} label="Design Rating" />
            </div>
          )}

          {activeTab === 'features' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#10b981' }}>✅ Your Unique Features</h3>
                {result.featureComparison?.uniqueToMe?.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#ef4444' }}>❌ Features Only Competitor Has</h3>
                {result.featureComparison?.uniqueToCompetitor?.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#ef4444', flexShrink: 0 }}>✕</span> {f}
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 24, gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>💡 Features You Should Add</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  {result.missingFeatures?.map((f, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)' }}>
                      💡 {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'opportunities' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#10b981' }}>🚀 Business Opportunities</h3>
                {result.businessOpportunities?.map((o, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'flex-start' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{o}</span>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: '#6366f1' }}>📈 Improvement Suggestions</h3>
                {result.improvementSuggestions?.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span style={{ color: '#6366f1', flexShrink: 0 }}>→</span> {s}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
