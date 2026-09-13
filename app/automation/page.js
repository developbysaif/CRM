'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatCard, Spinner, EmptyState } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'apify'

  // Email State
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailStats, setEmailStats] = useState({ totalSent: 0, totalFailed: 0, totalPending: 0, totalAll: 0 });
  const [emailLoading, setEmailLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);

  // Quick Send Email Modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    template: 'welcome',
    clientName: '',
    projectName: '',
    customSubject: '',
  });

  // Apify State
  const [apifyJobs, setApifyJobs] = useState([]);
  const [apifyStats, setApifyStats] = useState({ totalJobs: 0, running: 0, succeeded: 0, failed: 0 });
  const [apifyLoading, setApifyLoading] = useState(true);
  const [runningScraper, setRunningScraper] = useState(false);
  const [scraperForm, setScraperForm] = useState({
    query: 'AI SaaS Startups',
    location: 'San Francisco, CA',
    industry: 'AI Startup',
    limit: 5,
  });

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
    } finally {
      setApifyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmailLogs();
    fetchApifyRuns();
    const interval = setInterval(() => {
      fetchEmailLogs();
      fetchApifyRuns();
    }, 20000);
    return () => clearInterval(interval);
  }, [fetchEmailLogs, fetchApifyRuns]);

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

  async function handleSendCustomEmail(e) {
    e.preventDefault();
    if (!emailForm.to) return;
    setSendingEmail(true);
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailForm.to,
          template: emailForm.template,
          subject: emailForm.customSubject || undefined,
          variables: {
            clientName: emailForm.clientName || 'Valued Client',
            projectName: emailForm.projectName || 'Software Development',
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Email dispatched successfully!');
        setShowSendModal(false);
        setEmailForm({ to: '', template: 'welcome', clientName: '', projectName: '', customSubject: '' });
        fetchEmailLogs();
      } else {
        toast.error(data.message || 'Failed to dispatch email');
      }
    } catch {
      toast.error('Network error sending email');
    } finally {
      setSendingEmail(false);
    }
  }

  async function handleRunLeadScraper(e) {
    e.preventDefault();
    setRunningScraper(true);
    try {
      const res = await fetch('/api/apify/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scraperForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Scraper finished: ${data.data.savedCount} new leads saved (${data.data.duplicatesDetected} duplicates filtered)`);
        fetchApifyRuns();
        fetchEmailLogs();
      } else {
        toast.error(data.message || 'Scraper run failed');
      }
    } catch {
      toast.error('Network error starting scraper');
    } finally {
      setRunningScraper(false);
    }
  }

  return (
    <AppLayout title="Automation & Scrapers" subtitle="Apify web intelligence and Resend email delivery engine">
      {/* Top Controls & Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('email')}
            className={`btn ${activeTab === 'email' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            ✉️ Email Automation ({emailStats.totalAll || 0})
          </button>
          <button
            onClick={() => setActiveTab('apify')}
            className={`btn ${activeTab === 'apify' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            🤖 Apify Scraper Hub ({apifyStats.totalJobs || 0})
          </button>
        </div>

        <div>
          {activeTab === 'email' ? (
            <button onClick={() => setShowSendModal(true)} className="btn btn-primary btn-sm">
              ✉️ Send Test / Manual Email
            </button>
          ) : (
            <Link href="/leads" className="btn btn-secondary btn-sm">
              View CRM Leads Pipeline →
            </Link>
          )}
        </div>
      </div>

      {/* ===================== TAB 1: EMAIL AUTOMATION ===================== */}
      {activeTab === 'email' && (
        <div>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 28 }}>
            <StatCard icon="✉️" label="Total Emails Dispatched" value={emailStats.totalAll || 0} sub="Lifetime automated activity" gradient="linear-gradient(135deg,#0052ff,#7c3aed)" />
            <StatCard icon="✅" label="Successfully Delivered" value={emailStats.totalSent || 0} sub="Confirmed by Resend / SMTP" gradient="linear-gradient(135deg,#10b981,#06b6d4)" />
            <StatCard icon="⚠️" label="Delivery Failures" value={emailStats.totalFailed || 0} sub="Pending retry" gradient="linear-gradient(135deg,#ef4444,#f59e0b)" />
            <StatCard icon="🛡️" label="Deduplication Guard" value="Active" sub="Zero duplicate email delivery" gradient="linear-gradient(135deg,#6366f1,#8b5cf6)" />
          </div>

          {/* Email Logs Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Email Delivery Activity Stream</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Real-time Resend and SMTP transactional logs with deduplication keys</p>
              </div>
              <button onClick={fetchEmailLogs} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                🔄 Refresh Logs
              </button>
            </div>

            {emailLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <Spinner size={36} />
              </div>
            ) : emailLogs.length === 0 ? (
              <EmptyState
                icon="✉️"
                title="No email logs yet"
                description="Automated emails triggered by leads, proposals, or invoices will appear here"
                action={
                  <button onClick={() => setShowSendModal(true)} className="btn btn-primary btn-sm">
                    Send First Test Email →
                  </button>
                }
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Template Type</th>
                      <th>Subject</th>
                      <th>Provider</th>
                      <th>Status</th>
                      <th>Sent Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailLogs.map((log) => (
                      <tr key={log._id}>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{log.recipient}</div>
                          {log.leadId?.name && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              Lead: {log.leadId.name} ({log.leadId.company || 'Direct'})
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)', textTransform: 'uppercase' }}>
                            {log.type}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 220 }} className="truncate">
                          {log.subject}
                        </td>
                        <td>
                          <span style={{ fontSize: 11, fontFamily: 'monospace', color: log.provider === 'resend' ? '#10b981' : 'var(--text-muted)' }}>
                            {log.provider?.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              log.status === 'sent'
                                ? 'badge-success'
                                : log.status === 'failed'
                                ? 'badge-danger'
                                : 'badge-primary'
                            }`}
                          >
                            {log.status === 'sent' ? '✓ Delivered' : log.status === 'failed' ? '✗ Failed' : '⏳ Pending'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {formatDate(log.sentAt || log.createdAt)}
                        </td>
                        <td>
                          {log.status === 'failed' ? (
                            <button
                              onClick={() => handleRetry(log._id)}
                              disabled={retryingId === log._id}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11 }}
                            >
                              {retryingId === log._id ? <Spinner size={12} /> : '🔄 Retry'}
                            </button>
                          ) : (
                            <span style={{ fontSize: 11, color: '#10b981' }}>Complete</span>
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

      {/* ===================== TAB 2: APIFY SCRAPER HUB ===================== */}
      {activeTab === 'apify' && (
        <div>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 28 }}>
            <StatCard icon="🤖" label="Total Scraper Runs" value={apifyStats.totalJobs || 0} sub="Audit, Competitor, Lead Gen" gradient="linear-gradient(135deg,#0052ff,#7c3aed)" />
            <StatCard icon="⚡" label="Active / Running Jobs" value={apifyStats.running || 0} sub="Background Apify actors" gradient="linear-gradient(135deg,#06b6d4,#0052ff)" />
            <StatCard icon="🎯" label="Lead Generation Tasks" value={apifyStats.leadGenJobs || 0} sub="Automated prospecting" gradient="linear-gradient(135deg,#f59e0b,#ef4444)" />
            <StatCard icon="🔍" label="Site Audits & Intel" value={(apifyStats.websiteAudits || 0) + (apifyStats.competitorAnalyses || 0)} sub="Deep DOM & SEO analyses" gradient="linear-gradient(135deg,#10b981,#06b6d4)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
            {/* Scraper Launch Pad */}
            <div className="card" style={{ padding: 24, height: 'fit-content' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                🚀 Launch Apify Lead Prospector
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>
                Scrape real-world business directories, filter out duplicates automatically, calculate 0–100 AI lead qualification scores, and populate your CRM pipeline.
              </p>

              <form onSubmit={handleRunLeadScraper} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="input-label">Search Query / Keyword</label>
                  <input
                    className="input"
                    required
                    value={scraperForm.query}
                    onChange={(e) => setScraperForm({ ...scraperForm, query: e.target.value })}
                    placeholder="e.g. Dental Clinics, AI SaaS, Boutique Hotels"
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Location / Target Market</label>
                  <input
                    className="input"
                    required
                    value={scraperForm.location}
                    onChange={(e) => setScraperForm({ ...scraperForm, location: e.target.value })}
                    placeholder="e.g. New York, NY or Austin, Texas"
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Industry Classification</label>
                  <select
                    className="input"
                    value={scraperForm.industry}
                    onChange={(e) => setScraperForm({ ...scraperForm, industry: e.target.value })}
                  >
                    {['Restaurant', 'Hospital', 'Real Estate', 'School', 'Travel', 'AI Startup', 'Ecommerce', 'Portfolio', 'Agency', 'Manufacturing', 'Healthcare', 'Finance', 'Education', 'Other'].map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <label className="input-label">Prospects to Discover</label>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-light)' }}>
                      {scraperForm.limit} leads
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={scraperForm.limit}
                    onChange={(e) => setScraperForm({ ...scraperForm, limit: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>

                <button type="submit" disabled={runningScraper} className="btn btn-primary" style={{ marginTop: 8 }}>
                  {runningScraper ? <Spinner size={16} /> : '⚡ Run Apify Prospector'}
                </button>
              </form>
            </div>

            {/* Apify Jobs History */}
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Scraper Execution History</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Audit runs, competitor intelligence, and automated lead generation</p>
                </div>
                <button onClick={fetchApifyRuns} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                  🔄 Refresh
                </button>
              </div>

              {apifyLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                  <Spinner size={36} />
                </div>
              ) : apifyJobs.length === 0 ? (
                <EmptyState
                  icon="🤖"
                  title="No Apify jobs yet"
                  description="Run a lead scraper or website audit to see execution tracking"
                />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Job Type</th>
                        <th>Actor ID</th>
                        <th>Input / Target</th>
                        <th>Status</th>
                        <th>Results</th>
                        <th>Executed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apifyJobs.map((job) => (
                        <tr key={job._id}>
                          <td>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,82,255,0.1)', color: 'var(--primary-light)' }}>
                              {job.jobType?.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                            {job.actorId}
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180 }} className="truncate">
                            {job.inputData?.url || job.inputData?.query || job.inputData?.myWebsite || 'Input Data'}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                job.status === 'succeeded'
                                  ? 'badge-success'
                                  : job.status === 'failed'
                                  ? 'badge-danger'
                                  : 'badge-primary'
                              }`}
                            >
                              {job.status === 'succeeded' ? '✓ Complete' : job.status === 'failed' ? '✗ Failed' : '⏳ Running'}
                            </span>
                          </td>
                          <td style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {job.resultsSummary?.savedCount !== undefined
                              ? `${job.resultsSummary.savedCount} saved (${job.resultsSummary.duplicatesDetected || 0} filtered)`
                              : job.resultsCount || 1}
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {formatDate(job.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MANUAL SEND EMAIL MODAL ===================== */}
      {showSendModal && (
        <div className="modal-overlay" onClick={() => setShowSendModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>✉️ Dispatch Email (Resend / SMTP)</h3>
              <button onClick={() => setShowSendModal(false)} className="btn btn-ghost btn-sm">
                ✕
              </button>
            </div>
            <form onSubmit={handleSendCustomEmail} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="input-label">Recipient Email</label>
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="prospect@company.com"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Email Template</label>
                <select
                  className="input"
                  value={emailForm.template}
                  onChange={(e) => setEmailForm({ ...emailForm, template: e.target.value })}
                >
                  <option value="welcome">Welcome Email</option>
                  <option value="proposal">Proposal Notification Email</option>
                  <option value="quotation">Quotation Notification Email</option>
                  <option value="contract">Legal Contract Ready Email</option>
                  <option value="invoice">Invoice Issued Email</option>
                  <option value="followup">Sales Follow-up Email</option>
                  <option value="meeting_reminder">Meeting Reminder Email</option>
                  <option value="payment_reminder">Payment Reminder Email</option>
                  <option value="status_update">Project Status Update Email</option>
                  <option value="thank_you">Thank You & Payment Receipt</option>
                </select>
              </div>

              <div className="form-group">
                <label className="input-label">Client / Contact Name</label>
                <input
                  className="input"
                  placeholder="e.g. Johnathan Smith"
                  value={emailForm.clientName}
                  onChange={(e) => setEmailForm({ ...emailForm, clientName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Project Name / Solution</label>
                <input
                  className="input"
                  placeholder="e.g. Enterprise AI Platform"
                  value={emailForm.projectName}
                  onChange={(e) => setEmailForm({ ...emailForm, projectName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Custom Subject (Optional)</label>
                <input
                  className="input"
                  placeholder="Leave empty to use standard template subject"
                  value={emailForm.customSubject}
                  onChange={(e) => setEmailForm({ ...emailForm, customSubject: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setShowSendModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" disabled={sendingEmail} className="btn btn-primary btn-sm">
                  {sendingEmail ? <Spinner size={16} /> : '🚀 Dispatch Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
