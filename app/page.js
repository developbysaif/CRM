'use client';
import Link from 'next/link';
import ChatWidget from '@/components/chat/ChatWidget';
import Toaster from '@/components/ui/Toaster';

const features = [
  { icon: '🤖', title: 'AI Business Consultant', desc: 'Intelligent conversational AI that qualifies leads and understands business needs automatically' },
  { icon: '📊', title: 'Lead Scoring Engine', desc: 'Automatically score every lead 0-100 based on budget, timeline, industry and project complexity' },
  { icon: '📄', title: 'Auto-Generated Proposals', desc: 'AI creates executive-grade project proposals, quotations and contracts in seconds' },
  { icon: '🎯', title: 'Sales Pipeline CRM', desc: 'Visual Kanban pipeline tracking leads from first contact to payment received' },
  { icon: '🔍', title: 'Website Audit Tool', desc: 'Deep AI analysis of performance, SEO, accessibility, security and Core Web Vitals' },
  { icon: '⚔️', title: 'Competitor Analysis', desc: 'Compare your website against competitors with AI-powered insights and opportunities' },
];

const stats = [
  { value: '10x', label: 'Lead Conversion Rate' },
  { value: '85%', label: 'Time Saved on Proposals' },
  { value: '0-100', label: 'AI Lead Scoring' },
  { value: '24/7', label: 'AI Always Working' },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-sans)' }}>
      {/* Nav */}
      <nav style={{ padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>LeadAI<span style={{ color: 'var(--primary)' }}>Pro</span></span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" className="btn btn-secondary btn-sm">Login</Link>
          <Link href="/dashboard" className="btn btn-primary btn-sm">Dashboard →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '100px 48px', maxWidth: 1200, margin: '0 auto', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(0, 82, 255, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0, 82, 255, 0.06)', border: '1px solid rgba(0, 82, 255, 0.15)', borderRadius: 'var(--radius-full)', padding: '6px 16px', marginBottom: 28, fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
          ⚡ AI-Powered Lead Generation Platform
        </div>

        <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 24, fontFamily: 'var(--font-display)' }}>
          Convert Visitors Into{' '}
          <span className="text-gradient">Qualified Leads</span>
          <br />With AI Intelligence
        </h1>

        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Your AI Business Consultant works 24/7 — qualifying leads, generating proposals, scheduling meetings and managing your entire sales pipeline automatically.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            🚀 Launch Dashboard
          </Link>
          <Link href="/chat" className="btn btn-secondary btn-lg">
            🤖 Try AI Assistant
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 700, margin: '0 auto' }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, fontFamily: 'var(--font-display)' }}>
              Enterprise AI Sales Stack
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Everything you need to automate your entire sales funnel</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ padding: 28, transition: 'var(--transition)' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pipeline Visual */}
      <section style={{ padding: '80px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 48, fontFamily: 'var(--font-display)' }}>
          Full Sales Pipeline Automation
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap', gap: 4 }}>
          {['New Lead', 'Qualified', 'Proposal Sent', 'Meeting', 'Negotiation', 'Contract Signed', 'Payment', 'Completed'].map((stage, i) => (
            <div key={stage} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-full)', background: `hsl(${240 + i * 20}, 70%, ${20 + i * 3}%)`, border: '1px solid rgba(255,255,255,0.1)', fontSize: 12, fontWeight: 600, color: 'white', whiteSpace: 'nowrap' }}>{stage}</div>
              {i < 7 && <span style={{ color: 'var(--text-muted)', fontSize: 16, padding: '0 2px' }}>→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 48px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>
          Ready to Automate Your Sales?
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
          Try the AI assistant now — it's already working in the bottom right corner of this page 👇
        </p>
        <Link href="/dashboard" className="btn btn-primary btn-lg">
          Open Dashboard →
        </Link>
      </section>

      <ChatWidget />
      <Toaster />
    </div>
  );
}
