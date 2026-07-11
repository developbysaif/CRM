'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/index';
import { generatePDF, formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

export default function ContractDetailPage() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) fetch(`/api/contracts/${id}`).then(r => r.json()).then(d => { if (d.success) setContract(d.data); setLoading(false); });
  }, [id]);

  async function handleDownload() {
    setDownloading(true);
    await generatePDF('contract-document', `contract-${contract.contractNumber}.pdf`);
    setDownloading(false);
    toast.success('PDF downloaded!');
  }

  if (loading) return <AppLayout title="Contract"><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div></AppLayout>;
  if (!contract) return <AppLayout title="Not Found"><p style={{ padding: 40 }}>Contract not found</p></AppLayout>;

  const c = contract;
  return (
    <AppLayout title={`Contract ${c.contractNumber}`} subtitle={`${c.clientName} · ${c.projectName}`}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'flex-end' }}>
        <button onClick={handleDownload} disabled={downloading} className="btn btn-primary">
          {downloading ? <Spinner size={16} /> : '⬇️'} Download PDF
        </button>
      </div>

      <div id="contract-document" className="document-paper">
        {/* Header */}
        <div className="document-header">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#6366f1' }}>LeadAI Pro</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Software Development Agency</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>SERVICE AGREEMENT</div>
              <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 700 }}>{c.contractNumber}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Date: {formatDate(c.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Parties */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>1. PARTIES</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: 16, background: '#f8fafc', borderRadius: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Client (Party A)</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{c.clientName}</div>
              {c.clientCompany && <div style={{ fontSize: 12, color: '#64748b' }}>{c.clientCompany}</div>}
              <div style={{ fontSize: 12, color: '#64748b' }}>{c.clientEmail}</div>
              {c.clientPhone && <div style={{ fontSize: 12, color: '#64748b' }}>{c.clientPhone}</div>}
              {c.clientAddress && <div style={{ fontSize: 12, color: '#64748b' }}>{c.clientAddress}</div>}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Service Provider (Party B)</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{c.companyName || 'LeadAI Pro Agency'}</div>
              {c.companyEmail && <div style={{ fontSize: 12, color: '#64748b' }}>{c.companyEmail}</div>}
              {c.companyAddress && <div style={{ fontSize: 12, color: '#64748b' }}>{c.companyAddress}</div>}
            </div>
          </div>
        </section>

        {/* Project Details */}
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>2. PROJECT DETAILS</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[['Project Name', c.projectName], ['Start Date', formatDate(c.startDate)], ['End Date', formatDate(c.endDate)], ['Total Contract Value', formatCurrency(c.totalAmount, c.currency)]].map(([l, v]) => (
                  <tr key={l}>
                    <td style={{ padding: '8px 12px', background: '#f8fafc', fontSize: 12, fontWeight: 600, color: '#374151', width: '30%', border: '1px solid #e2e8f0' }}>{l}</td>
                    <td style={{ padding: '8px 12px', fontSize: 13, color: '#1e293b', border: '1px solid #e2e8f0', fontWeight: l === 'Total Contract Value' ? 700 : 400 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {c.projectDescription && <p style={{ fontSize: 13, color: '#64748b', marginTop: 12, lineHeight: 1.7 }}>{c.projectDescription}</p>}
        </section>

        {/* Payment Schedule */}
        {c.paymentSchedule?.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>3. PAYMENT SCHEDULE</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#6366f1' }}>
                  {['Milestone', 'Amount', 'Status'].map(h => <th key={h} style={{ padding: '10px 14px', color: 'white', fontSize: 12, fontWeight: 700, textAlign: 'left' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {c.paymentSchedule.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{p.milestone}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{formatCurrency(p.amount, c.currency)}</td>
                    <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: p.status === 'Paid' ? '#dcfce7' : '#fef3c7', color: p.status === 'Paid' ? '#16a34a' : '#92400e', fontWeight: 600 }}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Legal Clauses */}
        {[
          ['4. INTELLECTUAL PROPERTY', c.ownershipClause],
          ['5. CONFIDENTIALITY', c.confidentialityClause],
          ['6. SUPPORT & MAINTENANCE', c.supportClause || c.maintenanceClause],
          ['7. TERMINATION', c.terminationClause],
          ['8. GOVERNING LAW', c.governingLaw],
        ].filter(([, v]) => v).map(([title, text]) => (
          <section key={title} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 12 }}>{title}</h2>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.8 }}>{text}</p>
          </section>
        ))}

        {/* Signatures */}
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 20 }}>SIGNATURES</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            {['Client', 'Service Provider'].map(party => (
              <div key={party}>
                <div style={{ borderBottom: '2px solid #1e293b', paddingBottom: 40, marginBottom: 10 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{party}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Name: {party === 'Client' ? c.clientName : 'LeadAI Pro Agency'}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Date: _______________</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ borderTop: '2px solid #6366f1', paddingTop: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Generated by LeadAI Pro · {formatDate(c.createdAt)}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>Confidential Document</div>
        </div>
      </div>
    </AppLayout>
  );
}
