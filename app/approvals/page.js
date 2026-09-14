'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner, EmptyState } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'message' | 'proposal' | 'contract' | 'campaign'
  const [statusFilter, setStatusFilter] = useState('approval_required');
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({ all: 0, message: 0, proposal: 0, contract: 0, campaign: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ subject: '', content: '', recipient: '' });

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/approvals?type=${activeTab}&status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items || []);
        setCounts(data.data.counts || {});
      }
    } catch {
      toast.error('Failed to load approval queue');
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  async function handleApprove(id, sendNow = true) {
    setActionLoading((prev) => ({ ...prev, [id]: 'approving' }));
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id, sendNow }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(sendNow ? 'Approved & Dispatched successfully!' : 'Marked as Approved');
        fetchApprovals();
        setSelectedIds((prev) => prev.filter((i) => i !== id));
      } else {
        toast.error(data.message || 'Approval failed');
      }
    } catch {
      toast.error('Network error during approval');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  }

  async function handleReject(id) {
    const reason = window.prompt('Reason for rejecting this AI draft (optional):', 'Not suitable at this time');
    if (reason === null) return; // User cancelled prompt

    setActionLoading((prev) => ({ ...prev, [id]: 'rejecting' }));
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', id, reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Draft rejected');
        fetchApprovals();
        setSelectedIds((prev) => prev.filter((i) => i !== id));
      } else {
        toast.error(data.message || 'Rejection failed');
      }
    } catch {
      toast.error('Network error during rejection');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  }

  async function handleBulkApprove() {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to approve and send ${selectedIds.length} selected items?`)) return;

    setActionLoading((prev) => ({ ...prev, bulk: true }));
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk_approve', ids: selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Approved ${data.data?.approved} items`);
        setSelectedIds([]);
        fetchApprovals();
      } else {
        toast.error(data.message || 'Bulk approval encountered an error');
      }
    } catch {
      toast.error('Bulk approval failed');
    } finally {
      setActionLoading((prev) => ({ ...prev, bulk: false }));
    }
  }

  function openEditModal(item) {
    setEditingItem(item);
    setEditForm({
      subject: item.subject || '',
      content: item.content || '',
      recipient: item.recipient || '',
    });
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const res = await fetch('/api/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingItem._id, ...editForm }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Draft updated successfully');
        setEditingItem(null);
        fetchApprovals();
      } else {
        toast.error(data.message || 'Failed to update item');
      }
    } catch {
      toast.error('Save failed');
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i._id));
    }
  }

  function toggleSelectItem(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  return (
    <AppLayout
      title="Human Approval Center"
      subtitle="Verify, edit, and authorize all AI-generated outreach, proposals, and contracts"
    >
      {/* Top Banner Notice */}
      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 8,
          padding: '12px 18px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a8a' }}>
              Zero Autonomous Commercial Dispatching
            </div>
            <div style={{ fontSize: 12, color: '#3b82f6' }}>
              No marketing emails, custom proposals, or legal contracts are dispatched without your explicit click.
            </div>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>
              {selectedIds.length} items selected
            </span>
            <button
              onClick={handleBulkApprove}
              disabled={actionLoading.bulk}
              className="btn btn-primary btn-sm"
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
            >
              {actionLoading.bulk ? 'Processing...' : `Approve & Send (${selectedIds.length})`}
            </button>
          </div>
        )}
      </div>

      {/* Tabs & Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', label: 'All Drafts', count: counts.all },
            { id: 'message', label: 'Outreach Messages', count: counts.message },
            { id: 'proposal', label: 'Proposals', count: counts.proposal },
            { id: 'contract', label: 'Contracts', count: counts.contract },
            { id: 'campaign', label: 'Bulk Campaigns', count: counts.campaign },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedIds([]);
              }}
              style={{
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: activeTab === tab.id ? '#dbeafe' : '#f1f5f9',
                    color: activeTab === tab.id ? '#1e40af' : '#475569',
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="input"
            style={{ fontSize: 13, padding: '6px 12px', width: 170 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="approval_required">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="sent">Dispatched / Sent</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Statuses</option>
          </select>

          {items.length > 0 && statusFilter === 'approval_required' && (
            <button
              onClick={toggleSelectAll}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12 }}
            >
              {selectedIds.length === items.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size={36} />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Approval Queue Clean"
          description={`No items currently waiting in status "${statusFilter}". New AI-crafted drafts will appear here.`}
          action={
            <Link href="/discovery" className="btn btn-primary btn-sm">
              🎯 Discover New Leads
            </Link>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((item) => {
            const isSelected = selectedIds.includes(item._id);
            const lead = item.leadId;
            const channelColors = {
              email: '#2563eb',
              proposal: '#059669',
              contract: '#7c3aed',
              campaign: '#d97706',
            };

            return (
              <div
                key={item._id}
                className="card"
                style={{
                  padding: 20,
                  border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                  boxShadow: isSelected ? '0 0 0 2px rgba(37,99,235,0.1)' : 'none',
                  background: isSelected ? '#fafcff' : '#ffffff',
                }}
              >
                {/* Header Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {statusFilter === 'approval_required' && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectItem(item._id)}
                        style={{ marginTop: 4, width: 16, height: 16, cursor: 'pointer' }}
                      />
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: `${channelColors[item.type] || '#2563eb'}15`,
                            color: channelColors[item.type] || '#2563eb',
                          }}
                        >
                          {item.type}
                        </span>

                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {item.title}
                        </h3>

                        {lead && (
                          <Link
                            href={`/leads/${lead._id}`}
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: '#2563eb',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <span>🏢 {lead.companyName || lead.company || lead.name}</span>
                            <span style={{ color: '#94a3b8' }}>↗</span>
                          </Link>
                        )}
                      </div>

                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        Recipient: <strong style={{ color: '#334155' }}>{item.recipient || 'N/A'}</strong>
                        {item.subject && (
                          <span> · Subject: <em style={{ color: '#475569' }}>"{item.subject}"</em></span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 12,
                        background:
                          item.status === 'sent'
                            ? '#dcfce7'
                            : item.status === 'approved'
                            ? '#e0e7ff'
                            : item.status === 'rejected'
                            ? '#fee2e2'
                            : '#fef3c7',
                        color:
                          item.status === 'sent'
                            ? '#15803d'
                            : item.status === 'approved'
                            ? '#3730a3'
                            : item.status === 'rejected'
                            ? '#b91c1c'
                            : '#b45309',
                      }}
                    >
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* AI Reasoning Justification Callout */}
                {item.aiReasoning && (
                  <div
                    style={{
                      background: '#f8fafc',
                      borderLeft: '3px solid #6366f1',
                      borderRadius: 4,
                      padding: '8px 12px',
                      marginBottom: 12,
                      fontSize: 12,
                      color: '#475569',
                    }}
                  >
                    <strong style={{ color: '#4338ca' }}>🤖 Why AI Generated This: </strong>
                    {item.aiReasoning}
                  </div>
                )}

                {/* Content Box Preview */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    padding: '12px 14px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: '#1e293b',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 180,
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                  }}
                >
                  {item.content}
                </div>

                {/* Action Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid #f1f5f9',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    Created: {new Date(item.createdAt).toLocaleString()}
                    {item.sentAt && ` · Sent: ${new Date(item.sentAt).toLocaleTimeString()}`}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {item.type === 'proposal' && item.payload?.proposalId && (
                      <Link
                        href={`/proposals/${item.payload.proposalId}`}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 12 }}
                      >
                        👁️ Preview Proposal
                      </Link>
                    )}

                    {item.type === 'contract' && item.payload?.contractId && (
                      <Link
                        href={`/contracts/${item.payload.contractId}`}
                        target="_blank"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 12 }}
                      >
                        👁️ Preview Contract
                      </Link>
                    )}

                    {item.status === 'approval_required' && (
                      <>
                        <button
                          onClick={() => openEditModal(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 12 }}
                        >
                          ✏️ Edit Draft
                        </button>

                        <button
                          onClick={() => handleReject(item._id)}
                          disabled={actionLoading[item._id]}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 12, color: '#ef4444' }}
                        >
                          ✕ Reject
                        </button>

                        <button
                          onClick={() => handleApprove(item._id, true)}
                          disabled={actionLoading[item._id]}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: 12, background: '#16a34a', borderColor: '#16a34a' }}
                        >
                          {actionLoading[item._id] === 'approving' ? 'Dispatching...' : '✓ Approve & Send'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 640,
              width: '100%',
              padding: 24,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                ✏️ Edit AI Outreach Draft
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Recipient Email
                </label>
                <input
                  className="input"
                  value={editForm.recipient}
                  onChange={(e) => setEditForm({ ...editForm, recipient: e.target.value })}
                  required
                />
              </div>

              {editingItem.subject !== undefined && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Subject Line
                  </label>
                  <input
                    className="input"
                    value={editForm.subject}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    required
                  />
                </div>
              )}

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  Message Content
                </label>
                <textarea
                  className="input"
                  rows={9}
                  style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.5 }}
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
