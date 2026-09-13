'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import { generatePDF } from '@/lib/utils';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [isPaying, setIsPaying] = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setPaymentAmount(result.data?.invoice?.balanceDue || result.data?.invoice?.total || 0);
      }
    } catch {
      toast.error('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id, fetchInvoice]);

  const invoice = data?.invoice;
  const payments = data?.payments || [];

  async function handleRecordPayment(e) {
    e.preventDefault();
    setIsPaying(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordPayment: true,
          amount: Number(paymentAmount),
          paymentMethod,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success(`Payment of $${Number(paymentAmount).toLocaleString()} recorded!`);
        fetchInvoice();
      } else {
        toast.error(resData.message);
      }
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setIsPaying(false);
    }
  }

  if (loading) {
    return (
      <AppLayout title="Invoice Viewer">
        <div style={{ padding: 80, textAlign: 'center' }}>
          <Spinner size={36} />
        </div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout title="Invoice Not Found">
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h3>Invoice not found</h3>
          <Link href="/invoices" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
            Back to Invoices
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`Invoice ${invoice.invoiceNumber}`} subtitle={`Billed to ${invoice.clientName}`}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/invoices" className="btn btn-secondary btn-sm">
            ← Invoices
          </Link>
          <span
            className={`badge ${
              invoice.status === 'Paid'
                ? 'badge-success'
                : invoice.status === 'Overdue'
                ? 'badge-hot'
                : 'badge-primary'
            }`}
          >
            {invoice.status}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => generatePDF('invoice-document', `${invoice.invoiceNumber}.pdf`)}
            className="btn btn-primary btn-sm"
          >
            📥 Download PDF
          </button>
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
            🖨️ Print
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Printable Document Paper */}
        <div id="invoice-document" className="document-paper">
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0052ff', paddingBottom: 24, marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0052ff', margin: 0 }}>LeadAI Pro Agency</h1>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Enterprise Software Development & AI Solutions</p>
              <p style={{ fontSize: 12, color: '#64748b' }}>100 Innovation Way, Suite 500, San Francisco, CA</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>INVOICE</h2>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0052ff', marginTop: 4 }}>{invoice.invoiceNumber}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Date: {new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString()}
              </div>
              <div style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Billed To:</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{invoice.clientName}</div>
              {invoice.clientCompany && <div style={{ fontSize: 13, color: '#475569' }}>{invoice.clientCompany}</div>}
              <div style={{ fontSize: 13, color: '#475569' }}>{invoice.clientEmail}</div>
              {invoice.clientCountry && <div style={{ fontSize: 12, color: '#64748b' }}>{invoice.clientCountry}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Payment Terms:</div>
              <div style={{ fontSize: 13, color: '#0f172a', marginTop: 4 }}>{invoice.paymentTerms || 'Due on receipt'}</div>
              <div style={{ fontSize: 13, color: '#10b981', fontWeight: 700, marginTop: 4 }}>
                Balance Due: ${(invoice.balanceDue || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '12px 14px', fontSize: 12, color: '#475569' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '12px 14px', fontSize: 12, color: '#475569' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '12px 14px', fontSize: 12, color: '#475569' }}>Rate</th>
                <th style={{ textAlign: 'right', padding: '12px 14px', fontSize: 12, color: '#475569' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px', fontSize: 13, color: '#1e293b' }}>{item.description}</td>
                  <td style={{ padding: '14px', textAlign: 'center', fontSize: 13, color: '#475569' }}>{item.quantity}</td>
                  <td style={{ padding: '14px', textAlign: 'right', fontSize: 13, color: '#475569' }}>
                    ${(item.rate || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    ${(item.amount || item.quantity * item.rate || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Breakdown */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
            <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Subtotal:</span>
                <span>${(invoice.subtotal || invoice.total || 0).toLocaleString()}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                  <span>Discount ({invoice.discountPercent}%):</span>
                  <span>-${invoice.discountAmount.toLocaleString()}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Tax ({invoice.taxPercent}%):</span>
                  <span>+${invoice.taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '2px solid #0f172a',
                  paddingTop: 8,
                  fontSize: 16,
                  fontWeight: 900,
                  color: '#0f172a',
                }}
              >
                <span>Total Due:</span>
                <span>${(invoice.total || 0).toLocaleString()} USD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700, marginTop: 4 }}>
                <span>Amount Paid:</span>
                <span>${(invoice.amountPaid || 0).toLocaleString()} USD</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b' }}>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>Payment Instructions:</div>
            <p style={{ margin: 0 }}>{invoice.paymentInstructions || 'Please transfer payment to LeadAI Pro Accounts via wire or online card portal.'}</p>
          </div>
        </div>

        {/* Right Panel: Payment Recorder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>💳 Record Payment</h3>
            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="input-label">Payment Amount ($)</label>
                <input
                  className="input"
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={invoice.balanceDue || invoice.total}
                />
              </div>

              <div className="form-group">
                <label className="input-label">Payment Method</label>
                <select className="input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="Stripe">Stripe / Credit Card</option>
                  <option value="Bank Wire">Bank Wire Transfer</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPaying || invoice.status === 'Paid'}
                className="btn btn-success btn-sm"
                style={{ marginTop: 8 }}
              >
                {isPaying ? <Spinner size={16} /> : '✓ Record Received Payment'}
              </button>
            </form>
          </div>

          {/* Payment History */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Transaction Receipts</h3>
            {payments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No payment transactions recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {payments.map((p) => (
                  <div
                    key={p._id}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#10b981' }}>
                      <span>+${p.amount.toLocaleString()}</span>
                      <span>{p.paymentMethod}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
                      {new Date(p.paidAt || p.createdAt).toLocaleString()} · {p.transactionId}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
