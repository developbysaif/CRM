'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatCard, Spinner, EmptyState } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState('cron'); // 'cron' | 'reply_simulator' | 'email' | 'apify'

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

  return (
    <AppLayout
      title="Sales Automations & Background Workers"
      subtitle="Manage automated 5-step follow-up sequences, inbound AI reply detection, and cron scheduling"
    >
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e2e8f0' }}>
        {[
          { id: 'cron', label: '⏱️ Background Scheduler & Follow-ups' },
          { id: 'reply_simulator', label: '🤖 AI Reply Detection Simulator' },
          { id: 'email', label: '✉️ Email Delivery Logs' },
          { id: 'apify', label: '🕷️ Scraper Tasks' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? '#2563eb' : '#64748b',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Background Scheduler & Cron */}
      {activeTab === 'cron' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                  ⏱️ Background Job Scheduler & Follow-up Processor
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                  Executes the 5-step follow-up sequence on a 7-day cadence. Automatically halts sequences if prospect replied, unsubscribed, or closed.
                </p>
              </div>

              <button
                onClick={handleRunCron}
                disabled={runningCron}
                className="btn btn-primary btn-sm"
              >
                {runningCron ? <Spinner size={14} /> : '⚡ Execute Scheduler Now'}
              </button>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 16,
                fontSize: 13,
                lineHeight: 1.6,
                color: '#334155',
              }}
            >
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Production Deployment Instructions (Vercel Cron):
              </div>
              <div>
                Configure in <code>vercel.json</code> to ping <code>/api/automation/cron</code> every hour or daily:
              </div>
              <pre
                style={{
                  background: '#0f172a',
                  color: '#38bdf8',
                  padding: '10px 14px',
                  borderRadius: 6,
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
{`{
  "crons": [{
    "path": "/api/automation/cron",
    "schedule": "0 9 * * *"
  }]
}`}
              </pre>
            </div>

            {cronResult && (
              <div style={{ marginTop: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#166534', margin: '0 0 6px 0' }}>
                  ✓ Last Scheduler Execution Results ({cronResult.durationMs}ms)
                </h4>
                <div style={{ fontSize: 12, color: '#15803d' }}>
                  • Processed: <strong>{cronResult.jobs?.followUpScheduler?.processed || 0}</strong> follow-ups
                  <br />
                  • Enqueued for Human Approval: <strong>{cronResult.jobs?.followUpScheduler?.enqueuedForApproval || 0}</strong>
                  <br />
                  • Automatically Cancelled (Terminal State / DNC): <strong>{cronResult.jobs?.followUpScheduler?.cancelled || 0}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI Reply Detection Simulator */}
      {activeTab === 'reply_simulator' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
            🤖 AI Reply Classification & CRM Advancement Simulator
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
            Test how incoming prospect emails are classified across the 11 intents and automatically advance the CRM pipeline.
          </p>

          <form onSubmit={handleSimulateReply} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Select Test Lead
              </label>
              <select
                className="input"
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                style={{ fontSize: 13 }}
              >
                {leadsList.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.companyName || l.company || l.name} (Current Stage: {l.pipelineStatus})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Sample Reply Pills */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                Quick Test Samples
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: '💰 Price Request', text: 'Sounds interesting. How much would a website cost?' },
                  { label: '👍 Interested', text: 'We would like to explore this further. Please send details.' },
                  { label: '📅 Meeting Request', text: 'Can we schedule a 15-minute call on Thursday to discuss?' },
                  { label: '🚫 Unsubscribe', text: 'Please remove me from your mailing list immediately.' },
                  { label: '👎 Not Interested', text: 'No thank you, we already have an internal engineering team.' },
                ].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSimulatedReply(sample.text)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11 }}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Client Email Reply Text
              </label>
              <textarea
                className="input"
                rows={4}
                value={simulatedReply}
                onChange={(e) => setSimulatedReply(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={simulating || !simulatedReply.trim()}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', minWidth: 200 }}
            >
              {simulating ? <Spinner size={16} /> : '⚡ Classify & Process Inbound Reply'}
            </button>
          </form>

          {/* Simulation Result Output */}
          {simulationResult && (
            <div style={{ marginTop: 24, padding: 18, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>🎯</span>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Classification: <span style={{ color: '#2563eb' }}>{simulationResult.classification?.intent}</span>
                </h4>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  ({Math.round((simulationResult.classification?.confidence || 0.9) * 100)}% confidence)
                </span>
              </div>

              <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>
                <strong>Reasoning: </strong> {simulationResult.classification?.reasoning}
              </div>

              <div style={{ fontSize: 13, color: '#15803d', marginBottom: 12 }}>
                <strong>CRM Stage Movement: </strong> {simulationResult.oldStage} → <strong>{simulationResult.newStage}</strong>
              </div>

              {simulationResult.classification?.suggestedReply && (
                <div style={{ background: '#ffffff', padding: 12, borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 12 }}>
                  <strong style={{ color: '#0f172a' }}>Suggested AI Response Draft:</strong>
                  <div style={{ marginTop: 4, color: '#334155' }}>{simulationResult.classification.suggestedReply}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Email Delivery Logs */}
      {activeTab === 'email' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <StatCard icon="✉️" label="Total Dispatches" value={emailStats.totalAll || 0} />
            <StatCard icon="✅" label="Delivered" value={emailStats.totalSent || 0} />
            <StatCard icon="❌" label="Delivery Failures" value={emailStats.totalFailed || 0} />
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
              Recent Dispatches & Anti-Spam Deduplication
            </h3>

            {emailLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Spinner size={32} />
              </div>
            ) : emailLogs.length === 0 ? (
              <EmptyState title="No emails logged yet" description="Outreach emails will be recorded here." />
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Subject</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Sent Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailLogs.map((log) => (
                      <tr key={log._id}>
                        <td style={{ fontWeight: 600 }}>{log.recipient}</td>
                        <td style={{ fontSize: 12 }}>{log.subject}</td>
                        <td style={{ fontSize: 11, textTransform: 'uppercase' }}>{log.type}</td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: log.status === 'sent' ? '#dcfce7' : '#fee2e2',
                              color: log.status === 'sent' ? '#15803d' : '#b91c1c',
                            }}
                          >
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontSize: 11, color: '#64748b' }}>{formatDate(log.createdAt)}</td>
                        <td>
                          {log.status === 'failed' && (
                            <button
                              onClick={() => handleRetry(log._id)}
                              disabled={retryingId === log._id}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11 }}
                            >
                              {retryingId === log._id ? 'Retrying...' : 'Retry'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Apify Scraper Tasks */}
      {activeTab === 'apify' && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
            Apify Crawler Run History
          </h3>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Actor</th>
                  <th>Status</th>
                  <th>Results</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {apifyJobs.map((j) => (
                  <tr key={j._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{j._id}</td>
                    <td style={{ fontSize: 12 }}>{j.actorId}</td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: j.status === 'succeeded' ? '#dcfce7' : '#fee2e2',
                          color: j.status === 'succeeded' ? '#15803d' : '#b91c1c',
                        }}
                      >
                        {j.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{j.resultsCount || 0}</td>
                    <td style={{ fontSize: 11, color: '#64748b' }}>{formatDate(j.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
