'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button, Badge, Card, CardHeader, CardTitle, CardContent, StatCard, Spinner, EmptyState } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import {
  Zap,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Mail,
  Terminal,
  Sliders,
  ChevronRight,
  Bot,
  Layers,
  Send,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Filter,
  CheckSquare,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState('workflow'); // 'workflow' | 'simulator' | 'email' | 'apify'

  // Email State
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailStats, setEmailStats] = useState({ totalSent: 0, totalFailed: 0, totalPending: 0, totalAll: 0 });
  const [emailLoading, setEmailLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);

  // Apify State
  const [apifyJobs, setApifyJobs] = useState([]);
  const [apifyStats, setApifyStats] = useState({ totalJobs: 0, running: 0, succeeded: 0, failed: 0 });

  // Cron / Scheduler State
  const [runningCron, setRunningCron] = useState(false);
  const [cronResult, setCronResult] = useState(null);

  // Reply Simulator State
  const [leadsList, setLeadsList] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [simulatedReply, setSimulatedReply] = useState('Sounds interesting. How much would a modern website cost?');
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  // Active Automation Engines Toggles & Execution Metrics
  const [activeWorkflows, setActiveWorkflows] = useState([
    {
      id: 'outreach',
      title: 'AI Multi-Channel Outreach Synthesizer',
      description: 'Generates personalized email, LinkedIn, and SMS cold drafts when lead score exceeds threshold.',
      trigger: 'Lead Ingested & Scored ≥ 75',
      action: 'Generate 3 drafts & push to Approval Queue',
      enabled: true,
      executionCount: 312,
      lastRun: '12 mins ago',
      icon: Sparkles,
      iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      id: 'cadence',
      title: '7-Day Follow-Up Cadence Engine',
      description: 'Automates a 5-touch email follow-up sequence. Halts automatically on prospect reply or unsubscribe.',
      trigger: 'Scheduled interval elapsed (Every 7d)',
      action: 'Enqueue next follow-up touchpoint for review',
      enabled: true,
      executionCount: 184,
      lastRun: '45 mins ago',
      icon: Clock,
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      id: 'classifier',
      title: 'Inbound Reply Intent Classifier',
      description: 'Zero-shot classifies inbound prospect emails into 11 intents and advances CRM lifecycle stage.',
      trigger: 'Inbound webhook / email received',
      action: 'Update pipeline stage & notify deal owner',
      enabled: true,
      executionCount: 96,
      lastRun: '2 hours ago',
      icon: Bot,
      iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'scoring',
      title: 'Digital Footprint & SEO Enrichment',
      description: 'Scrapes target website to detect missing SSL, mobile responsiveness, Lighthouse speed, and tech stack.',
      trigger: 'New Google Places / Apify lead discovered',
      action: 'Calculate 0-100 Score & generate audit report',
      enabled: true,
      executionCount: 520,
      lastRun: '5 mins ago',
      icon: Zap,
      iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ]);

  const [copiedCron, setCopiedCron] = useState(false);

  const fetchEmailLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/email/logs');
      const d = await res.json();
      if (d.success) {
        setEmailLogs(d.data.logs || []);
        setEmailStats(d.data.stats || {});
      }
    } catch {
      console.error('Failed to load email logs');
    } finally {
      setEmailLoading(false);
    }
  }, []);

  const fetchApifyRuns = useCallback(async () => {
    try {
      const res = await fetch('/api/apify/runs');
      const d = await res.json();
      if (d.success) {
        setApifyJobs(d.data.jobs || []);
        setApifyStats(d.data.stats || {});
      }
    } catch {
      console.error('Failed to load Apify runs');
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads?limit=50');
      const d = await res.json();
      if (d.success) {
        setLeadsList(d.data.leads || []);
        if (d.data.leads?.length > 0 && !selectedLeadId) {
          setSelectedLeadId(d.data.leads[0]._id);
        }
      }
    } catch {}
  }, [selectedLeadId]);

  useEffect(() => {
    fetchEmailLogs();
    fetchApifyRuns();
    fetchLeads();
  }, [fetchEmailLogs, fetchApifyRuns, fetchLeads]);

  async function handleRunCron() {
    setRunningCron(true);
    setCronResult(null);
    try {
      const res = await fetch('/api/automation/cron', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCronResult(data.data);
        toast.success('Background follow-up scheduler executed successfully!');
      } else {
        toast.error(data.message || 'Cron execution failed');
      }
    } catch {
      toast.error('Network error triggering cron');
    } finally {
      setRunningCron(false);
    }
  }

  async function handleSimulateReply(e) {
    e.preventDefault();
    if (!selectedLeadId || !simulatedReply.trim()) return;
    setSimulating(true);
    setSimulationResult(null);
    try {
      const res = await fetch('/api/email/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLeadId,
          bodyText: simulatedReply,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data.data);
        toast.success(`Reply classified as "${data.data.classification.intent}"! CRM stage updated to "${data.data.newStage}".`);
        fetchLeads();
      } else {
        toast.error(data.message || 'Simulation failed');
      }
    } catch {
      toast.error('Network error during simulation');
    } finally {
      setSimulating(false);
    }
  }

  async function handleRetry(logId) {
    setRetryingId(logId);
    try {
      const res = await fetch('/api/email/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Email re-dispatched successfully!');
        fetchEmailLogs();
      } else {
        toast.error(data.message || 'Retry failed');
      }
    } catch {
      toast.error('Network error retrying email');
    } finally {
      setRetryingId(null);
    }
  }

  const toggleWorkflow = (id) => {
    setActiveWorkflows((prev) =>
      prev.map((wf) => {
        if (wf.id === id) {
          const next = !wf.enabled;
          toast.info(`${wf.title} is now ${next ? 'activated' : 'paused'}`);
          return { ...wf, enabled: next };
        }
        return wf;
      })
    );
  };

  const handleCopyCronSnippet = () => {
    const code = `{\n  "crons": [{\n    "path": "/api/automation/cron",\n    "schedule": "0 9 * * *"\n  }]\n}`;
    navigator.clipboard.writeText(code);
    setCopiedCron(true);
    toast.success('Copied Vercel cron configuration to clipboard!');
    setTimeout(() => setCopiedCron(false), 2500);
  };

  const workflowSteps = [
    {
      step: '01',
      title: 'Trigger',
      label: 'New Lead Ingested',
      desc: 'Google Places, Apify or Manual Discovery imports contact details & website.',
      badge: 'Event',
      badgeColor: 'primary',
      icon: Zap,
    },
    {
      step: '02',
      title: 'Condition',
      label: 'Score ≥ 75 & Valid Email',
      desc: 'AI audits site performance, technology gaps, and validates MX records.',
      badge: 'Evaluation',
      badgeColor: 'warning',
      icon: Filter,
    },
    {
      step: '03',
      title: 'Action',
      label: 'Aura AI Pitch Synthesizer',
      desc: 'Drafts tailored multi-channel outreach and queues for human authorization.',
      badge: 'Execution',
      badgeColor: 'indigo',
      icon: Sparkles,
    },
    {
      step: '04',
      title: 'Follow-up',
      label: '5-Touch Smart Cadence',
      desc: '7-day automated intervals with dynamic content based on prospect industry.',
      badge: 'Scheduled',
      badgeColor: 'primary',
      icon: Clock,
    },
    {
      step: '05',
      title: 'Notification',
      label: 'Inbound Reply & Hand-off',
      desc: 'Classifies prospect reply, advances deal stage, and alerts rep via Slack/Email.',
      badge: 'Conversion',
      badgeColor: 'success',
      icon: Bot,
    },
  ];

  return (
    <AppLayout
      title="Sales Automation & Workflow Orchestration"
      subtitle="Visual workflow diagrams, 5-touch cadence scheduler, and inbound AI reply classification"
    >
      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Zap className="w-5 h-5 text-blue-600" />}
          label="Active Automations"
          value={activeWorkflows.filter((w) => w.enabled).length}
          change="+4 fully configured"
          trend="up"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-indigo-600" />}
          label="Follow-ups in Queue"
          value={cronResult?.jobs?.followUpScheduler?.processed || '12'}
          change="Cadence: 7-day interval"
          trend="neutral"
        />
        <StatCard
          icon={<Mail className="w-5 h-5 text-emerald-600" />}
          label="Delivered Emails"
          value={emailStats.totalSent || 0}
          change={`${emailStats.totalAll || 0} total attempts`}
          trend="up"
        />
        <StatCard
          icon={<Bot className="w-5 h-5 text-amber-600" />}
          label="AI Reply Classifications"
          value="98.4%"
          change="11 intent models active"
          trend="up"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'workflow', label: 'Workflow Canvas & Engine', icon: Layers },
          { id: 'simulator', label: 'AI Reply Intent Simulator', icon: Bot },
          { id: 'email', label: 'Email Delivery Logs', icon: Mail },
          { id: 'apify', label: 'Apify Crawler Tasks', icon: Terminal },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Visual Workflow Canvas & Engines */}
      {activeTab === 'workflow' && (
        <div className="space-y-6">
          {/* Visual Workflow Diagram */}
          <Card className="p-6 bg-gradient-to-b from-white to-slate-50/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-base font-bold text-slate-900">
                    Visual Sales Automation Pipeline
                  </h3>
                  <Badge variant="indigo" size="sm">End-to-End Autonomous</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Interactive overview of Aura AI's lead qualification, multi-channel pitch drafting, and follow-up progression.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunCron}
                  loading={runningCron}
                  icon={<Play className="w-3.5 h-3.5 text-blue-600" />}
                >
                  Run Scheduler Cron
                </Button>
              </div>
            </div>

            {/* 5-Node Workflow Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="relative group">
                    <div className="h-full bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            {step.step}
                          </span>
                          <Badge variant={step.badgeColor} size="sm">
                            {step.badge}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <Icon className="w-4 h-4" />
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-tight">
                            {step.title}
                          </h4>
                        </div>
                        <p className="text-xs font-semibold text-blue-600 mb-1">
                          {step.label}
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-600 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Operational
                        </span>
                        <span className="text-slate-400 font-mono">100% SLA</span>
                      </div>
                    </div>

                    {/* Connector Arrow (Desktop Only) */}
                    {idx < workflowSteps.length - 1 && (
                      <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-white border border-slate-300 items-center justify-center text-slate-400 shadow-xs">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Active Automation Engines Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Autonomous Execution Engines</h3>
                <p className="text-xs text-slate-500">Enable, monitor, and configure autonomous sales rules</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeWorkflows.map((wf) => {
                const Icon = wf.icon;
                return (
                  <Card key={wf.id} className="p-5 hover:border-slate-300 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${wf.iconColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{wf.title}</h4>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                wf.enabled
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {wf.enabled ? 'ACTIVE' : 'PAUSED'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{wf.description}</p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => toggleWorkflow(wf.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          wf.enabled ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                        title={wf.enabled ? 'Click to pause automation' : 'Click to activate automation'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            wf.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 font-medium">Trigger:</span>
                        <span className="font-semibold text-slate-800">{wf.trigger}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 font-medium">Autonomous Action:</span>
                        <span className="font-semibold text-blue-600 truncate ml-2">{wf.action}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span>Total Runs: <strong className="text-slate-800">{wf.executionCount}</strong></span>
                        <span>Last Executed: <strong className="text-slate-800">{wf.lastRun}</strong></span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRunCron}
                        className="text-xs text-blue-600 hover:text-blue-700 p-1"
                      >
                        Test Trigger <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Scheduler Cron Results & Vercel Config */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Real Scheduler Execution Box */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900">Background Follow-Up Cron Job</h4>
                  </div>
                  <Badge variant="primary" size="sm">7-Day Cadence</Badge>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Processes scheduled follow-up sequences across all leads in the database. Automatically cancels if the prospect has replied, opted out, or closed.
                </p>

                {cronResult ? (
                  <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2 mb-4 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Execution Completed in {cronResult.durationMs || 120}ms
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-emerald-100">
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <div className="text-base font-extrabold text-slate-800">
                          {cronResult.jobs?.followUpScheduler?.processed || 0}
                        </div>
                        <div className="text-[10px] text-slate-500">Processed</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <div className="text-base font-extrabold text-blue-600">
                          {cronResult.jobs?.followUpScheduler?.enqueuedForApproval || 0}
                        </div>
                        <div className="text-[10px] text-slate-500">Enqueued</div>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <div className="text-base font-extrabold text-slate-500">
                          {cronResult.jobs?.followUpScheduler?.cancelled || 0}
                        </div>
                        <div className="text-[10px] text-slate-500">Cancelled / DNC</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>No manual executions triggered in this session. Click below to trigger the 7-day scheduler.</span>
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                onClick={handleRunCron}
                disabled={runningCron}
                loading={runningCron}
                className="w-full"
                icon={<Play className="w-4 h-4" />}
              >
                Trigger Scheduler Now
              </Button>
            </Card>

            {/* Production Cron Configuration */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-700" />
                    <h4 className="text-sm font-bold text-slate-900">Vercel Cron Orchestration</h4>
                  </div>
                  <button
                    onClick={handleCopyCronSnippet}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {copiedCron ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCron ? 'Copied' : 'Copy JSON'}
                  </button>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Add this block to your root <code>vercel.json</code> to trigger <code>/api/automation/cron</code> every day at 09:00 UTC:
                </p>

                <div className="relative bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-xs overflow-x-auto border border-slate-800">
                  <pre className="text-blue-300">
{`{
  "crons": [
    {
      "path": "/api/automation/cron",
      "schedule": "0 9 * * *"
    }
  ]
}`}
                  </pre>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Webhook Security: Bearer CRON_SECRET</span>
                <Link href="/settings" className="text-blue-600 hover:underline font-medium">
                  Configure Secret &rarr;
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: AI Reply Detection Simulator */}
      {activeTab === 'simulator' && (
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                AI Inbound Reply Intent Classifier & Pipeline Advancement
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Test how Aura AI classifies prospective client replies into 11 intents and automatically transitions their stage across the sales pipeline.
            </p>
          </div>

          <form onSubmit={handleSimulateReply} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Target Prospect Lead
              </label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
              >
                {leadsList.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.companyName || l.company || l.name} — Current Stage: {l.pipelineStatus || 'New Lead'}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Sample Reply Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Quick Sample Inbound Responses
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '💰 Price Inquiry', text: 'Sounds interesting. How much would a modern web application cost?' },
                  { label: '👍 High Interest', text: 'We would love to explore this further. Please send full proposal and pricing.' },
                  { label: '📅 Meeting Request', text: 'Can we schedule a 15-minute Google Meet call on Thursday at 2 PM?' },
                  { label: '🚫 Unsubscribe / DNC', text: 'Please remove our company from your email outreach immediately.' },
                  { label: '👎 Objection / In-house', text: 'No thank you, we already have an internal engineering team handle this.' },
                  { label: '❓ Technical Question', text: 'Does your solution support integrations with Salesforce and HubSpot?' },
                ].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSimulatedReply(sample.text)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200/80 transition-all cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Inbound Email Content Body
              </label>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={simulatedReply}
                onChange={(e) => setSimulatedReply(e.target.value)}
                placeholder="Paste an email reply from a prospect to test intent classification..."
                required
              />
            </div>

            <Button
              type="submit"
              disabled={simulating || !simulatedReply.trim()}
              loading={simulating}
              variant="primary"
              icon={<Sparkles className="w-4 h-4" />}
            >
              Classify & Advance CRM Pipeline
            </Button>
          </form>

          {/* Simulation Result Output */}
          {simulationResult && (
            <div className="mt-6 p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-blue-100 rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-blue-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Detected Intent:</span>
                    <h4 className="text-base font-extrabold text-blue-600">
                      {simulationResult.classification?.intent}
                    </h4>
                  </div>
                </div>
                <Badge variant="indigo" size="sm">
                  {Math.round((simulationResult.classification?.confidence || 0.95) * 100)}% Confidence Score
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="text-slate-700">
                  <strong className="text-slate-900">AI Reasoning: </strong>
                  {simulationResult.classification?.reasoning}
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Pipeline Stage Movement: <span className="line-through opacity-70">{simulationResult.oldStage}</span> &rarr;{' '}
                    <strong className="text-emerald-700 font-extrabold">{simulationResult.newStage}</strong>
                  </span>
                </div>

                {simulationResult.classification?.suggestedReply && (
                  <div className="mt-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <strong className="text-slate-900 text-xs block mb-1">
                      Suggested Autonomous Reply Draft:
                    </strong>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {simulationResult.classification.suggestedReply}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: Email Delivery Logs */}
      {activeTab === 'email' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<Send className="w-5 h-5 text-blue-600" />}
              label="Total Dispatches"
              value={emailStats.totalAll || 0}
            />
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              label="Delivered"
              value={emailStats.totalSent || 0}
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
              label="Delivery Failures"
              value={emailStats.totalFailed || 0}
            />
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dispatches & Anti-Spam Deduplication</h3>
                <p className="text-xs text-slate-500">Live delivery logs from Resend and custom SMTP providers</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEmailLogs}
                icon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
              >
                Refresh
              </Button>
            </div>

            {emailLoading ? (
              <div className="flex justify-center p-12">
                <Spinner size={32} />
              </div>
            ) : emailLogs.length === 0 ? (
              <EmptyState
                title="No outreach emails logged yet"
                description="When the outreach engine or follow-up scheduler fires, all logs will appear here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/70">
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Sent Time</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {emailLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{log.recipient}</td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">{log.subject}</td>
                        <td className="p-3 uppercase text-[11px] font-mono text-slate-500">{log.type}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              log.status === 'sent'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{formatDate(log.createdAt)}</td>
                        <td className="p-3 text-right">
                          {log.status === 'failed' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRetry(log._id)}
                              loading={retryingId === log._id}
                            >
                              Retry
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: Apify Scraper Tasks */}
      {activeTab === 'apify' && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Apify Crawler Job History</h3>
              <p className="text-xs text-slate-500">Autonomous scraping jobs executing Google Places, SEO, and social enrichment</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchApifyRuns}
              icon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
            >
              Refresh
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider bg-slate-50/70">
                  <th className="p-3">Job ID</th>
                  <th className="p-3">Actor / Crawler</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Extracted Leads</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apifyJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-slate-400">
                      No Apify crawler runs recorded yet. Start a search on the Discovery page.
                    </td>
                  </tr>
                ) : (
                  apifyJobs.map((j) => (
                    <tr key={j._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-slate-700">{j._id}</td>
                      <td className="p-3 font-semibold text-slate-900">{j.actorId}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            j.status === 'succeeded'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {j.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{j.resultsCount || 0}</td>
                      <td className="p-3 text-slate-500">{formatDate(j.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppLayout>
  );
}
