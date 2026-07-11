'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner, EmptyState } from '@/components/ui/index';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/quotations').then(r => r.json()).then(d => { if (d.success) setQuotations(d.data); setLoading(false); });
  }, []);

  return (
    <AppLayout title="Quotations" subtitle="Professional project quotations">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{quotations.length} quotations</span>
        <Link href="/leads" className="btn btn-primary btn-sm">+ Generate from Lead</Link>
      </div>
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
        : quotations.length === 0 ? <EmptyState icon="💰" title="No quotations yet" description="Generate quotations from your leads" />
        : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Quotation #</th><th>Client</th><th>Items</th><th>Total</th><th>Status</th><th>Valid Until</th><th>Actions</th></tr></thead>
              <tbody>
                {quotations.map(q => (
                  <tr key={q._id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-light)' }}>{q.quotationNumber}</span></td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{q.clientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.clientEmail}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{q.items?.length || 0} items</td>
                    <td style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>{formatCurrency(q.total, q.currency)}</td>
                    <td><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: q.status === 'Accepted' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', color: q.status === 'Accepted' ? '#10b981' : 'var(--primary-light)' }}>{q.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(q.validUntil)}</td>
                    <td><Link href={`/quotations/${q._id}`} className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>View & PDF</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </AppLayout>
  );
}
