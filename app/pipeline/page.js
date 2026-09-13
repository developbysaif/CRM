'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner, PipelineBadge } from '@/components/ui/index';
import Link from 'next/link';

const STAGES = [
  'New Lead',
  'Qualified',
  'Proposal Sent',
  'Meeting Scheduled',
  'Negotiation',
  'Contract Signed',
  'Invoice Sent',
  'Payment Received',
  'Completed',
];

const STAGE_HEADER_COLORS = {
  'New Lead': '#6366f1',
  Qualified: '#06b6d4',
  'Proposal Sent': '#f59e0b',
  'Meeting Scheduled': '#8b5cf6',
  Negotiation: '#f97316',
  'Contract Signed': '#10b981',
  'Invoice Sent': '#3b82f6',
  'Payment Received': '#059669',
  Completed: '#047857',
};

export default function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    try {
      const res = await fetch('/api/leads?limit=200');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.data?.leads || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStage(leadId, newStage) {
    setUpdatingId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus: newStage }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, pipelineStatus: newStage } : l))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      (lead.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (lead.company || '').toLowerCase().includes(search.toLowerCase()) ||
      (lead.projectType || '').toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || lead.businessType === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const industries = ['all', ...new Set(leads.map((l) => l.businessType).filter(Boolean))];

  return (
    <AppLayout title="Sales Pipeline" subtitle="Visual 9-stage Kanban deal tracking">
      {/* Filters & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ width: 220, padding: '8px 14px' }}
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="input"
            style={{ width: 180, padding: '8px 14px' }}
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind === 'all' ? 'All Industries' : ind}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/leads" className="btn btn-secondary btn-sm">
            📄 Table View
          </Link>
          <Link href="/chat" className="btn btn-primary btn-sm">
            🤖 Qualify New Lead
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner size={36} />
        </div>
      ) : (
        <div className="kanban-board">
          {STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => (l.pipelineStatus || 'New Lead') === stage);
            const totalValue = stageLeads.reduce((acc, curr) => acc + (curr.budget?.max || curr.budget?.min || 10000), 0);
            const stageColor = STAGE_HEADER_COLORS[stage] || '#0052ff';

            return (
              <div key={stage} className="kanban-column" style={{ minWidth: 280, maxWidth: 280 }}>
                {/* Column Header */}
                <div
                  className="kanban-header"
                  style={{
                    borderTop: `3px solid ${stageColor}`,
                    background: 'var(--bg-card)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{stage}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      ${(totalValue / 1000).toFixed(0)}k est. value
                    </div>
                  </div>
                  <span
                    style={{
                      background: `${stageColor}20`,
                      color: stageColor,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {stageLeads.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="kanban-body">
                  {stageLeads.length === 0 ? (
                    <div
                      style={{
                        padding: '30px 16px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: 12,
                        border: '1px dashed var(--border)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      No deals in {stage}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div key={lead._id} className="kanban-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <Link
                            href={`/leads/${lead._id}`}
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: 'var(--text-primary)',
                              textDecoration: 'none',
                            }}
                          >
                            {lead.name}
                          </Link>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: lead.leadScore >= 75 ? '#ef4444' : lead.leadScore >= 45 ? '#f59e0b' : '#3b82f6',
                            }}
                          >
                            {lead.leadScore} pts
                          </span>
                        </div>

                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                          {lead.company ? `${lead.company} · ` : ''}
                          {lead.projectType || 'Software'}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981' }}>
                            {lead.budget?.raw || '$15,000'}
                          </span>
                          <span className="badge badge-primary" style={{ fontSize: 9 }}>
                            {lead.businessType}
                          </span>
                        </div>

                        {/* Stage Mover Selector */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                          <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                            Move stage:
                          </label>
                          <select
                            disabled={updatingId === lead._id}
                            value={lead.pipelineStatus || 'New Lead'}
                            onChange={(e) => updateLeadStage(lead._id, e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px 6px',
                              fontSize: 11,
                              background: 'var(--bg-input)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-primary)',
                              outline: 'none',
                            }}
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
