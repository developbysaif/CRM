'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { LeadScoreBadge, LeadStatusBadge, Spinner, EmptyState } from '@/components/ui/index';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { toast } from '@/components/ui/Toaster';

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

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', leadStatus: '', businessType: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [generating, setGenerating] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company: '',
    country: '',
    businessType: 'AI Startup',
    projectType: 'Website',
    budgetRaw: '$10k - $25k',
    leadScore: 75,
    leadStatus: 'Warm',
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 25,
        search,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      });
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data.leads || []);
        setTotal(data.data.pagination?.total || 0);
      }
    } catch {}
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function updateStatus(leadId, pipelineStatus) {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, pipelineStatus } : l)));
        toast.success(`Stage updated to ${pipelineStatus}`);
      }
    } catch {
      toast.error('Failed to update stage');
    }
  }

  async function handleCreateLead(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLead,
          budget: { raw: newLead.budgetRaw },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Lead created successfully!');
        setIsAddModalOpen(false);
        setNewLead({
          name: '',
          email: '',
          company: '',
          country: '',
          businessType: 'AI Startup',
          projectType: 'Website',
          budgetRaw: '$10k - $25k',
          leadScore: 75,
          leadStatus: 'Warm',
        });
        fetchLeads();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to create lead');
    }
  }

  async function generateProposal(leadId) {
    setGenerating((prev) => ({ ...prev, [leadId]: 'proposal' }));
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Proposal generated!');
        window.open(`/proposals/${data.data._id}`, '_blank');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to generate proposal');
    }
    setGenerating((prev) => ({ ...prev, [leadId]: null }));
  }

  async function generateQuotation(leadId) {
    setGenerating((prev) => ({ ...prev, [leadId]: 'quotation' }));
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Quotation generated!');
        window.open(`/quotations/${data.data._id}`, '_blank');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to generate quotation');
    }
    setGenerating((prev) => ({ ...prev, [leadId]: null }));
  }

  return (
    <AppLayout title="Leads Directory" subtitle={`${total} total leads across sales stages`}>
      {/* Header Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 10, flex: 1, minWidth: 260, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              🔍
            </span>
            <input
              className="input"
              style={{ paddingLeft: 36 }}
              placeholder="Search leads by name, email, company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="input"
            style={{ width: 140 }}
            value={filters.leadStatus}
            onChange={(e) => setFilters((p) => ({ ...p, leadStatus: e.target.value }))}
          >
            <option value="">All Quality</option>
            {['Hot', 'Warm', 'Cold'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="input"
            style={{ width: 170 }}
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="">All Stages</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/pipeline" className="btn btn-secondary btn-sm">
            📊 Kanban Board
          </Link>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary btn-sm">
            + Add Lead
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size={36} />
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No leads found"
          description="Use the AI Consultant or click '+ Add Lead' to add prospects."
          action={
            <Link href="/chat" className="btn btn-primary btn-sm">
              🤖 Launch AI Consultant
            </Link>
          }
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead / Contact</th>
                <th>Business Sector</th>
                <th>Project Type</th>
                <th>Budget</th>
                <th>AI Score</th>
                <th>Pipeline Stage</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td>
                    <Link href={`/leads/${lead._id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
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
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        {lead.name?.[0] || 'L'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.email}</div>
                        {lead.company && <div style={{ fontSize: 10, color: 'var(--primary)' }}>🏢 {lead.company}</div>}
                      </div>
                    </Link>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lead.businessType || 'General'}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lead.projectType || 'Software'}</td>
                  <td style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{lead.budget?.raw || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <LeadScoreBadge score={lead.leadScore || 50} />
                      <LeadStatusBadge status={lead.leadStatus || 'Warm'} />
                    </div>
                  </td>
                  <td>
                    <select
                      value={lead.pipelineStatus || 'New Lead'}
                      onChange={(e) => updateStatus(lead._id, e.target.value)}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '5px 8px',
                        fontSize: 11.5,
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      {PIPELINE_STAGES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Link href={`/leads/${lead._id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
                        View
                      </Link>
                      <button
                        onClick={() => generateProposal(lead._id)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Generate Proposal"
                        disabled={!!generating[lead._id]}
                      >
                        {generating[lead._id] === 'proposal' ? '...' : '📄 Proposal'}
                      </button>
                      <button
                        onClick={() => generateQuotation(lead._id)}
                        className="btn btn-success btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Generate Quotation"
                        disabled={!!generating[lead._id]}
                      >
                        {generating[lead._id] === 'quotation' ? '...' : '💰 Quote'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {leads.length} of {total} leads
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </button>
              <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>Page {page}</span>
              <button className="btn btn-secondary btn-sm" disabled={leads.length < 25} onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Lead">
        <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="input-label">Client Name *</label>
            <input
              className="input"
              required
              value={newLead.name}
              onChange={(e) => setNewLead((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. John Doe"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="input-label">Email Address *</label>
              <input
                className="input"
                type="email"
                required
                value={newLead.email}
                onChange={(e) => setNewLead((p) => ({ ...p, email: e.target.value }))}
                placeholder="john@company.com"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Company Name</label>
              <input
                className="input"
                value={newLead.company}
                onChange={(e) => setNewLead((p) => ({ ...p, company: e.target.value }))}
                placeholder="Acme Inc."
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="input-label">Industry / Business Sector</label>
              <select
                className="input"
                value={newLead.businessType}
                onChange={(e) => setNewLead((p) => ({ ...p, businessType: e.target.value }))}
              >
                {[
                  'Restaurant', 'Hospital', 'Real Estate', 'School', 'Travel', 'AI Startup',
                  'Ecommerce', 'Portfolio', 'Agency', 'Manufacturing', 'Healthcare', 'Finance', 'Education'
                ].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Project Type</label>
              <select
                className="input"
                value={newLead.projectType}
                onChange={(e) => setNewLead((p) => ({ ...p, projectType: e.target.value }))}
              >
                {['Website', 'Mobile App', 'AI Solution', 'CRM', 'ERP', 'Dashboard', 'Marketplace', 'SaaS', 'Booking System', 'Custom Software'].map(
                  (pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="input-label">Estimated Budget</label>
              <input
                className="input"
                value={newLead.budgetRaw}
                onChange={(e) => setNewLead((p) => ({ ...p, budgetRaw: e.target.value }))}
                placeholder="$10k - $25k"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Country</label>
              <input
                className="input"
                value={newLead.country}
                onChange={(e) => setNewLead((p) => ({ ...p, country: e.target.value }))}
                placeholder="United States"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Create Lead
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
