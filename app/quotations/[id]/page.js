'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/index';
import { generatePDF, formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

export default function QuotationDetailPage() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) fetch(`/api/quotations/${id}`).then(r => r.json()).then(d => { if (d.success) setQuotation(d.data); setLoading(false); });
  }, [id]);

  async function handleDownload() {
    setDownloading(true);
    await generatePDF('quotation-document', `quotation-${quotation.quotationNumber}.pdf`);
    setDownloading(false);
    toast.success('PDF downloaded!');
  }

  if (loading) return <AppLayout title="Quotation"><div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div></AppLayout>;
  if (!quotation) return <AppLayout title="Quotation Not Found"><p style={{ padding: 40 }}>Not found</p></AppLayout>;

  const q = quotation;
  return (
    <AppLayout title={`Quotation ${q.quotationNumber}`} subtitle={`For ${q.clientName}`}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'flex-end' }}>
        <button onClick={handleDownload} disabled={downloading} className="btn btn-primary">
          {downloading ? <Spinner size={16} /> : '⬇️'} Download PDF
        </button>
      </div>

      <div id="quotation-document" className="document-paper">
        {/* Header */}
        <div className="document-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#6366f1' }}>LeadAI Pro</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>AI-Powered Software Agency</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>QUOTATION</div>
              <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 700 }}>{q.quotationNumber}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Valid Until: {formatDate(q.validUntil)}</div>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32, padding: 16, background: '#f8fafc', borderRadius: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Bill To</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{q.clientName}</div>
            {q.clientCompany && <div style={{ fontSize: 13, color: '#64748b' }}>{q.clientCompany}</div>}
            <div style={{ fontSize: 13, color: '#64748b' }}>{q.clientEmail}</div>
            {q.clientPhone && <div style={{ fontSize: 13, color: '#64748b' }}>{q.clientPhone}</div>}
            {q.clientCountry && <div style={{ fontSize: 13, color: '#64748b' }}>{q.clientCountry}</div>}
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Quotation Details</div>
            <div style={{ fontSize: 13, color: '#374151' }}><strong>Date:</strong> {formatDate(q.createdAt)}</div>
            <div style={{ fontSize: 13, color: '#374151' }}><strong>Currency:</strong> {q.currency}</div>
            <div style={{ fontSize: 13, color: '#374151' }}><strong>Status:</strong> {q.status}</div>
          </div>
        </div>

        {/* Items Table */}
        <section style={{ marginBottom: 28 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#6366f1' }}>
                {['#', 'Service', 'Description', 'Qty', 'Unit Price', 'Total'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Qty' || h === 'Unit Price' || h === 'Total' ? 'right' : 'left', color: 'white', fontSize: 12, fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.items?.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#64748b' }}>{i + 1}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{item.service}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#64748b' }}>{item.description}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, textAlign: 'right', color: '#374151' }}>{item.quantity}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, textAlign: 'right', color: '#374151' }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
          <div style={{ width: 300 }}>
            {[['Subtotal', q.subtotal], ['Discount', -q.discount], ['Tax', q.tax]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{l}</span>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{formatCurrency(Math.abs(v))}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderTop: '2px solid #6366f1' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#1e293b' }}>TOTAL</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#6366f1' }}>{formatCurrency(q.total, q.currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {q.notes && <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}><strong style={{ fontSize: 12 }}>Notes:</strong><p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{q.notes}</p></div>}
        {q.terms && <div style={{ fontSize: 11, color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: 14 }}><strong>Terms:</strong> {q.terms}</div>}

        <div style={{ borderTop: '2px solid #6366f1', paddingTop: 16, marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Generated by LeadAI Pro · {formatDate(q.createdAt)}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>Thank you for your business!</div>
        </div>
      </div>
    </AppLayout>
  );
}
