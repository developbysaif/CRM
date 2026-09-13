'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/index';
import { generatePDF, formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';

export default function ContractDetailPage() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  const fetchContract = useCallback(async () => {
    try {
      const res = await fetch(`/api/contracts/${id}`);
      const d = await res.json();
      if (d.success) {
        setContract(d.data);
        setSignatureName(d.data.clientName || '');
      }
    } catch {
      toast.error('Failed to load contract');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchContract();
  }, [id, fetchContract]);

  async function handleDownload() {
    setDownloading(true);
    await generatePDF('contract-document', `contract-${contract.contractNumber}.pdf`);
    setDownloading(false);
    toast.success('Contract PDF downloaded!');
  }

  async function handleDigitalSign(e) {
    e.preventDefault();
    if (!signatureName.trim()) return;
    setIsSigning(true);
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signContract: true,
          signature: signatureName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Contract signed digitally and recorded!');
        fetchContract();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to sign contract');
    } finally {
      setIsSigning(false);
    }
  }

  if (loading) {
    return (
      <AppLayout title="Contract Viewer">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spinner size={40} />
        </div>
      </AppLayout>
    );
  }

  if (!contract) {
    return (
      <AppLayout title="Not Found">
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h3>Contract not found</h3>
          <Link href="/contracts" className="btn btn-secondary btn-sm" style={{ marginTop: 12 }}>
            Return to Contracts
          </Link>
        </div>
      </AppLayout>
    );
  }

  const c = contract;

  return (
    <AppLayout title={`Contract ${c.contractNumber}`} subtitle={`${c.clientName} · ${c.projectName}`}>
      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/contracts" className="btn btn-secondary btn-sm">
            ← Contracts
          </Link>
          <span
            className={`badge ${
              c.status === 'Signed' ? 'badge-success' : 'badge-primary'
            }`}
          >
            {c.status === 'Signed' ? '✓ Fully Executed & Signed' : c.status}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleDownload} disabled={downloading} className="btn btn-primary btn-sm">
            {downloading ? <Spinner size={16} /> : '⬇️'} Download Legal PDF
          </button>
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
            🖨️ Print
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Contract Document Sheet */}
        <div id="contract-document" className="document-paper">
          {/* Header */}
          <div className="document-header">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#0052ff', fontFamily: 'var(--font-display)' }}>LeadAI Pro Agency</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Enterprise Software Development & AI Solutions</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b' }}>MASTER SERVICES AGREEMENT</div>
                <div style={{ fontSize: 13, color: '#0052ff', fontWeight: 700 }}>{c.contractNumber}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Date: {formatDate(c.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #0052ff', paddingBottom: 8, marginBottom: 14 }}>
              1. PARTIES
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, padding: 16, background: '#f8fafc', borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  Client (Party A)
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{c.clientName}</div>
                {c.clientCompany && <div style={{ fontSize: 12, color: '#64748b' }}>{c.clientCompany}</div>}
                <div style={{ fontSize: 12, color: '#64748b' }}>{c.clientEmail}</div>
                {c.clientPhone && <div style={{ fontSize: 12, color: '#64748b' }}>{c.clientPhone}</div>}
                {c.clientAddress && <div style={{ fontSize: 12, color: '#64748b' }}>{c.clientAddress}</div>}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                  Service Provider (Party B)
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{c.companyName || 'LeadAI Pro Agency'}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>100 Innovation Way, Suite 500, San Francisco, CA</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>legal@leadaipro.com</div>
              </div>
            </div>
          </section>

          {/* Project Details */}
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #0052ff', paddingBottom: 8, marginBottom: 14 }}>
              2. SCOPE OF SERVICES & VALUE
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Project Name', c.projectName],
                    ['Start Date', formatDate(c.startDate)],
                    ['Target Delivery', formatDate(c.endDate)],
                    ['Total Agreed Investment', formatCurrency(c.totalAmount, c.currency)],
                  ].map(([l, v]) => (
                    <tr key={l}>
                      <td style={{ padding: '8px 12px', background: '#f8fafc', fontSize: 12, fontWeight: 600, color: '#374151', width: '35%', border: '1px solid #e2e8f0' }}>
                        {l}
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: 13, color: '#1e293b', border: '1px solid #e2e8f0', fontWeight: l.includes('Investment') ? 700 : 400 }}>
                        {v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {c.projectDescription && (
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 12, lineHeight: 1.7 }}>
                {c.projectDescription}
              </p>
            )}
          </section>

          {/* Payment Milestones */}
          {c.paymentSchedule?.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #0052ff', paddingBottom: 8, marginBottom: 14 }}>
                3. PAYMENT MILESTONES
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0052ff' }}>
                    {['Milestone', 'Amount', 'Status'].map((h) => (
                      <th key={h} style={{ padding: '10px 14px', color: 'white', fontSize: 12, fontWeight: 700, textAlign: 'left' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.paymentSchedule.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{p.milestone}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                        {formatCurrency(p.amount, c.currency)}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 20,
                            background: p.status === 'Paid' ? '#dcfce7' : '#fef3c7',
                            color: p.status === 'Paid' ? '#16a34a' : '#92400e',
                            fontWeight: 600,
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* Legal Terms */}
          {[
            ['4. INTELLECTUAL PROPERTY & OWNERSHIP', c.ownershipClause],
            ['5. CONFIDENTIALITY & NON-DISCLOSURE', c.confidentialityClause],
            ['6. WARRANTY, SUPPORT & MAINTENANCE', c.supportClause || c.maintenanceClause],
            ['7. TERMINATION CONDITIONS', c.terminationClause],
            ['8. GOVERNING LAW', c.governingLaw],
          ]
            .filter(([, v]) => v)
            .map(([title, text]) => (
              <section key={title} style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #0052ff', paddingBottom: 8, marginBottom: 12 }}>
                  {title}
                </h2>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.8 }}>{text}</p>
              </section>
            ))}

          {/* Signatures */}
          <section style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #0052ff', paddingBottom: 8, marginBottom: 20 }}>
              SIGNATURES
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
              {/* Client Signature */}
              <div>
                <div
                  style={{
                    borderBottom: '2px solid #1e293b',
                    minHeight: 48,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: 'cursive',
                    fontSize: 20,
                    color: '#0052ff',
                    marginBottom: 10,
                  }}
                >
                  {c.clientSignature ? `✍️ ${c.clientSignature}` : '[Pending Client Signature]'}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Authorized Client</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Name: {c.clientName}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>
                  Date: {c.clientSignedAt ? formatDate(c.clientSignedAt) : 'Pending'}
                </div>
              </div>

              {/* Provider Signature */}
              <div>
                <div
                  style={{
                    borderBottom: '2px solid #1e293b',
                    minHeight: 48,
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: 'cursive',
                    fontSize: 20,
                    color: '#10b981',
                    marginBottom: 10,
                  }}
                >
                  ✍️ LeadAI Pro Legal Office
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Service Provider</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Name: LeadAI Pro Executive</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Date: {formatDate(c.createdAt)}</div>
              </div>
            </div>
          </section>

          <div style={{ borderTop: '2px solid #0052ff', paddingTop: 16, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Generated by LeadAI Pro · {formatDate(c.createdAt)}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0052ff' }}>Legally Binding Instrument</div>
          </div>
        </div>

        {/* Right Digital Signature Pad */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>✍️ Digital Signature Pad</h3>
            {c.status === 'Signed' ? (
              <div style={{ padding: 16, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>✓ Contract Signed Online</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Signed by: <strong>{c.clientSignature}</strong> on {formatDate(c.signedAt || c.clientSignedAt)}
                </div>
              </div>
            ) : (
              <form onSubmit={handleDigitalSign} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Sign below to execute this contract. An immutable audit log will be generated upon signing.
                </p>
                <div className="form-group">
                  <label className="input-label">Type Full Legal Name</label>
                  <input
                    className="input"
                    required
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="e.g. Johnathan Doe"
                  />
                </div>

                <div
                  style={{
                    padding: '20px',
                    background: 'var(--bg-elevated)',
                    border: '1px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    fontFamily: 'cursive',
                    fontSize: 22,
                    color: 'var(--primary)',
                  }}
                >
                  {signatureName || 'Signature Preview'}
                </div>

                <button
                  type="submit"
                  disabled={isSigning || !signatureName.trim()}
                  className="btn btn-primary"
                >
                  {isSigning ? <Spinner size={16} /> : '✍️ Execute & Sign Contract'}
                </button>
              </form>
            )}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Next Sales Step</h4>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
              Once signed, bill the project kickoff deposit via the invoice billing portal.
            </p>
            <Link href="/invoices" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
              Go to Invoicing Portal →
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
