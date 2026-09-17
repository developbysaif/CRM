'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from '@/components/ui/Toaster';
import { Spinner } from '@/components/ui/index';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('providers');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [showApifyToken, setShowApifyToken] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);

  const [settings, setSettings] = useState({
    openaiApiKey: '',
    openaiModel: 'gpt-4o',
    googlePlacesApiKey: '',
    apifyApiToken: '',
    apifyDefaultActor: 'compass/crawler-google-places',
    resendApiKey: '',
    resendFromEmail: 'onboarding@resend.dev',
    companyName: 'LeadAI Pro Software Agency',
    companyEmail: 'sales@leadaipro.com',
    companyPhone: '+1 (800) 555-0199',
    companyWebsite: 'https://leadaipro.com',
    companyAddress: '100 Innovation Way, Suite 500, San Francisco, CA 94105',
    taxNumber: 'US-987654321',
    defaultCurrency: 'USD',
    defaultTaxRate: 10,
    emailSignature: 'Best regards,\nSales & Partnership Team\nLeadAI Pro Agency',
    services: [],
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpSecure: false,
    fromEmail: 'noreply@leadaipro.com',
    scoringWeights: {
      websiteMissingWeight: 25,
      poorWebsiteWeight: 20,
      poorMobileWeight: 10,
      poorSeoWeight: 10,
      lowPerformanceWeight: 10,
      highReviewCountWeight: 5,
      strongCategoryWeight: 5,
      publicEmailWeight: 5,
      phoneAvailableWeight: 5,
      buyingSignalWeight: 5,
    },
    automations: {
      requireApprovalForOutreach: true,
      requireApprovalForProposals: true,
      requireApprovalForContracts: true,
      autoCreateProposalOnInterested: true,
      autoCreateContractOnClosedWon: true,
      notifyOwnerOnContractGenerated: true,
      enableFollowUpSequences: true,
      autoStopFollowUpOnReply: true,
      dailyOutreachLimit: 50,
      followUpIntervalDays: 7,
      maxFollowUps: 5,
    },
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setSettings((prev) => ({
            ...prev,
            ...d.data,
            scoringWeights: { ...prev.scoringWeights, ...(d.data.scoringWeights || {}) },
            automations: { ...prev.automations, ...(d.data.automations || {}) },
            services: d.data.services || prev.services,
          }));
        }
      })
      .catch((err) => console.error('Failed to load settings:', err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Settings updated and synced securely!');
      } else {
        toast.error(data.message || 'Failed to save settings');
      }
    } catch {
      toast.error('Network error saving settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    setTestingEmail(true);
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: settings.companyEmail || 'sales@leadaipro.com',
          subject: 'LeadAI Pro - Delivery Verification Test',
          isTest: true,
          variables: {
            clientName: 'Admin',
            projectName: 'System Verification',
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Test email dispatched! Provider: ${data.data?.provider?.toUpperCase()}`);
      } else {
        toast.error(data.message || 'Failed to send test email');
      }
    } catch {
      toast.error('Error triggering test email');
    } finally {
      setTestingEmail(false);
    }
  }

  const tabs = [
    { id: 'providers', label: '🎯 Lead Providers & APIs', icon: '🔑' },
    { id: 'automations', label: '🛡️ Approvals & Automations', icon: '⚡' },
    { id: 'company', label: '🏢 Business Profile & Services', icon: '🏢' },
    { id: 'email', label: '✉️ Email & Resend', icon: '✉️' },
    { id: 'scoring', label: '🎯 AI Scoring Weights', icon: '🎯' },
    { id: 'env', label: '📄 Environment Config', icon: '📄' },
  ];

  if (loading) {
    return (
      <AppLayout title="Platform Settings" subtitle="System configuration and AI tuning">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spinner size={40} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Platform Settings & Configurations"
      subtitle="Manage Google Places API, Apify Scrapers, Resend credentials, Services catalog, and Approval rules"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ fontWeight: activeTab === tab.id ? 700 : 500 }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Global Save Button */}
        <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm" style={{ padding: '8px 24px' }}>
          {saving ? <Spinner size={16} /> : '💾 Save Settings'}
        </button>
      </div>

      <div style={{ maxWidth: 960 }}>
        {/* Tab 1: Lead Providers & APIs */}
        {activeTab === 'providers' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔑 External API Integrations (Masked & Protected)
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
              Keys are stored securely server-side and never broadcast to browser environments.
            </p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Google Places API */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="input-label" style={{ fontWeight: 700 }}>Google Maps & Places API Key</label>
                  {settings.isEnvConfigured?.google && (
                    <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Active in .env.local ✅</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type={showGoogleKey ? 'text' : 'password'}
                    className="input"
                    placeholder="AIzaSy..."
                    value={settings.googlePlacesApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, googlePlacesApiKey: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowGoogleKey(!showGoogleKey)}
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    {showGoogleKey ? '🙈 Hide' : '👁️ Show'}
                  </button>
                </div>
                <span style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Used by GooglePlacesProvider for Places TextSearch, Place Details, ratings, and phone enrichment.
                </span>
              </div>

              {/* Apify API Token */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="input-label" style={{ fontWeight: 700 }}>Apify API Token</label>
                  {settings.isEnvConfigured?.apify && (
                    <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Active in .env.local ✅</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type={showApifyToken ? 'text' : 'password'}
                    className="input"
                    placeholder="apify_api_..."
                    value={settings.apifyApiToken || ''}
                    onChange={(e) => setSettings({ ...settings, apifyApiToken: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApifyToken(!showApifyToken)}
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    {showApifyToken ? '🙈 Hide' : '👁️ Show'}
                  </button>
                </div>
                <span style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Used by ApifyProvider for crawling Google Places and deep website content analysis.
                </span>
              </div>

              {/* OpenAI API Key */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="input-label" style={{ fontWeight: 700 }}>OpenAI API Key</label>
                  {settings.isEnvConfigured?.openai && (
                    <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Active in .env.local ✅</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    className="input"
                    placeholder="sk-proj-..."
                    value={settings.openaiApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    {showApiKey ? '🙈 Hide' : '👁️ Show'}
                  </button>
                </div>
                <span style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Powers AI Lead Scoring, Personalized Outreach drafts, and Proposal synthesis.
                </span>
              </div>

              <div className="form-group">
                <label className="input-label">OpenAI Flagship Model</label>
                <select
                  className="input"
                  value={settings.openaiModel || 'gpt-4o'}
                  onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                >
                  <option value="gpt-4o">GPT-4o (Recommended: Flagship Reasoning & Multimodal)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Ultra Fast & Cost Efficient)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                </select>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Approvals & Automations */}
        {activeTab === 'automations' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              🛡️ Human Approval Gating & Automation Rules
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
              Enforce commercial safety rules: Prevent sensitive emails, proposals, and contracts from auto-sending.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                {
                  key: 'requireApprovalForOutreach',
                  label: '🛡️ Require Human Approval for AI Outreach Messages',
                  desc: 'All cold emails and personalized follow-ups will stay in "Approval Required" status until clicked.',
                },
                {
                  key: 'requireApprovalForProposals',
                  label: '📄 Require Human Approval for Proposals',
                  desc: 'Auto-generated proposals remain in DRAFT status and require review before delivery.',
                },
                {
                  key: 'requireApprovalForContracts',
                  label: '📝 Require Human Approval for Contracts',
                  desc: 'Legal contracts created on CLOSED WON remain in DRAFT status until explicitly authorized.',
                },
                {
                  key: 'autoCreateProposalOnInterested',
                  label: '🤖 Auto-Draft Proposal when Lead becomes "Interested"',
                  desc: 'Prepares scope, timeline, and pricing in DRAFT as soon as positive reply intent is detected.',
                },
                {
                  key: 'autoCreateContractOnClosedWon',
                  label: '📝 Auto-Draft Contract on "Closed Won"',
                  desc: 'Generates legal agreement document in DRAFT as soon as a deal reaches Closed Won stage.',
                },
                {
                  key: 'notifyOwnerOnContractGenerated',
                  label: '⚡ Immediate CRM Owner Notification on Contract Creation',
                  desc: 'Sends prompt alert with View, Download PDF, and Send options to CRM owner.',
                },
                {
                  key: 'enableFollowUpSequences',
                  label: '⏱️ Enable 5-Step Automated Follow-Up Sequences',
                  desc: 'Schedules 7-day cadence follow-ups after initial outreach is approved and sent.',
                },
                {
                  key: 'autoStopFollowUpOnReply',
                  label: '🛑 Automatic Killswitch on Client Reply or Unsubscribe',
                  desc: 'Instantly halts all pending follow-ups when prospect replies, unsubscribes, or closes.',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: 14,
                    background: '#f8fafc',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(settings.automations?.[item.key])}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        automations: {
                          ...settings.automations,
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    style={{ width: 18, height: 18, marginTop: 3, accentColor: '#2563eb', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Business Profile & Services Catalog */}
        {activeTab === 'company' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              🏢 Business Profile & Services Pricing Engine
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
              Configured company identity, services catalog, and email signatures are used by AI when generating proposals and contracts.
            </p>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div className="form-group">
                <label className="input-label">Agency / Business Name</label>
                <input
                  className="input"
                  value={settings.companyName || ''}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Official Outreach Email</label>
                <input
                  type="email"
                  className="input"
                  value={settings.companyEmail || ''}
                  onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Contact Phone</label>
                <input
                  className="input"
                  value={settings.companyPhone || ''}
                  onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Website URL</label>
                <input
                  className="input"
                  value={settings.companyWebsite || ''}
                  onChange={(e) => setSettings({ ...settings, companyWebsite: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Headquarters Address</label>
                <input
                  className="input"
                  value={settings.companyAddress || ''}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Default Email Signature</label>
                <textarea
                  className="input"
                  rows={3}
                  value={settings.emailSignature || ''}
                  onChange={(e) => setSettings({ ...settings, emailSignature: e.target.value })}
                />
              </div>
            </form>

            {/* Services Catalog */}
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Configurable Services Catalog
            </h4>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Base Price</th>
                    <th>Delivery Days</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {(settings.services || []).map((srv, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{srv.name}</td>
                      <td>${(srv.basePrice || 0).toLocaleString()} {srv.currency}</td>
                      <td>{srv.deliveryDays || 14} days</td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{srv.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Email & Resend */}
        {activeTab === 'email' && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>✉️ Resend & SMTP Email Infrastructure</h3>
                <p style={{ fontSize: 13, color: '#64748b' }}>
                  Dispatch outreach emails, proposals, and contracts with high deliverability.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={testingEmail}
                className="btn btn-secondary btn-sm"
              >
                {testingEmail ? <Spinner size={14} /> : '⚡ Dispatch Test Email'}
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="input-label" style={{ fontWeight: 700 }}>Resend API Key</label>
                  {settings.isEnvConfigured?.resend && (
                    <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Active in .env.local ✅</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type={showResendKey ? 'text' : 'password'}
                    className="input"
                    placeholder="re_..."
                    value={settings.resendApiKey || ''}
                    onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResendKey(!showResendKey)}
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    {showResendKey ? '🙈 Hide' : '👁️ Show'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">From Email Address</label>
                <input
                  className="input"
                  value={settings.resendFromEmail || 'onboarding@resend.dev'}
                  onChange={(e) => setSettings({ ...settings, resendFromEmail: e.target.value })}
                />
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Lead Scoring Weights */}
        {activeTab === 'scoring' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎯 AI Lead Scoring Weights (0–100 Engine)
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
              Tune the mathematical point contribution of digital gaps and buying signals.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'websiteMissingWeight', label: '🚫 Website Missing Weight', default: 25 },
                { key: 'poorWebsiteWeight', label: '⚠️ Outdated / Poor Website Weight', default: 20 },
                { key: 'poorMobileWeight', label: '📱 Subpar Mobile Experience Weight', default: 10 },
                { key: 'poorSeoWeight', label: '🔍 Weak SEO Architecture Weight', default: 10 },
                { key: 'lowPerformanceWeight', label: '⚡ Slow TTFB / Performance Weight', default: 10 },
                { key: 'highReviewCountWeight', label: '⭐ High Review Volume (15+ reviews)', default: 5 },
                { key: 'strongCategoryWeight', label: '🏢 High-Ticket Business Category', default: 5 },
                { key: 'publicEmailWeight', label: '✉️ Public Reachable Email Found', default: 5 },
                { key: 'phoneAvailableWeight', label: '📞 Direct Telephone Reachable', default: 5 },
                { key: 'buyingSignalWeight', label: '🎯 High Reputation with Digital Gap', default: 5 },
              ].map((item) => (
                <div key={item.key} style={{ padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#2563eb' }}>
                      {settings.scoringWeights?.[item.key] ?? item.default} pts
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={settings.scoringWeights?.[item.key] ?? item.default}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        scoringWeights: {
                          ...settings.scoringWeights,
                          [item.key]: Number(e.target.value),
                        },
                      })
                    }
                    style={{ width: '100%', accentColor: '#2563eb' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Environment Reference */}
        {activeTab === 'env' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📄 Environment Configuration Template</h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              All variables used by the LeadAI Pro platform.
            </p>

            <pre
              style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: 18,
                borderRadius: 8,
                fontSize: 13,
                fontFamily: 'monospace',
                lineHeight: 1.8,
                overflowX: 'auto',
              }}
            >
{`MONGODB_URI=mongodb://localhost:27017/ai-leads-platform
OPENAI_API_KEY=sk-proj-your_openai_key
OPENAI_MODEL=gpt-4o
GOOGLE_MAPS_API_KEY=your_google_places_api_key
APIFY_API_TOKEN=your_apify_token
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret_key`}
            </pre>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
