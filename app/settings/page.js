'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { toast } from '@/components/ui/Toaster';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui/index';
import {
  KeyRound,
  ShieldCheck,
  Building2,
  Mail,
  Sliders,
  FileCode,
  Eye,
  EyeOff,
  CheckCircle2,
  Save,
  Send,
  Sparkles,
  Bot,
  MapPin,
  Lock,
  Globe,
  DollarSign,
  AlertCircle,
  Clock,
  Briefcase,
  Layers,
} from 'lucide-react';

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
        toast.success('Settings synchronized and saved securely!');
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
    { id: 'providers', label: 'API Keys & Providers', icon: KeyRound, desc: 'Google Places, Apify, OpenAI' },
    { id: 'automations', label: 'Approvals & Safeguards', icon: ShieldCheck, desc: 'Human gating & safety rules' },
    { id: 'company', label: 'Agency Profile & Catalog', icon: Building2, desc: 'Company info & pricing list' },
    { id: 'email', label: 'Email Infrastructure', icon: Mail, desc: 'Resend, SMTP & signatures' },
    { id: 'scoring', label: 'AI Scoring Weights', icon: Sliders, desc: '0-100 algorithmic weights' },
    { id: 'env', label: 'Environment Config', icon: FileCode, desc: 'Variables reference' },
  ];

  if (loading) {
    return (
      <AppLayout title="Platform Settings" subtitle="System configuration and AI tuning">
        <div className="flex justify-center p-20">
          <Spinner size={40} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Platform Settings & Configurations"
      subtitle="Manage external credentials, approval gating, business profile, and AI lead scoring weights"
    >
      {/* Settings Container: Two Column SaaS layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Secondary Navigation Rail */}
        <div className="lg:col-span-1 space-y-1">
          <div className="p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm shadow-slate-200/50 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 font-medium'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-200/60 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs truncate">{tab.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal truncate">{tab.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              loading={saving}
              variant="primary"
              className="w-full"
              icon={<Save className="w-4 h-4" />}
            >
              Save Configurations
            </Button>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* TAB 1: API Keys & Providers */}
          {activeTab === 'providers' && (
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">External API Integrations</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Credentials are stored server-side with zero browser exposure.
                  </p>
                </div>
                <Badge variant="indigo" size="sm">Masked & Protected</Badge>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Google Places API */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Google Maps & Places API Key
                    </label>
                    {settings.isEnvConfigured?.google && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active in .env.local
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type={showGoogleKey ? 'text' : 'password'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      placeholder="AIzaSy..."
                      value={settings.googlePlacesApiKey || ''}
                      onChange={(e) => setSettings({ ...settings, googlePlacesApiKey: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowGoogleKey(!showGoogleKey)}
                      icon={showGoogleKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    >
                      {showGoogleKey ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Powers GooglePlacesProvider for local discovery, rating evaluations, and direct phone enrichment.
                  </p>
                </div>

                {/* Apify API Token */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Apify Crawler API Token
                    </label>
                    {settings.isEnvConfigured?.apify && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active in .env.local
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type={showApifyToken ? 'text' : 'password'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      placeholder="apify_api_..."
                      value={settings.apifyApiToken || ''}
                      onChange={(e) => setSettings({ ...settings, apifyApiToken: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowApifyToken(!showApifyToken)}
                      icon={showApifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    >
                      {showApifyToken ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Powers automated deep scraping of websites, contact info extractors, and competitor analysis.
                  </p>
                </div>

                {/* OpenAI API Key */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      OpenAI API Key
                    </label>
                    {settings.isEnvConfigured?.openai && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active in .env.local
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      placeholder="sk-proj-..."
                      value={settings.openaiApiKey || ''}
                      onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      icon={showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    >
                      {showApiKey ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Synthesizes hyper-personalized cold outreach emails, generates proposals, and classifies replies.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Flagship LLM Model
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.openaiModel || 'gpt-4o'}
                    onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                  >
                    <option value="gpt-4o">GPT-4o (Recommended: Flagship Reasoning & Fast JSON Synthesis)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini (Ultra Fast & Budget-Friendly)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  </select>
                </div>
              </form>
            </Card>
          )}

          {/* TAB 2: Approvals & Safeguards */}
          {activeTab === 'automations' && (
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Commercial Safety & Approval Gating</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enforce human-in-the-loop authorization before outreach dispatches or contract generation.
                  </p>
                </div>
                <Badge variant="warning" size="sm">Safety Gating</Badge>
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: 'requireApprovalForOutreach',
                    label: 'Require Human Approval for AI Outreach Messages',
                    desc: 'All cold emails and personalized follow-ups stay in "Approval Required" status until authorized.',
                  },
                  {
                    key: 'requireApprovalForProposals',
                    label: 'Require Human Approval for Proposals',
                    desc: 'Auto-generated proposals remain in DRAFT status and require explicit review before delivery.',
                  },
                  {
                    key: 'requireApprovalForContracts',
                    label: 'Require Human Approval for Legal Contracts',
                    desc: 'Contracts generated on CLOSED WON stage require verification before sending to client.',
                  },
                  {
                    key: 'autoCreateProposalOnInterested',
                    label: 'Auto-Draft Proposal when Lead becomes "Interested"',
                    desc: 'Prepares scope, timeline, and pricing in DRAFT as soon as positive reply intent is detected.',
                  },
                  {
                    key: 'autoCreateContractOnClosedWon',
                    label: 'Auto-Draft Contract on "Closed Won"',
                    desc: 'Generates agreement document in DRAFT as soon as a deal reaches Closed Won stage.',
                  },
                  {
                    key: 'notifyOwnerOnContractGenerated',
                    label: 'Immediate CRM Owner Notification on Contract Creation',
                    desc: 'Sends instant alert with View, Download PDF, and Send options to deal owner.',
                  },
                  {
                    key: 'enableFollowUpSequences',
                    label: 'Enable 5-Step Automated Follow-Up Sequences',
                    desc: 'Schedules 7-day cadence follow-ups after initial outreach is approved and sent.',
                  },
                  {
                    key: 'autoStopFollowUpOnReply',
                    label: 'Automatic Killswitch on Prospect Reply or Unsubscribe',
                    desc: 'Instantly halts all pending follow-ups when prospect replies, unsubscribes, or closes.',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
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
                      className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {/* TAB 3: Business Profile & Services Catalog */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Agency Commercial Identity</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Business information automatically embedded into AI generated proposals and contracts.
                    </p>
                  </div>
                  <Badge variant="primary" size="sm">Brand Identity</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Agency / Business Name
                    </label>
                    <input
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={settings.companyName || ''}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Official Outreach Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={settings.companyEmail || ''}
                      onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={settings.companyPhone || ''}
                      onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Website URL
                    </label>
                    <input
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={settings.companyWebsite || ''}
                      onChange={(e) => setSettings({ ...settings, companyWebsite: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Headquarters Address
                    </label>
                    <input
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={settings.companyAddress || ''}
                      onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Default Outreach Email Signature
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      value={settings.emailSignature || ''}
                      onChange={(e) => setSettings({ ...settings, emailSignature: e.target.value })}
                    />
                  </div>
                </div>
              </Card>

              {/* Services Catalog */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Configured Services Catalog</h3>
                    <p className="text-xs text-slate-500">Service packages matched with prospective gaps</p>
                  </div>
                  <Badge variant="neutral" size="sm">Catalog</Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50">
                        <th className="p-3">Service Name</th>
                        <th className="p-3">Base Price</th>
                        <th className="p-3">Delivery Days</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(settings.services || []).map((srv, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="p-3 font-semibold text-slate-900">{srv.name}</td>
                          <td className="p-3 font-bold text-blue-600">
                            ${(srv.basePrice || 0).toLocaleString()} {srv.currency}
                          </td>
                          <td className="p-3 text-slate-600">{srv.deliveryDays || 14} days</td>
                          <td className="p-3 text-slate-500 max-w-xs">{srv.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 4: Email Infrastructure */}
          {activeTab === 'email' && (
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Resend & SMTP Email Infrastructure</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    High-deliverability transactional email provider for pitches and client updates.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestEmail}
                  loading={testingEmail}
                  icon={<Send className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Send Test Verification Email
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Resend API Key
                    </label>
                    {settings.isEnvConfigured?.resend && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active in .env.local
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type={showResendKey ? 'text' : 'password'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      placeholder="re_..."
                      value={settings.resendApiKey || ''}
                      onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowResendKey(!showResendKey)}
                      icon={showResendKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    >
                      {showResendKey ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={settings.resendFromEmail || 'onboarding@resend.dev'}
                    onChange={(e) => setSettings({ ...settings, resendFromEmail: e.target.value })}
                  />
                  <p className="text-[11px] text-slate-500">
                    Must be a verified sender domain in your Resend account.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 5: AI Scoring Weights */}
          {activeTab === 'scoring' && (
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Lead Scoring Engine Weights</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize how digital gaps and buying signals accumulate to compute 0–100 scores.
                  </p>
                </div>
                <Badge variant="indigo" size="sm">0-100 Algorithm</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'websiteMissingWeight', label: 'Website Missing', default: 25 },
                  { key: 'poorWebsiteWeight', label: 'Outdated / Poor Website', default: 20 },
                  { key: 'poorMobileWeight', label: 'Subpar Mobile Experience', default: 10 },
                  { key: 'poorSeoWeight', label: 'Weak SEO Architecture', default: 10 },
                  { key: 'lowPerformanceWeight', label: 'Slow TTFB / Performance', default: 10 },
                  { key: 'highReviewCountWeight', label: 'High Review Volume (15+ reviews)', default: 5 },
                  { key: 'strongCategoryWeight', label: 'High-Ticket Business Category', default: 5 },
                  { key: 'publicEmailWeight', label: 'Public Reachable Email Found', default: 5 },
                  { key: 'phoneAvailableWeight', label: 'Direct Telephone Reachable', default: 5 },
                  { key: 'buyingSignalWeight', label: 'High Reputation with Digital Gap', default: 5 },
                ].map((item) => {
                  const val = settings.scoringWeights?.[item.key] ?? item.default;
                  return (
                    <div key={item.key} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                        <span className="text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                          {val} pts
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="40"
                        value={val}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            scoringWeights: {
                              ...settings.scoringWeights,
                              [item.key]: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* TAB 6: Environment Reference */}
          {activeTab === 'env' && (
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Environment Variables Reference</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Platform runtime configuration template for production deployment.
                  </p>
                </div>
                <Badge variant="neutral" size="sm">.env.local</Badge>
              </div>

              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                <pre className="text-sky-300">
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
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
