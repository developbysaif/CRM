export const metadata = {
  title: 'LeadAI Pro — API Service',
  description: 'Backend REST API Server for LeadAI Pro CRM',
};

export default function HomePage() {
  const endpoints = [
    { method: 'GET', path: '/api/leads', desc: 'Fetch verified leads with pagination, filters & search' },
    { method: 'POST', path: '/api/leads', desc: 'Create a new prospect lead' },
    { method: 'GET', path: '/api/discovery/search', desc: 'Live external business discovery (Google Places & Apify)' },
    { method: 'GET', path: '/api/approvals', desc: 'Pending human-authorization queue' },
    { method: 'POST', path: '/api/chat/command', desc: 'Natural language CRM intent & command processing' },
    { method: 'GET', path: '/api/dashboard/stats', desc: 'Aggregated pipeline KPI analytics & conversion funnel' },
    { method: 'POST', path: '/api/contracts', desc: 'Generate Master Services Agreement on Closed Won' },
    { method: 'POST', path: '/api/proposals', desc: 'AI proposal synthesis in Draft status' },
    { method: 'POST', path: '/api/automation/cron', desc: 'Automated 7-day follow-up cadence executor' },
  ];

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: '#090d16',
      color: '#f8fafc',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        maxWidth: 760,
        width: '100%',
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: 16,
        padding: '36px',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid #1f2937', paddingBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#ffffff' }}>LeadAI Pro API Server</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: '#9ca3af' }}>Headless CRM & Autonomous Sales Engine</p>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 9999,
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontSize: 12,
            fontWeight: 700,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            API Operational
          </span>
        </div>

        <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 24 }}>
          The frontend CRM UI has been removed. This service now runs as a dedicated headless backend providing REST API endpoints for CRM operations, lead discovery, scoring, outreach, and contract automation.
        </p>

        <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 12 }}>
          Core REST API Endpoints
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {endpoints.map((ep, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: 8,
              background: '#0b1120',
              border: '1px solid #1e293b',
              fontSize: 13,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: ep.method === 'GET' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: ep.method === 'GET' ? '#60a5fa' : '#34d399',
                  fontFamily: 'monospace',
                }}>
                  {ep.method}
                </span>
                <code style={{ color: '#f1f5f9', fontWeight: 600 }}>{ep.path}</code>
              </div>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>{ep.desc}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #1f2937', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
          <span>Zero Synthetic Data Policy Active</span>
          <span>LeadAI Pro v2.0 • Headless Backend</span>
        </div>
      </div>
    </main>
  );
}
