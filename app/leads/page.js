'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { LeadScoreBadge, LeadStatusBadge, PipelineBadge, Spinner, EmptyState } from '@/components/ui/index';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { toast } from '@/components/ui/Toaster';

const PIPELINE_STAGES = ['New Lead', 'Qualified', 'Proposal Sent', 'Meeting Scheduled', 'Negotiation', 'Contract Signed', 'Invoice Sent', 'Payment Received', 'Completed', 'Lost'];
const STAGE_COLORS = { 'New Lead': '#6366f1', Qualified: '#06b6d4', 'Proposal Sent': '#f59e0b', 'Meeting Scheduled': '#8b5cf6', Negotiation: '#f97316', 'Contract Signed': '#10b981', 'Invoice Sent': '#3b82f6', 'Payment Received': '#059669', Completed: '#047857', Lost: '#ef4444' };

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', leadStatus: '', businessType: '' });
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [generating, setGenerating] = useState({});

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page, limit: 20, search, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) });
      const res = await fetch(`/api/leads?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setLeads(data.data.leads);
        setTotal(data.data.pagination.total);
      }
    } catch { }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function updateStatus(leadId, pipelineStatus) {
    const token = localStorage.getItem('token');
    await fetch(`/api/leads/${leadId}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ pipelineStatus }) });
    fetchLeads();
    toast.success(`Status updated to ${pipelineStatus}`);
  }

  async function generateProposal(leadId) {
    setGenerating(prev => ({ ...prev, [leadId]: 'proposal' }));
    try {
      const res = await fetch('/api/proposals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId }) });
      const data = await res.json();
      if (data.success) {
        toast.success('Proposal generated!');
        window.open(`/proposals/${data.data._id}`, '_blank');
      } else {
        toast.error(data.message);
      }
    } catch { toast.error('Failed to generate proposal'); }
    setGenerating(prev => ({ ...prev, [leadId]: null }));
  }

  async function generateQuotation(leadId) {
    setGenerating(prev => ({ ...prev, [leadId]: 'quotation' }));
    try {
      const res = await fetch('/api/quotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leadId }) });
      const data = await res.json();
      if (data.success) {
        toast.success('Quotation generated!');
        window.open(`/quotations/${data.data._id}`, '_blank');
      } else {
        toast.error(data.message);
      }
    } catch { toast.error('Failed to generate quotation'); }
    setGenerating(prev => ({ ...prev, [leadId]: null }));
  }

  // Group leads by pipeline stage for Kanban
  const kanbanGroups = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter(l => l.pipelineStatus === stage);
    return acc;
  }, {});

  return (
    <AppLayout title="Leads & Pipeline" subtitle={`${total} total leads in CRM`}>
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search leads..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input" style={{ width: 160 }} value={filters.leadStatus} onChange={e => setFilters(p => ({ ...p, leadStatus: e.target.value }))}>
          <option value="">All Quality</option>
          {['Hot', 'Warm', 'Cold'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" style={{ width: 200 }} value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
          <option value="">All Stages</option>
          {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-elevated)', padding: 4, borderRadius: 'var(--radius-md)' }}>
          {[{ v: 'table', icon: '☰' }, { v: 'kanban', icon: '⬜' }].map(({ v, icon }) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 16, background: view === v ? 'var(--gradient-primary)' : 'transparent', color: view === v ? 'white' : 'var(--text-muted)', transition: 'var(--transition)' }}>{icon}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
      ) : leads.length === 0 ? (
        <EmptyState icon="👥" title="No leads found" description="Your AI chat widget will automatically capture leads. Try using it!" />
      ) : view === 'kanban' ? (
        // KANBAN VIEW
        <div className="kanban-board">
          {PIPELINE_STAGES.map(stage => (
            <div key={stage} className="kanban-column">
              <div className="kanban-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: STAGE_COLORS[stage] }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{stage}</span>
                </div>
                <span style={{ background: `${STAGE_COLORS[stage]}20`, color: STAGE_COLORS[stage], fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>{kanbanGroups[stage].length}</span>
              </div>
              <div className="kanban-body">
                {kanbanGroups[stage].map(lead => (
                  <div key={lead._id} className="kanban-card" onClick={() => window.location.href = `/leads/${lead._id}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
                      <LeadScoreBadge score={lead.leadScore} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{lead.company || lead.email}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 'var(--radius-full)', color: 'var(--text-secondary)' }}>{lead.projectType}</span>
                      <LeadStatusBadge status={lead.leadStatus} />
                    </div>
                  </div>
                ))}
                {kanbanGroups[stage].length === 0 && <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No leads</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // TABLE VIEW
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead</th><th>Business</th><th>Project</th><th>Budget</th><th>Score</th><th>Pipeline</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead._id}>
                  <td>
                    <Link href={`/leads/${lead._id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: lead.leadStatus === 'Hot' ? 'var(--gradient-hot)' : lead.leadStatus === 'Warm' ? 'var(--gradient-warm)' : 'var(--gradient-cold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {lead.name?.[0] || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.email}</div>
                        {lead.country && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>🌍 {lead.country}</div>}
                      </div>
                    </Link>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.businessType}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.projectType}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.budget?.raw || '-'}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <LeadScoreBadge score={lead.leadScore} />
                    <LeadStatusBadge status={lead.leadStatus} />
                  </td>
                  <td>
                    <select value={lead.pipelineStatus} onChange={e => updateStatus(lead._id, e.target.value)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '4px 8px', fontSize: 11, color: 'var(--text-primary)', cursor: 'pointer', outline: 'none' }}>
                      {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/leads/${lead._id}`} className="btn btn-secondary btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}>View</Link>
                      <button onClick={() => generateProposal(lead._id)} className="btn btn-primary btn-sm" style={{ fontSize: 11, padding: '4px 10px' }} disabled={!!generating[lead._id]}>
                        {generating[lead._id] === 'proposal' ? '...' : '📄'}
                      </button>
                      <button onClick={() => generateQuotation(lead._id)} className="btn btn-success btn-sm" style={{ fontSize: 11, padding: '4px 10px' }} disabled={!!generating[lead._id]}>
                        {generating[lead._id] === 'quotation' ? '...' : '💰'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Showing {leads.length} of {total} leads</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>Page {page}</span>
              <button className="btn btn-secondary btn-sm" disabled={leads.length < 20} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
