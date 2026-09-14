'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { LeadScoreBadge, Spinner, EmptyState } from '@/components/ui/index';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { toast } from '@/components/ui/Toaster';

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
    phone: '',
    website: '',
    country: '',
    businessType: 'Restaurant',
    projectType: 'Website',
    budgetRaw: '$5k - $15k',
    leadScore: 75,
    leadStatus: 'Warm',
  });

  const stagesList = [
    'New Lead', 'Qualified', 'Contacted', 'Replied', 'Interested', 'Meeting',
    'Proposal Sent', 'Negotiation', 'Closed Won', 'Contract Sent', 'Contract Signed',
    'Payment Pending', 'Paid', 'Completed', 'Closed Lost', 'Do Not Contact'
  ];

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
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, pipelineStatus } : l)));
        toast.success(`Stage moved to ${pipelineStatus}`);
        if (pipelineStatus === 'Interested') {
          toast.success('📄 AI Proposal Draft generated! Check Approval Center');
        } else if (pipelineStatus === 'Closed Won') {
          toast.success('📝 Contract generated in DRAFT! Check Owner Alert');
        }
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
          phone: '',
          website: '',
          country: '',
          businessType: 'Restaurant',
          projectType: 'Website',
          budgetRaw: '$5k - $15k',
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

  async function handleDraftOutreach(leadId) {
    setGenerating((prev) => ({ ...prev, [leadId]: 'outreach' }));
    try {
      const res = await fetch(`/api/leads/${leadId}/personalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enqueue: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Outreach draft submitted to Approval Center!');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to draft outreach');
    } finally {
      setGenerating((prev) => ({ ...prev, [leadId]: null }));
    }
  }

  return (
    <AppLayout title="Leads Directory" subtitle={`${total} total verified prospects across sales stages`}>
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
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
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
            style={{ width: 180 }}
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="">All 14 Stages</option>
            {stagesList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/discovery" className="btn btn-secondary btn-sm">
            🎯 AI Lead Discovery
          </Link>
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
          description="Use the AI Lead Discovery Engine or click '+ Add Lead' to add prospects."
          action={
            <Link href="/discovery" className="btn btn-primary btn-sm">
              🎯 Run AI Discovery
            </Link>
          }
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead / Company</th>
                <th>Contact & Digital Presence</th>
                <th>Industry</th>
                <th>AI Score</th>
                <th>Pipeline Stage</th>
                <th>Actions</th>
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
                          borderRadius: 8,
                          background: lead.leadStatus === 'Hot' ? '#fee2e2' : lead.leadStatus === 'Warm' ? '#fef3c7' : '#eff6ff',
                          color: lead.leadStatus === 'Hot' ? '#dc2626' : lead.leadStatus === 'Warm' ? '#d97706' : '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {(lead.companyName || lead.company || lead.name || 'L').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                          {lead.companyName || lead.company || lead.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          👤 {lead.name} {lead.city ? `· ${lead.city}` : ''}
                        </div>
                      </div>
                    </Link>
                  </td>

                  <td>
                    <div style={{ fontSize: 12 }}>
                      {lead.email && <div style={{ color: '#0f172a' }}>✉️ {lead.email}</div>}
                      {lead.phone && <div style={{ color: '#2563eb' }}>📞 {lead.phone}</div>}
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontSize: 11 }}>
                          🌐 {lead.domain || 'Website'} ↗
                        </a>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '1px 6px', borderRadius: 4 }}>
                          NO WEBSITE
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={{ fontSize: 13, color: '#475569' }}>
                    {lead.industry || lead.businessType || 'General'}
                    {lead.rating && (
                      <div style={{ fontSize: 11, color: '#eab308' }}>
                        ★ {lead.rating} ({lead.reviewCount || 0})
                      </div>
                    )}
                  </td>

                  <td>
                    <LeadScoreBadge score={lead.leadScore || 50} status={lead.leadStatus || 'Warm'} />
                  </td>

                  <td>
                    <select
                      value={lead.pipelineStatus || 'New Lead'}
                      onChange={(e) => updateStatus(lead._id, e.target.value)}
                      className="input"
                      style={{ fontSize: 11.5, padding: '4px 8px', width: 140, fontWeight: 600 }}
                    >
                      {stagesList.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleDraftOutreach(lead._id)}
                        disabled={generating[lead._id] === 'outreach'}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, padding: '4px 8px' }}
                      >
                        {generating[lead._id] === 'outreach' ? 'Drafting...' : '✉️ AI Draft'}
                      </button>

                      <Link
                        href={`/leads/${lead._id}`}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: 11, padding: '4px 8px' }}
                      >
                        Profile
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <Modal title="Add New Lead Manually" onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleCreateLead} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="input-label">Company Name</label>
              <input
                className="input"
                required
                value={newLead.company}
                onChange={(e) => setNewLead({ ...newLead, company: e.target.value, name: newLead.name || e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Contact Person Name</label>
              <input
                className="input"
                required
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Phone Number</label>
              <input
                className="input"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Website URL</label>
              <input
                className="input"
                value={newLead.website}
                onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label className="input-label">Location (City/Country)</label>
              <input
                className="input"
                value={newLead.country}
                onChange={(e) => setNewLead({ ...newLead, country: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Industry</label>
              <input
                className="input"
                value={newLead.businessType}
                onChange={(e) => setNewLead({ ...newLead, businessType: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Initial AI Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="input"
                value={newLead.leadScore}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setNewLead({
                    ...newLead,
                    leadScore: s,
                    leadStatus: s >= 80 ? 'Hot' : s >= 60 ? 'Warm' : 'Cold',
                  });
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Create Lead
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
