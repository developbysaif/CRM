'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/index';
import { generatePDF, formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

export default function ProposalDetailPage() {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/proposals/${id}`).then(r => r.json()).then(d => {
        if (d.success) setProposal(d.data);
        setLoading(false);
      });
    }
  }, [id]);

  async function handleDownload() {
    setDownloading(true);
    await generatePDF('proposal-document', `proposal-${proposal.proposalNumber}.pdf`);
    setDownloading(false);
    toast.success('PDF downloaded!');
  }

  if (loading) return <AppLayout title="Proposal"><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div></AppLayout>;
  if (!proposal) return <AppLayout title="Proposal Not Found"><p style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Proposal not found</p></AppLayout>;

  const p = proposal;

  return (
    <AppLayout title={`Proposal ${p.proposalNumber}`} subtitle={`For ${p.clientName} · ${p.clientCompany || ''}`}>
      {/* Action Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'flex-end' }}>
        <button onClick={handleDownload} disabled={downloading} className="btn btn-primary">
          {downloading ? <Spinner size={16} /> : '⬇️'} Download PDF
        </button>
      </div>

      {/* Printable Document */}
      <div id="proposal-document" className="document-paper">
        {/* Header */}
        <div className="document-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#6366f1', fontFamily: 'var(--font-display)' }}>LeadAI Pro</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>AI-Powered Software Agency</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>PROJECT PROPOSAL</div>
              <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 700, marginTop: 4 }}>{p.proposalNumber}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Valid Until: {formatDate(p.validUntil)}</div>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 8 }}>Prepared For</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{p.clientName}</div>
            {p.clientCompany && <div style={{ fontSize: 13, color: '#64748b' }}>{p.clientCompany}</div>}
            <div style={{ fontSize: 13, color: '#64748b' }}>{p.clientEmail}</div>
            {p.clientCountry && <div style={{ fontSize: 13, color: '#64748b' }}>🌍 {p.clientCountry}</div>}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#94a3b8', marginBottom: 8 }}>Prepared By</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>LeadAI Pro Agency</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Date: {formatDate(p.createdAt)}</div>
          </div>
        </div>

        {/* Executive Summary */}
        {p.executiveSummary && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>Executive Summary</h2>
            <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.8 }}>{p.executiveSummary}</p>
          </section>
        )}

        {/* Business Goals */}
        {p.businessGoals && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>Business Goals</h2>
            <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.8 }}>{p.businessGoals}</p>
          </section>
        )}

        {/* Project Scope */}
        {p.projectScope && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>Project Scope</h2>
            <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.8 }}>{p.projectScope}</p>
          </section>
        )}

        {/* Features */}
        {p.features?.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>Features & Functionality</h2>
            <div style={{ columns: 2, gap: 12 }}>
              {p.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, breakInside: 'avoid' }}>
                  <span style={{ color: '#6366f1', fontWeight: 700, fontSize: 14 }}>✓</span>
                  <span style={{ fontSize: 13, color: '#374151' }}>{f}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technology Stack */}
        {p.technologyStack?.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>Technology Stack</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {p.technologyStack.map((t, i) => (
                <span key={i} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#6366f1' }}>{t}</span>
              ))}
            </div>
          </section>
        )}

        {/* Timeline & Milestones */}
        {p.milestones?.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>Timeline & Milestones</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {p.milestones.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: 16, background: '#f8fafc', borderRadius: 10, borderLeft: '3px solid #6366f1' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{m.title} <span style={{ color: '#6366f1', fontSize: 12 }}>({m.duration})</span></div>
                    <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{m.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pricing */}
        {p.pricing && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>Investment & Pricing</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[['Subtotal', p.pricing.subtotal], ['Discount', -p.pricing.discount], ['Tax', p.pricing.tax]].map(([label, amount]) => (
                  <tr key={label}>
                    <td style={{ padding: '8px 0', fontSize: 13, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>{label}</td>
                    <td style={{ padding: '8px 0', fontSize: 13, color: '#374151', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 500 }}>{formatCurrency(Math.abs(amount))}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: '14px 0', fontSize: 16, fontWeight: 800, color: '#1e293b' }}>TOTAL</td>
                  <td style={{ padding: '14px 0', fontSize: 20, fontWeight: 900, color: '#6366f1', textAlign: 'right' }}>{formatCurrency(p.pricing.total, p.pricing.currency)}</td>
                </tr>
              </tbody>
            </table>
            {p.pricing.paymentPlan && <p style={{ fontSize: 13, color: '#64748b', marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 8 }}><strong>Payment Plan:</strong> {p.pricing.paymentPlan}</p>}
          </section>
        )}

        {/* Terms */}
        {p.terms && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>Terms & Conditions</h2>
            <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.8 }}>{p.terms}</p>
          </section>
        )}

        {/* Conclusion */}
        {p.conclusion && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', borderBottom: '2px solid #6366f1', paddingBottom: 8, marginBottom: 14 }}>Conclusion</h2>
            <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.8 }}>{p.conclusion}</p>
          </section>
        )}

        {/* Footer */}
        <div style={{ borderTop: '2px solid #6366f1', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Generated by LeadAI Pro · {formatDate(p.createdAt)}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>Thank you for your business! 🚀</div>
        </div>
      </div>
    </AppLayout>
  );
}
