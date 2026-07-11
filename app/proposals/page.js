'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner, EmptyState } from '@/components/ui/index';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/proposals').then(r => r.json()).then(d => {
      if (d.success) setProposals(d.data);
      setLoading(false);
    });
  }, []);

  const statusColors = { Draft: '#64748b', Sent: '#6366f1', Viewed: '#06b6d4', Accepted: '#10b981', Rejected: '#ef4444', Revised: '#f59e0b' };

  return (
    <AppLayout title="Proposals" subtitle="AI-generated project proposals">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{proposals.length} proposals total</div>
        <Link href="/leads" className="btn btn-primary btn-sm">+ Generate from Lead</Link>
      </div>

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
        : proposals.length === 0 ? <EmptyState icon="📄" title="No proposals yet" description="Generate a proposal from a lead to get started" action={<Link href="/leads" className="btn btn-primary btn-sm">Go to Leads →</Link>} />
        : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Proposal #</th><th>Client</th><th>Project</th><th>Value</th><th>Status</th><th>Valid Until</th><th>Actions</th></tr></thead>
              <tbody>
                {proposals.map(p => (
                  <tr key={p._id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-light)' }}>{p.proposalNumber}</span></td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.clientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.clientEmail}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.leadId?.businessType || '-'}</td>
                    <td style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>{formatCurrency(p.pricing?.total)}</td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: `${statusColors[p.status]}20`, color: statusColors[p.status], border: `1px solid ${statusColors[p.status]}40` }}>{p.status}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(p.validUntil)}</td>
                    <td>
                      <Link href={`/proposals/${p._id}`} className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>View & PDF</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </AppLayout>
  );
}
