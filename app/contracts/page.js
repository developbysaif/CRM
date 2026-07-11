'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner, EmptyState } from '@/components/ui/index';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contracts').then(r => r.json()).then(d => { if (d.success) setContracts(d.data); setLoading(false); });
  }, []);

  const statusColors = { Draft: '#64748b', Sent: '#6366f1', 'Under Review': '#f59e0b', Signed: '#10b981', Rejected: '#ef4444', Terminated: '#ef4444' };

  return (
    <AppLayout title="Contracts" subtitle="Legal service agreements">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{contracts.length} contracts</span>
        <Link href="/leads" className="btn btn-primary btn-sm">+ Generate from Lead</Link>
      </div>
      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
        : contracts.length === 0 ? <EmptyState icon="📝" title="No contracts yet" description="Generate contracts from your leads" />
        : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Contract #</th><th>Client</th><th>Project</th><th>Total Value</th><th>Status</th><th>Start Date</th><th>Actions</th></tr></thead>
              <tbody>
                {contracts.map(c => (
                  <tr key={c._id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-light)' }}>{c.contractNumber}</span></td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.clientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.clientCompany}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200 }} className="truncate">{c.projectName}</td>
                    <td style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>{formatCurrency(c.totalAmount, c.currency)}</td>
                    <td><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: `${statusColors[c.status]}20`, color: statusColors[c.status] }}>{c.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(c.startDate)}</td>
                    <td><Link href={`/contracts/${c._id}`} className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>View & Sign</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </AppLayout>
  );
}
