'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner, LeadScoreBadge } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';

export const PIPELINE_STAGES = [
  { id: 'New Lead', color: '#64748b' },
  { id: 'Qualified', color: '#0284c7' },
  { id: 'Contacted', color: '#2563eb' },
  { id: 'Replied', color: '#8b5cf6' },
  { id: 'Interested', color: '#059669' },
  { id: 'Meeting', color: '#0d9488' },
  { id: 'Proposal Sent', color: '#d97706' },
  { id: 'Negotiation', color: '#ea580c' },
  { id: 'Closed Won', color: '#16a34a' },
  { id: 'Contract Sent', color: '#4f46e5' },
  { id: 'Contract Signed', color: '#15803d' },
  { id: 'Payment Pending', color: '#ca8a04' },
  { id: 'Paid', color: '#166534' },
  { id: 'Completed', color: '#0f766e' },
  { id: 'Closed Lost', color: '#dc2626' },
  { id: 'Do Not Contact', color: '#991b1b' },
];

export default function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads?limit=300');
      const data = await res.json();
      if (data.success) {
        setLeads(data.data.leads || []);
      }
    } catch {
      toast.error('Failed to load pipeline leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function updateLeadStage(leadId, newStage) {
    if (!leadId || !newStage) return;
    const targetLead = leads.find((l) => l._id === leadId);
    if (!targetLead || targetLead.pipelineStatus === newStage) return;

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, pipelineStatus: newStage } : l))
    );
    setUpdatingId(leadId);

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus: newStage }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Moved to ${newStage}`);
        if (newStage === 'Interested') {
          toast.success('🤖 AI Proposal Draft automatically queued in Approval Center');
        } else if (newStage === 'Closed Won') {
          toast.success('📝 Contract automatically generated! Check Owner Notification');
        }
      } else {
        toast.error(data.message || 'Stage update failed');
        fetchLeads(); // Revert
      }
    } catch {
      toast.error('Network error updating stage');
      fetchLeads(); // Revert
    } finally {
      setUpdatingId(null);
    }
  }

  // Drag Handlers
  function onDragStart(e, leadId) {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  }

  function onDragOver(e, stageId) {
    e.preventDefault();
    setDragOverStage(stageId);
  }

  function onDragLeave() {
    setDragOverStage(null);
  }

  function onDrop(e, targetStage) {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setDragOverStage(null);
    setDraggedLeadId(null);
    if (leadId) {
      updateLeadStage(leadId, targetStage);
    }
  }

  const filteredLeads = leads.filter((lead) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (lead.companyName || lead.company || '').toLowerCase().includes(term) ||
      (lead.name || '').toLowerCase().includes(term) ||
      (lead.industry || '').toLowerCase().includes(term) ||
      (lead.city || '').toLowerCase().includes(term)
    );
  });

  return (
    <AppLayout
      title="14-Stage Kanban Sales Pipeline"
      subtitle="Drag and drop leads through the complete qualification, proposal, negotiation, contract, and payment lifecycle"
    >
      {/* Top Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            className="input"
            style={{ width: 280, fontSize: 13, padding: '7px 12px' }}
            placeholder="Filter pipeline leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Showing <strong>{filteredLeads.length}</strong> active opportunities
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/discovery" className="btn btn-secondary btn-sm">
            🎯 + Discover Leads
          </Link>
          <Link href="/approvals" className="btn btn-primary btn-sm">
            🛡️ View Approvals
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spinner size={36} />
        </div>
      ) : (
        /* Kanban Board Horizontal Scroll Container */
        <div
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            paddingBottom: 24,
            minHeight: '75vh',
            alignItems: 'flex-start',
          }}
        >
          {PIPELINE_STAGES.map((stage) => {
            const columnLeads = filteredLeads.filter((l) => l.pipelineStatus === stage.id);
            const isOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => onDragOver(e, stage.id)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, stage.id)}
                style={{
                  minWidth: 260,
                  maxWidth: 280,
                  flex: '0 0 260px',
                  background: isOver ? '#f1f5f9' : '#f8fafc',
                  border: isOver ? '2px dashed #2563eb' : '1px solid #e2e8f0',
                  borderRadius: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 180px)',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ffffff',
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: stage.color,
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                      {stage.id}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 10,
                      background: '#f1f5f9',
                      color: '#475569',
                    }}
                  >
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Cards List */}
                <div
                  style={{
                    padding: 10,
                    overflowY: 'auto',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  {columnLeads.length === 0 ? (
                    <div
                      style={{
                        padding: '24px 10px',
                        textAlign: 'center',
                        fontSize: 12,
                        color: '#94a3b8',
                      }}
                    >
                      Drop leads here
                    </div>
                  ) : (
                    columnLeads.map((lead) => (
                      <div
                        key={lead._id}
                        draggable
                        onDragStart={(e) => onDragStart(e, lead._id)}
                        className="card"
                        style={{
                          padding: 12,
                          background: '#ffffff',
                          cursor: 'grab',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          border: updatingId === lead._id ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          opacity: draggedLeadId === lead._id ? 0.4 : 1,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <Link
                            href={`/leads/${lead._id}`}
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: '#0f172a',
                              textDecoration: 'none',
                              lineHeight: 1.3,
                            }}
                          >
                            {lead.companyName || lead.company || lead.name}
                          </Link>

                          <LeadScoreBadge score={lead.leadScore} status={lead.leadStatus} />
                        </div>

                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                          {lead.name} {lead.city ? `· ${lead.city}` : ''}
                        </div>

                        {/* Why valuable snippet */}
                        {lead.whyValuable && (
                          <div
                            style={{
                              fontSize: 11,
                              color: '#475569',
                              lineHeight: 1.3,
                              background: '#f8fafc',
                              padding: '4px 6px',
                              borderRadius: 4,
                              marginBottom: 8,
                            }}
                          >
                            {lead.whyValuable.slice(0, 85)}...
                          </div>
                        )}

                        {/* Bottom Actions */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: 8,
                            fontSize: 11,
                          }}
                        >
                          <span style={{ color: '#94a3b8' }}>
                            {lead.website ? '🌐 Web' : '🚫 No Web'}
                          </span>

                          <Link
                            href={`/leads/${lead._id}`}
                            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                          >
                            Profile →
                          </Link>
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
