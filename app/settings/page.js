'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from '@/components/ui/Toaster';

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [mongoUri, setMongoUri] = useState('');
  const [appName, setAppName] = useState('LeadAI Pro');
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    toast.success('Settings saved! Please update your .env.local file with these values.');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const envContent = `MONGODB_URI=${mongoUri || 'mongodb://localhost:27017/ai-leads-platform'}
OPENAI_API_KEY=${openaiKey || 'your_openai_api_key_here'}
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=${appName}`;

  return (
    <AppLayout title="Settings" subtitle="Platform configuration">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
        {/* API Keys */}
        <div className="card" style={{ padding: 28, gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>🔑 API Configuration</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Update your .env.local file with these values to enable all AI features.</p>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="input-label">OpenAI API Key</label>
              <input className="input" type="password" value={openaiKey} onChange={e => setOpenaiKey(e.target.value)} placeholder="sk-..." />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Required for AI chat, proposals, contracts and all AI features</span>
            </div>
            <div className="form-group">
              <label className="input-label">MongoDB URI</label>
              <input className="input" value={mongoUri} onChange={e => setMongoUri(e.target.value)} placeholder="mongodb://localhost:27017/ai-leads-platform" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Your MongoDB connection string (local or Atlas)</span>
            </div>
            <div className="form-group">
              <label className="input-label">App Name</label>
              <input className="input" value={appName} onChange={e => setAppName(e.target.value)} placeholder="LeadAI Pro" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
              {saved ? '✅ Saved!' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* .env.local template */}
        <div className="card" style={{ padding: 28, gridColumn: '1 / -1' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>📄 .env.local Template</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Copy this to your project's <code style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4, fontSize: 12, color: 'var(--primary-light)' }}>.env.local</code> file:</p>
          <div style={{ position: 'relative' }}>
            <pre style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', fontSize: 13, color: '#a5f3fc', fontFamily: 'monospace', lineHeight: 1.7, overflowX: 'auto' }}>
              {envContent}
            </pre>
            <button onClick={() => { navigator.clipboard.writeText(envContent); toast.success('Copied!'); }} className="btn btn-secondary btn-sm" style={{ position: 'absolute', top: 12, right: 12, fontSize: 11 }}>Copy</button>
          </div>
        </div>

        {/* Feature Status */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>✅ Platform Features</h3>
          {[
            ['AI Chat Widget', true, 'Floating chatbot on all pages'],
            ['AI Business Consultant', true, 'Full-page chat interface'],
            ['Lead Auto-Scoring', true, '0-100 score with Hot/Warm/Cold'],
            ['AI Proposal Generator', true, 'One-click proposal creation'],
            ['AI Quotation Generator', true, 'Professional line-item quotes'],
            ['AI Contract Generator', true, 'Legal contracts with clauses'],
            ['Website Audit AI', true, 'Full site analysis & report'],
            ['Competitor Analysis', true, 'AI comparison with insights'],
            ['Kanban Pipeline', true, 'Drag-n-drop lead management'],
            ['PDF Downloads', true, 'All documents as PDF'],
            ['Real-time Notifications', true, 'New lead alerts'],
            ['Google Calendar Sync', false, 'Coming soon'],
            ['Email Automation', false, 'Coming soon'],
          ].map(([feature, enabled, desc]) => (
            <div key={feature} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{enabled ? '✅' : '⏳'}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: enabled ? 'var(--text-primary)' : 'var(--text-muted)' }}>{feature}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🛠️ Tech Stack</h3>
          {[
            { category: 'Frontend', items: ['Next.js 16 App Router', 'Tailwind CSS v4', 'Recharts', 'jsPDF + html2canvas'] },
            { category: 'Backend', items: ['Next.js API Routes', 'MongoDB + Mongoose', 'JWT Authentication', 'OpenAI GPT-4o API'] },
            { category: 'Database Models', items: ['User', 'Lead', 'Conversation', 'Proposal', 'Quotation', 'Contract', 'Meeting', 'Notification'] },
          ].map(section => (
            <div key={section.category} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{section.category}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {section.items.map(item => (
                  <span key={item} className="badge badge-primary">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
