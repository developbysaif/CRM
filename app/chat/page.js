'use client';
import AppLayout from '@/components/layout/AppLayout';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ChatPage() {
  return (
    <AppLayout title="AI Business Consultant" subtitle="Intelligent lead qualification and project analysis">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, height: 'calc(100vh - 130px)' }}>
        {/* Chat */}
        <ChatInterface fullPage={true} />

        {/* Info Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>🤖 AI Capabilities</h3>
            {['Qualify business leads intelligently', 'Estimate project cost & timeline', 'Recommend technology stack', 'Auto-generate proposals & contracts', 'Score leads 0-100 automatically', 'Save to CRM automatically'].map(c => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <span style={{ color: '#10b981', fontSize: 14 }}>✓</span> {c}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>📋 What AI Collects</h3>
            {[['👤', 'Contact Info', 'Name, Email, Phone'], ['🏢', 'Business Type', 'Industry & Company'], ['💻', 'Project Type', 'Website, App, AI...'], ['💰', 'Budget Range', 'Min/Max budget'], ['⏰', 'Timeline', 'Deadline & urgency'], ['🔧', 'Features', 'Required functionality']].map(([icon, label, desc]) => (
              <div key={label} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>🎯 Lead Scoring</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[{ label: '🔥 Hot Lead', range: '70-100', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }, { label: '⚡ Warm Lead', range: '40-69', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }, { label: '❄️ Cold Lead', range: '0-39', color: '#60a5fa', bg: 'rgba(59,130,246,0.1)' }].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: s.bg, borderRadius: 'var(--radius-md)', border: `1px solid ${s.color}30` }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Score {s.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
