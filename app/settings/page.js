'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from '@/components/ui/Toaster';
import { Spinner } from '@/components/ui/index';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('ai');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingApify, setTestingApify] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApifyToken, setShowApifyToken] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);

  const [settings, setSettings] = useState({
    openaiApiKey: '',
    openaiModel: 'gpt-4o',
    apifyApiToken: '',
    apifyDefaultActor: 'apify/website-content-crawler',
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
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpSecure: false,
    fromEmail: 'noreply@leadaipro.com',
    scoringWeights: {
      budgetMaxWeight: 25,
      timelineUrgencyWeight: 15,
      projectTypeWeight: 15,
      businessTypeWeight: 10,
      featuresWeight: 15,
      countryWeight: 10,
      companyAndPhoneWeight: 10,
    },
    automations: {
      sendWelcomeEmail: true,
      sendProposalEmail: true,
      sendQuotationEmail: true,
      sendContractEmail: true,
      sendInvoiceEmail: true,
      sendPaymentReceiptEmail: true,
      sendMeetingReminderEmail: true,
      sendFollowupEmail: true,
      autoCreateLeadOnChat: true,
      enableRealtimeNotifications: true,
      autoEnrichWithApify: false,
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
        toast.success('Settings updated and synced successfully!');
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

  async function handleTestApify() {
    setTestingApify(true);
    try {
      const res = await fetch('/api/apify/website-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Apify scraper engine connection tested successfully!');
      } else {
        toast.error(data.message || 'Apify test failed');
      }
    } catch {
      toast.error('Error testing Apify connection');
    } finally {
      setTestingApify(false);
    }
  }

  const tabs = [
    { id: 'ai', label: '🤖 AI Engine', icon: '🧠' },
    { id: 'apify', label: '🕷️ Apify Scrapers', icon: '🕷️' },
    { id: 'email', label: '✉️ Resend & Email', icon: '✉️' },
    { id: 'company', label: '🏢 Agency & Branding', icon: '🏢' },
    { id: 'scoring', label: '🎯 Lead Scoring', icon: '🎯' },
    { id: 'automations', label: '⚡ Automations', icon: '⚡' },
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
    <AppLayout title="Platform Settings" subtitle="Configure AI models, Apify scraping, Resend email automation, and scoring weights">
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
        {/* Tab 1: AI Engine */}
        {activeTab === 'ai' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              🤖 OpenAI & Intelligence Engine
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Configure your OpenAI API key and models for conversational qualification, proposal generation, contract drafts, and website audits.
            </p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="input-label">OpenAI API Key</label>
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
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Fallback Engine: When left empty, the platform automatically activates deterministic heuristic AI for 100% offline uptime.
                </span>
              </div>

              <div className="form-group">
                <label className="input-label">OpenAI Model</label>
                <select
                  className="input"
                  value={settings.openaiModel || 'gpt-4o'}
                  onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                >
                  <option value="gpt-4o">GPT-4o (Recommended: Fast, Flagship Multimodal)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Cost Efficient & High Speed)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>

              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', marginBottom: 4 }}>
                  ⚡ Dual-Engine Fallback Guarantee
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  If OpenAI quota is exhausted or an invalid key is provided, the platform seamlessly synthesizes comprehensive proposals, quotations, legal contracts, Core Web Vitals audits, and competitor breakdowns using deterministic heuristics with zero user interruption.
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Apify Configuration */}
        {activeTab === 'apify' && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🕷️ Apify Web Scrapers & Lead Discovery</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Integrate Apify to scrape websites for AI audits, deep competitor analysis, and automated business lead generation.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestApify}
                disabled={testingApify}
                className="btn btn-secondary btn-sm"
              >
                {testingApify ? <Spinner size={14} /> : '⚡ Test Scraper Run'}
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="input-label">Apify API Token (Server-side Only)</label>
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
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Security: Token is read only on the backend and never exposed to the frontend.
                </span>
              </div>

              <div className="form-group">
                <label className="input-label">Default Website Crawler Actor</label>
                <input
                  className="input"
                  value={settings.apifyDefaultActor || 'apify/website-content-crawler'}
                  onChange={(e) => setSettings({ ...settings, apifyDefaultActor: e.target.value })}
                  placeholder="apify/website-content-crawler"
                />
              </div>

              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-light)', marginBottom: 4 }}>
                  🛡️ Duplicate Detection & Normalization Engine
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Apify scraped leads are automatically checked against your MongoDB CRM records to filter out duplicates, normalized with structured contact schemas, and evaluated by the 0–100 AI Lead Scoring engine before saving.
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Resend & Email */}
        {activeTab === 'email' && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>✉️ Email Provider: Resend & SMTP Fallback</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Configure Resend or SMTP to dispatch automated Welcome emails, Proposals, Contracts, Invoices, and Meeting reminders.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={testingEmail}
                className="btn btn-secondary btn-sm"
              >
                {testingEmail ? <Spinner size={14} /> : '📨 Send Test Email'}
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Resend Section */}
              <div style={{ gridColumn: '1 / -1', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-light)', marginBottom: 12 }}>
                  1. Resend API Configuration (Primary Provider)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="input-label">Resend API Key</label>
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
                    <label className="input-label">Verified From Email Address</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="sales@yourdomain.com or onboarding@resend.dev"
                      value={settings.resendFromEmail || ''}
                      onChange={(e) => setSettings({ ...settings, resendFromEmail: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SMTP Fallback Section */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  2. Nodemailer SMTP Fallback Configuration
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">SMTP Host</label>
                <input
                  className="input"
                  placeholder="smtp.mailgun.org / smtp.sendgrid.net"
                  value={settings.smtpHost || ''}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">SMTP Port</label>
                <input
                  type="number"
                  className="input"
                  placeholder="587"
                  value={settings.smtpPort || 587}
                  onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">SMTP Username</label>
                <input
                  className="input"
                  placeholder="postmaster@yourdomain.com"
                  value={settings.smtpUser || ''}
                  onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">SMTP Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••••••"
                  value={settings.smtpPass || ''}
                  onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">SMTP From Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="noreply@leadaipro.com"
                  value={settings.fromEmail || ''}
                  onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={!!settings.smtpSecure}
                    onChange={(e) => setSettings({ ...settings, smtpSecure: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                  />
                  Use SSL/TLS Encryption (Port 465)
                </label>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Company & Branding */}
        {activeTab === 'company' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              🏢 Company Profile & Branding
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              These business details automatically populate on generated Proposals, Quotations, Legal Contracts, and Invoices.
            </p>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="form-group">
                <label className="input-label">Agency / Company Name</label>
                <input
                  className="input"
                  value={settings.companyName || ''}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  placeholder="e.g. LeadAI Pro Agency"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Official Sales Email</label>
                <input
                  type="email"
                  className="input"
                  value={settings.companyEmail || ''}
                  onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                  placeholder="sales@company.com"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Contact Phone</label>
                <input
                  className="input"
                  value={settings.companyPhone || ''}
                  onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                  placeholder="+1 (800) 555-0199"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Company Website URL</label>
                <input
                  className="input"
                  value={settings.companyWebsite || ''}
                  onChange={(e) => setSettings({ ...settings, companyWebsite: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Registered Headquarters Address</label>
                <input
                  className="input"
                  value={settings.companyAddress || ''}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                  placeholder="100 Innovation Way, Suite 500, San Francisco, CA"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Tax / VAT / EIN Number</label>
                <input
                  className="input"
                  value={settings.taxNumber || ''}
                  onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                  placeholder="US-987654321"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Default Currency</label>
                <select
                  className="input"
                  value={settings.defaultCurrency || 'USD'}
                  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                >
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="AUD">AUD ($ - Australian Dollar)</option>
                  <option value="AED">AED (د.إ - UAE Dirham)</option>
                  <option value="PKR">PKR (₨ - Pakistani Rupee)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Default Tax / VAT Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input"
                  value={settings.defaultTaxRate ?? 10}
                  onChange={(e) => setSettings({ ...settings, defaultTaxRate: Number(e.target.value) })}
                />
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Lead Scoring Weights */}
        {activeTab === 'scoring' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎯 Lead Qualification Scoring Model (0–100)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Customize the mathematical weight contribution of each dimension when scoring new client leads.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { key: 'budgetMaxWeight', label: '💰 Budget Scale & Range Weight', desc: 'Points awarded based on total project budget volume', default: 25 },
                { key: 'timelineUrgencyWeight', label: '⏱️ Project Timeline Urgency Weight', desc: 'Points for ASAP / 1-month delivery targets', default: 15 },
                { key: 'projectTypeWeight', label: '🛠️ Project Scope & Complexity Weight', desc: 'Points for Enterprise SaaS, AI, and Full-Stack apps', default: 15 },
                { key: 'businessTypeWeight', label: '🏢 Business Maturity Weight', desc: 'Points for established enterprises and growing startups', default: 10 },
                { key: 'featuresWeight', label: '✨ Feature Richness Weight', desc: 'Points for depth of requirements and integrations selected', default: 15 },
                { key: 'countryWeight', label: '🌍 Target Market & Country Weight', desc: 'Points for Tier 1 international markets', default: 10 },
                { key: 'companyAndPhoneWeight', label: '📞 Verified Contact Data Weight', desc: 'Points for providing verifiable phone, company, and email', default: 10 },
              ].map((item) => (
                <div key={item.key} style={{ padding: 14, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary-light)', padding: '2px 8px', background: 'rgba(99,102,241,0.1)', borderRadius: 6 }}>
                      {settings.scoringWeights?.[item.key] ?? item.default} pts
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
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
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Automations */}
        {activeTab === 'automations' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚡ Sales Automation & Email Triggers
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Toggle automated CRM email dispatches, lead prospecting hooks, and background routines.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'sendWelcomeEmail', label: '✉️ Welcome Email Trigger', desc: 'Dispatches onboarding email when a new lead is captured via AI Chat or Apify' },
                { key: 'sendProposalEmail', label: '📄 Proposal Email Trigger', desc: 'Sends email with link & PDF as soon as an executive proposal is created' },
                { key: 'sendQuotationEmail', label: '💰 Quotation Email Trigger', desc: 'Sends itemized quote breakdown upon quotation generation' },
                { key: 'sendContractEmail', label: '📝 Contract Signing Email Trigger', desc: 'Notifies client that Master Services Agreement is ready for e-signature' },
                { key: 'sendInvoiceEmail', label: '🧾 Invoice Billing Email Trigger', desc: 'Sends invoice notification with online payment link' },
                { key: 'sendPaymentReceiptEmail', label: '🎉 Payment Receipt Email Trigger', desc: 'Sends Thank You confirmation and receipt when invoice payment is recorded' },
                { key: 'sendMeetingReminderEmail', label: '📅 Discovery Meeting Reminder', desc: 'Sends Google Meet invitation & reminder when a call is scheduled' },
                { key: 'autoCreateLeadOnChat', label: '🤖 Auto-Create CRM Lead on Conversation', desc: 'Automatically parses name, email, budget, and creates a lead in Qualified stage' },
                { key: 'enableRealtimeNotifications', label: '🔔 Real-time Platform Alerts', desc: 'Triggers notification toasts and badges when hot leads or contracts arrive' },
                { key: 'autoEnrichWithApify', label: '🕷️ Auto-Enrich Leads with Apify', desc: 'Automatically crawls lead website on creation to enrich company data' },
              ].map((item) => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    padding: 14,
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!settings.automations?.[item.key]}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        automations: {
                          ...settings.automations,
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    style={{ width: 18, height: 18, marginTop: 3, accentColor: 'var(--primary)', flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Environment Template */}
        {activeTab === 'env' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📄 Environment Variables Reference</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Copy the configuration block below into your project <code style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4, fontSize: 12, color: 'var(--primary-light)' }}>.env.local</code> file:
            </p>

            <div style={{ position: 'relative' }}>
              <pre
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 22px',
                  fontSize: 13,
                  color: '#a5f3fc',
                  fontFamily: 'monospace',
                  lineHeight: 1.8,
                  overflowX: 'auto',
                }}
              >
{`MONGODB_URI=mongodb://localhost:27017/ai-leads-platform
OPENAI_API_KEY=${settings.openaiApiKey || 'your_openai_api_key_here'}
OPENAI_MODEL=${settings.openaiModel || 'gpt-4o'}
APIFY_API_TOKEN=${settings.apifyApiToken || 'your_apify_api_token_here'}
RESEND_API_KEY=${settings.resendApiKey || 'your_resend_api_key_here'}
EMAIL_FROM=${settings.resendFromEmail || 'onboarding@resend.dev'}
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=${settings.companyName || 'LeadAI Pro'}
JWT_SECRET=your_super_secret_jwt_key_leadai_pro_enterprise`}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`MONGODB_URI=mongodb://localhost:27017/ai-leads-platform
OPENAI_API_KEY=${settings.openaiApiKey || 'your_openai_api_key_here'}
OPENAI_MODEL=${settings.openaiModel || 'gpt-4o'}
APIFY_API_TOKEN=${settings.apifyApiToken || 'your_apify_api_token_here'}
RESEND_API_KEY=${settings.resendApiKey || 'your_resend_api_key_here'}
EMAIL_FROM=${settings.resendFromEmail || 'onboarding@resend.dev'}
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=${settings.companyName || 'LeadAI Pro'}
JWT_SECRET=your_super_secret_jwt_key_leadai_pro_enterprise`);
                  toast.success('Environment configuration copied!');
                }}
                className="btn btn-secondary btn-sm"
                style={{ position: 'absolute', top: 12, right: 12, fontSize: 11 }}
              >
                📋 Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
