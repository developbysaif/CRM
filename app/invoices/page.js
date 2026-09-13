'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { StatCard, Spinner, EmptyState } from '@/components/ui/index';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { toast } from '@/components/ui/Toaster';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Invoice form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [items, setItems] = useState([
    { description: 'Full-Stack Software Development', quantity: 1, rate: 5000 },
  ]);
  const [taxPercent, setTaxPercent] = useState(10);
  const [discountPercent, setDiscountPercent] = useState(0);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.data.invoices || []);
        setStats(data.data.stats || {});
      }
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  function addItem() {
    setItems((prev) => [...prev, { description: '', quantity: 1, rate: 1000 }]);
  }

  function updateItem(index, field, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function removeItem(index) {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  }

  async function handleCreateInvoice(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientCompany,
          items,
          taxPercent,
          discountPercent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Invoice created successfully!');
        setIsCreateOpen(false);
        setClientName('');
        setClientEmail('');
        setClientCompany('');
        fetchInvoices();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Error creating invoice');
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="badge badge-success">✓ Paid</span>;
      case 'Sent':
        return <span className="badge badge-primary">📨 Sent</span>;
      case 'Partially Paid':
        return <span className="badge badge-warning">⚡ Partial</span>;
      case 'Overdue':
        return <span className="badge badge-hot">⚠️ Overdue</span>;
      default:
        return <span className="badge badge-cold">{status}</span>;
    }
  };

  return (
    <AppLayout title="Invoices & Billing" subtitle="Manage accounts receivable, client invoicing & payment reconciliation">
      {/* Financial KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18, marginBottom: 24 }}>
        <StatCard
          icon="🧾"
          label="Total Invoiced"
          value={`$${((stats.totalBilled || 0) / 1000).toFixed(1)}k`}
          sub={`${stats.count || 0} total invoices`}
          gradient="linear-gradient(135deg,#0052ff,#7c3aed)"
        />
        <StatCard
          icon="💰"
          label="Paid Revenue"
          value={`$${((stats.totalPaid || 0) / 1000).toFixed(1)}k`}
          sub="Reconciled payments"
          gradient="linear-gradient(135deg,#10b981,#06b6d4)"
        />
        <StatCard
          icon="⏳"
          label="Outstanding Balance"
          value={`$${((stats.totalPending || 0) / 1000).toFixed(1)}k`}
          sub="Pending client payments"
          gradient="linear-gradient(135deg,#f59e0b,#ef4444)"
        />
      </div>

      {/* Action and Filter Bar */}
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
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="input"
            style={{ width: 220 }}
            placeholder="Search by invoice #, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary btn-sm">
          + Create New Invoice
        </button>
      </div>

      {/* Invoices List */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <Spinner size={36} />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="No invoices found"
          description="Create your first client invoice or bill automatically from qualified leads."
          action={
            <button onClick={() => setIsCreateOpen(true)} className="btn btn-primary btn-sm">
              + Create Invoice
            </button>
          }
        />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client / Company</th>
                <th>Total Amount</th>
                <th>Amount Paid</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>
                    <Link
                      href={`/invoices/${inv._id}`}
                      style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
                    >
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>{inv.clientName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inv.clientCompany || inv.clientEmail}</div>
                  </td>
                  <td style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${(inv.total || 0).toLocaleString()}
                  </td>
                  <td style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                    ${(inv.amountPaid || 0).toLocaleString()}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td>{getStatusBadge(inv.status)}</td>
                  <td>
                    <Link href={`/invoices/${inv._id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
                      View & Pay →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Invoice Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Client Invoice">
        <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="input-label">Client Name *</label>
              <input
                className="input"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Jane Smith"
              />
            </div>
            <div className="form-group">
              <label className="input-label">Client Email *</label>
              <input
                className="input"
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="jane@company.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Company Name</label>
            <input
              className="input"
              value={clientCompany}
              onChange={(e) => setClientCompany(e.target.value)}
              placeholder="Acme Corp"
            />
          </div>

          {/* Line Items */}
          <div>
            <label className="input-label" style={{ marginBottom: 8 }}>
              Line Items
            </label>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <input
                  className="input"
                  placeholder="Item description"
                  value={item.description}
                  required
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="Rate ($)"
                  value={item.rate}
                  onChange={(e) => updateItem(idx, 'rate', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: '#ef4444' }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="btn btn-secondary btn-sm" style={{ marginTop: 4 }}>
              + Add Item
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="input-label">Tax Rate (%)</label>
              <input
                className="input"
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="input-label">Discount (%)</label>
              <input
                className="input"
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Generate & Dispatch Invoice
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
