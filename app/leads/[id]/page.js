'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { LeadScoreBadge, LeadStatusBadge, PipelineBadge, Spinner } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import { formatDate } from '@/lib/utils';

const PIPELINE_STAGES = ['New Lead', 'Qualified', 'Proposal Sent', 'Meeting Scheduled', 'Negotiation', 'Contract Signed', 'Invoice Sent', 'Payment Received', 'Completed', 'Lost'];

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (id) fetchLead();
  }, [id]);

  async function fetchLead() {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/leads/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) {
      setLead(data.data);
      setNotes(data.data.notes || '');
    }
    setLoading(false);
  }

  async function saveNotes() {
    const token = localStorage.getItem('token');
    await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }) });
    toast.success('Notes saved');
  }

  async function updateStatus(field, value) {
    const token = localStorage.getItem('token');
    await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: value }) });
    setLead(prev => ({ ...prev, [field]: value }));
    toast.success('Updated successfully');
  }

  async function generate(type) {
    setGenerating(type);
    try {
      const urls = { proposal: '/api/proposals', quotation: '/api/quotations', contract: '/api/contracts' };
      const res = await fetch(urls[type], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: id, totalAmount: lead?.budget?.max || 0 }) });
      const data = await res.json();
      if (data.success) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} generated!`);
        const paths = { proposal: `/proposals/${data.data._id}`, quotation: `/quotations/${data.data._id}`, contract: `/contracts/${data.data._id}` };
        window.open(paths[type], '_blank');
        fetchLead();
      } else { toast.error(data.message); }
    } catch { toast.error(`Failed to generate ${type}`); }
    setGenerating(null);
  }

  async function scheduleMeeting() {
    const title = prompt('Meeting title (e.g., Discovery Call):');
    if (!title) return;
    const dateStr = prompt('Date & time (e.g., 2026-07-15T14:00):');
    if (!dateStr) return;
    const token = localStorage.getItem('token');
    const startTime = new Date(dateStr);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    await fetch('/api/meetings', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId: id, title, type: 'Discovery Call', startTime, endTime, attendees: [{ name: lead.name, email: lead.email }] }) });
    toast.success('Meeting scheduled!');
    fetchLead();
  }

  if (loading) return <AppLayout title="Lead Detail"><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div></AppLayout>;
  if (!lead) return <AppLayout title="Lead Not Found"><div style={{ padding: 40, textAlign: 'center' }}>Lead not found</div></AppLayout>;

  return (
    <AppLayout title={lead.name} subtitle={`${lead.email} · ${lead.country || 'Unknown Location'}`}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: lead.leadStatus === 'Hot' ? 'var(--gradient-hot)' : lead.leadStatus === 'Warm' ? 'var(--gradient-warm)' : 'var(--gradient-cold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: 'white', flexShrink: 0 }}>
            {lead.name?.[0]}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{lead.name}</h2>
              <LeadScoreBadge score={lead.leadScore} />
              <LeadStatusBadge status={lead.leadStatus} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{lead.company && `${lead.company} · `}{lead.businessType} · {lead.projectType}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => generate('proposal')} className="btn btn-primary btn-sm" disabled={!!generating}>
            {generating === 'proposal' ? <Spinner size={14} /> : '📄'} Proposal
          </button>
          <button onClick={() => generate('quotation')} className="btn btn-success btn-sm" disabled={!!generating}>
            {generating === 'quotation' ? <Spinner size={14} /> : '💰'} Quotation
          </button>
          <button onClick={() => generate('contract')} className="btn btn-secondary btn-sm" disabled={!!generating} style={{ borderColor: '#8b5cf6', color: '#c084fc' }}>
            {generating === 'contract' ? <Spinner size={14} /> : '📝'} Contract
          </button>
          <button onClick={scheduleMeeting} className="btn btn-secondary btn-sm">📅 Meeting</button>
        </div>
      </div>

      {/* Pipeline Stage Stepper */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 4, minWidth: 800 }}>
          {PIPELINE_STAGES.slice(0, -1).map((stage, i) => {
            const currentIndex = PIPELINE_STAGES.indexOf(lead.pipelineStatus);
            const stageIndex = PIPELINE_STAGES.indexOf(stage);
            const isActive = stage === lead.pipelineStatus;
            const isDone = stageIndex < currentIndex;
            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div onClick={() => updateStatus('pipelineStatus', stage)} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: isActive ? 'rgba(99,102,241,0.2)' : isDone ? 'rgba(16,185,129,0.1)' : 'var(--bg-elevated)', border: `1px solid ${isActive ? 'rgba(99,102,241,0.5)' : isDone ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`, transition: 'var(--transition)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? 'var(--primary-light)' : isDone ? '#10b981' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {isDone ? '✓ ' : ''}{stage}
                  </div>
                </div>
                {i < PIPELINE_STAGES.length - 2 && <div style={{ width: 14, height: 2, background: isDone ? '#10b981' : 'var(--border)', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {['overview', 'project', 'notes'].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'overview' ? '👤 Overview' : t === 'project' ? '💻 Project Details' : '📝 Notes'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📋 Contact Information</h3>
            {[['Email', lead.email, '📧'], ['Phone', lead.phone || '-', '📞'], ['Company', lead.company || '-', '🏢'], ['Country', lead.country || '-', '🌍'], ['Website', lead.website || '-', '🔗'], ['Source', lead.source || 'AI Chat', '⚡']].map(([label, value, icon]) => (
              <div key={label} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🤖 AI Analysis</h3>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ textAlign: 'center', flex: 1, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: lead.leadScore >= 70 ? '#ef4444' : lead.leadScore >= 40 ? '#f59e0b' : '#60a5fa' }}>{lead.leadScore}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lead Score</div>
              </div>
              <div style={{ flex: 2 }}>
                {[['Complexity', lead.projectComplexity], ['Timeline', lead.estimatedTimeline], ['Developers', lead.requiredDevelopers ? `${lead.requiredDevelopers} needed` : '-']].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{v || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
            {lead.recommendedStack?.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Recommended Stack</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {lead.recommendedStack.map(tech => (
                    <span key={tech} className="badge badge-primary">{tech}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'project' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📁 Project Details</h3>
            {[['Business Type', lead.businessType], ['Project Type', lead.projectType], ['Target Audience', lead.targetAudience || '-'], ['Budget', lead.budget?.raw || '-'], ['Deadline', lead.deadline || '-'], ['Urgency', lead.urgency]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{v || '-'}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>🎯 Business Goals</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{lead.businessGoals || 'Not provided'}</p>
            {lead.expectedFeatures?.length > 0 && (
              <>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Expected Features</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {lead.expectedFeatures.map(f => <span key={f} className="badge badge-primary">{f}</span>)}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📝 Sales Notes</h3>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add notes about this lead..." style={{ width: '100%', minHeight: 200, padding: 14, background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={saveNotes} className="btn btn-primary" style={{ marginTop: 12 }}>Save Notes</button>
        </div>
      )}
    </AppLayout>
  );
}
