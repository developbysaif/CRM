'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { LeadScoreBadge, LeadStatusBadge, Spinner } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';

const PIPELINE_STAGES = [
  'New Lead',
  'Qualified',
  'Proposal Sent',
  'Meeting Scheduled',
  'Negotiation',
  'Contract Signed',
  'Invoice Sent',
  'Payment Received',
  'Completed',
  'Lost',
];

export default function LeadDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState('');

  const fetchLead = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setNotes(result.data?.lead?.notes || '');
      }
    } catch {
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchLead();
  }, [id, fetchLead]);

  const lead = data?.lead;
  const proposals = data?.proposals || [];
  const quotations = data?.quotations || [];
  const contracts = data?.contracts || [];
  const invoices = data?.invoices || [];
  const meetings = data?.meetings || [];
  const activities = data?.activities || [];

  async function saveNotes() {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        toast.success('Notes saved successfully');
        fetchLead();
      }
    } catch {
      toast.error('Failed to save notes');
    }
  }

  async function updateStage(newStage) {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus: newStage }),
      });
      if (res.ok) {
        toast.success(`Pipeline stage set to "${newStage}"`);
        fetchLead();
      }
    } catch {
      toast.error('Failed to update stage');
    }
  }

  async function generate(type) {
    setGenerating(type);
    try {
      const urls = {
        proposal: '/api/proposals',
        quotation: '/api/quotations',
        contract: '/api/contracts',
      };
      const res = await fetch(urls[type], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id }),
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success(`${type.toUpperCase()} generated successfully!`);
        const targetUrl = `/${type}s/${resData.data._id}`;
        window.open(targetUrl, '_blank');
        fetchLead();
      } else {
        toast.error(resData.message);
      }
    } catch {
      toast.error(`Error generating ${type}`);
    } finally {
      setGenerating(null);
    }
  }

  async function handleCreateInvoice() {
    setGenerating('invoice');
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: id,
          clientName: lead.name,
          clientEmail: lead.email,
          clientCompany: lead.company,
          clientCountry: lead.country,
          items: [
            {
              description: `${lead.projectType || 'Software'} Development - Milestone 1`,
              quantity: 1,
              rate: 7500,
              amount: 7500,
            },
          ],
        }),
      });
      const invData = await res.json();
      if (invData.success) {
        toast.success('Invoice created!');
        window.open(`/invoices/${invData.data._id}`, '_blank');
        fetchLead();
      }
    } catch {
      toast.error('Failed to create invoice');
    } finally {
      setGenerating(null);
    }
  }

  async function handleBookMeeting() {
    const title = prompt('Enter Meeting Title:', 'Discovery & Architecture Consultation');
    if (!title) return;

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: id,
          title,
          type: 'Discovery Call',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          attendees: [{ name: lead.name, email: lead.email, role: 'Client' }],
        }),
      });
      if (res.ok) {
        toast.success('Meeting scheduled and added to calendar!');
        fetchLead();
      }
    } catch {
      toast.error('Failed to schedule meeting');
    }
  }

  if (loading) {
    return (
      <AppLayout title="Lead Profile" subtitle="Loading CRM record...">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spinner size={40} />
        </div>
      </AppLayout>
    );
  }

  if (!lead) {
    return (
      <AppLayout title="Lead Not Found">
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h3>Lead record not found</h3>
          <Link href="/leads" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
            Return to Leads Directory
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={lead.name} subtitle={`${lead.email} · ${lead.company || 'Direct Client'} · ${lead.country || 'Global'}`}>
      {/* Top Header Card */}
      <div
        className="card"
        style={{
          padding: '24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background:
                lead.leadStatus === 'Hot'
                  ? 'var(--gradient-hot)'
                  : lead.leadStatus === 'Warm'
                  ? 'var(--gradient-warm)'
                  : 'var(--gradient-cold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              color: 'white',
              flexShrink: 0,
            }}
          >
            {lead.name?.[0] || 'L'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{lead.name}</h2>
              <LeadScoreBadge score={lead.leadScore || 50} />
              <LeadStatusBadge status={lead.leadStatus || 'Warm'} />
              <span className="badge badge-primary">{lead.businessType || 'General'}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {lead.company ? `${lead.company} · ` : ''} {lead.projectType || 'Software'} · Target: {lead.budget?.raw || '$15k+'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => generate('proposal')}
            className="btn btn-primary btn-sm"
            disabled={!!generating}
          >
            {generating === 'proposal' ? <Spinner size={14} /> : '📄'} Generate Proposal
          </button>
          <button
            onClick={() => generate('quotation')}
            className="btn btn-success btn-sm"
            disabled={!!generating}
          >
            {generating === 'quotation' ? <Spinner size={14} /> : '💰'} Create Quote
          </button>
          <button
            onClick={() => generate('contract')}
            className="btn btn-secondary btn-sm"
            disabled={!!generating}
            style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
          >
            {generating === 'contract' ? <Spinner size={14} /> : '📝'} Prepare Contract
          </button>
          <button
            onClick={handleCreateInvoice}
            className="btn btn-secondary btn-sm"
            disabled={!!generating}
          >
            🧾 Bill Invoice
          </button>
          <button onClick={handleBookMeeting} className="btn btn-secondary btn-sm">
            📅 Book Meeting
          </button>
        </div>
      </div>

      {/* Stage Progression Stepper */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 4, minWidth: 850 }}>
          {PIPELINE_STAGES.map((stage, i) => {
            const currentIndex = PIPELINE_STAGES.indexOf(lead.pipelineStatus || 'New Lead');
            const stageIndex = PIPELINE_STAGES.indexOf(stage);
            const isActive = stage === (lead.pipelineStatus || 'New Lead');
            const isDone = stageIndex < currentIndex;

            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div
                  onClick={() => updateStage(stage)}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px 6px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(0, 82, 255, 0.15)' : isDone ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-elevated)',
                    border: `1px solid ${isActive ? 'rgba(0, 82, 255, 0.4)' : isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border)'}`,
                    transition: 'var(--transition)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: isActive ? 'var(--primary)' : isDone ? '#10b981' : 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isDone ? '✓ ' : ''}
                    {stage}
                  </div>
                </div>
                {i < PIPELINE_STAGES.length - 1 && (
                  <div style={{ width: 10, height: 2, background: isDone ? '#10b981' : 'var(--border)', flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[
          { id: 'overview', label: '👤 Lead Overview' },
          { id: 'documents', label: `📁 Documents (${proposals.length + quotations.length + contracts.length + invoices.length})` },
          { id: 'meetings', label: `📅 Meetings (${meetings.length})` },
          { id: 'activity', label: `⚡ Activity Timeline (${activities.length})` },
          { id: 'notes', label: '📝 Sales Notes' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Contact Details */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📋 Contact & Client Information</h3>
            {[
              ['Email Address', lead.email, '📧'],
              ['Phone Number', lead.phone || 'Not provided', '📞'],
              ['Company', lead.company || 'Direct Prospect', '🏢'],
              ['Country / Location', lead.country || 'Global', '🌍'],
              ['Website URL', lead.website || 'None', '🔗'],
              ['Acquisition Source', lead.source || 'AI Business Consultant', '🤖'],
            ].map(([label, value, icon]) => (
              <div key={label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Project Qualification */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🤖 AI Technical Blueprint & Scoring</h3>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '16px 20px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: lead.leadScore >= 75 ? '#ef4444' : lead.leadScore >= 45 ? '#f59e0b' : '#3b82f6',
                  }}
                >
                  {lead.leadScore || 50}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Score (0 - 100)</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {lead.leadStatus === 'Hot' ? '🔥 High Priority Deal' : lead.leadStatus === 'Warm' ? '⚡ Active Opportunity' : '❄️ Early Stage Inquiry'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Complexity: <strong>{lead.projectComplexity || 'Medium'}</strong> · Timeline: <strong>{lead.estimatedTimeline || '4-8 weeks'}</strong>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Recommended Tech Stack:</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(lead.recommendedStack?.length ? lead.recommendedStack : ['Next.js 15', 'TypeScript', 'Node.js', 'MongoDB', 'Stripe']).map((t) => (
                  <span key={t} className="badge badge-primary">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {lead.expectedFeatures?.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Features Requested:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {lead.expectedFeatures.map((f) => (
                    <span key={f} className="badge badge-success">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Proposals */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>📄 Proposals ({proposals.length})</h3>
              <button onClick={() => generate('proposal')} className="btn btn-primary btn-sm">
                + New Proposal
              </button>
            </div>
            {proposals.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No proposals generated yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {proposals.map((p) => (
                  <div
                    key={p._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.proposalNumber}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Total: ${(p.pricing?.total || 0).toLocaleString()} · Status: {p.status}
                      </div>
                    </div>
                    <Link href={`/proposals/${p._id}`} className="btn btn-secondary btn-sm">
                      View Proposal →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quotations */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>💰 Quotations ({quotations.length})</h3>
              <button onClick={() => generate('quotation')} className="btn btn-success btn-sm">
                + New Quote
              </button>
            </div>
            {quotations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No quotations generated yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {quotations.map((q) => (
                  <div
                    key={q._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{q.quotationNumber}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Amount: ${(q.total || 0).toLocaleString()} · Status: {q.status}
                      </div>
                    </div>
                    <Link href={`/quotations/${q._id}`} className="btn btn-secondary btn-sm">
                      View Quotation →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contracts */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>📝 Contracts ({contracts.length})</h3>
              <button onClick={() => generate('contract')} className="btn btn-secondary btn-sm">
                + New Contract
              </button>
            </div>
            {contracts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No contracts created yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {contracts.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {c.contractNumber} · {c.projectName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Amount: ${(c.totalAmount || 0).toLocaleString()} · Status: {c.status}
                      </div>
                    </div>
                    <Link href={`/contracts/${c._id}`} className="btn btn-secondary btn-sm">
                      View & Sign Contract →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>🧾 Invoices ({invoices.length})</h3>
              <button onClick={handleCreateInvoice} className="btn btn-secondary btn-sm">
                + New Invoice
              </button>
            </div>
            {invoices.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No invoices billed yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {invoices.map((inv) => (
                  <div
                    key={inv._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{inv.invoiceNumber}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Total: ${(inv.total || 0).toLocaleString()} · Status: {inv.status}
                      </div>
                    </div>
                    <Link href={`/invoices/${inv._id}`} className="btn btn-secondary btn-sm">
                      View Invoice →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Meetings */}
      {activeTab === 'meetings' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Scheduled Calls & Meetings</h3>
            <button onClick={handleBookMeeting} className="btn btn-primary btn-sm">
              + Schedule Meeting
            </button>
          </div>
          {meetings.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No meetings scheduled for this lead yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {meetings.map((m) => (
                <div
                  key={m._id}
                  style={{
                    padding: '14px 18px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      📅 {new Date(m.startTime).toLocaleString()} · {m.type}
                    </div>
                  </div>
                  <a href={m.meetingLink || 'https://meet.google.com'} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    Join Call ↗
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Activity Timeline */}
      {activeTab === 'activity' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Audit Trail & Interaction History</h3>
          {activities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No activity logs recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {activities.map((act) => (
                <div
                  key={act._id}
                  style={{
                    paddingLeft: 16,
                    borderLeft: '2px solid var(--primary)',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>{act.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{act.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date(act.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Notes */}
      {activeTab === 'notes' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>📝 Internal Sales & CRM Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document client discussions, pricing negotiations, specific custom integrations..."
            style={{
              width: '100%',
              minHeight: 200,
              padding: 14,
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: 14,
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button onClick={saveNotes} className="btn btn-primary" style={{ marginTop: 14 }}>
            Save Internal Notes
          </button>
        </div>
      )}
    </AppLayout>
  );
}
