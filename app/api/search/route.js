import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import Proposal from '@/models/Proposal';
import Quotation from '@/models/Quotation';
import Contract from '@/models/Contract';
import Invoice from '@/models/Invoice';
import Meeting from '@/models/Meeting';
import Client from '@/models/Client';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query) {
      return apiSuccess({ results: [], total: 0 });
    }

    const regex = new RegExp(query, 'i');

    const [leads, proposals, quotations, contracts, invoices, meetings] = await Promise.all([
      Lead.find({
        $or: [{ name: regex }, { email: regex }, { company: regex }, { country: regex }, { businessType: regex }, { projectType: regex }],
      })
        .limit(5)
        .select('name email company leadScore leadStatus pipelineStatus businessType projectType')
        .lean(),

      Proposal.find({
        $or: [{ clientName: regex }, { clientEmail: regex }, { clientCompany: regex }, { proposalNumber: regex }],
      })
        .limit(5)
        .select('proposalNumber clientName clientCompany status pricing')
        .lean(),

      Quotation.find({
        $or: [{ clientName: regex }, { clientEmail: regex }, { quotationNumber: regex }],
      })
        .limit(5)
        .select('quotationNumber clientName total status')
        .lean(),

      Contract.find({
        $or: [{ clientName: regex }, { projectName: regex }, { contractNumber: regex }],
      })
        .limit(5)
        .select('contractNumber clientName projectName status totalAmount')
        .lean(),

      Invoice.find({
        $or: [{ clientName: regex }, { invoiceNumber: regex }, { clientEmail: regex }],
      })
        .limit(5)
        .select('invoiceNumber clientName total status dueDate')
        .lean(),

      Meeting.find({
        $or: [{ title: regex }, { 'attendees.name': regex }, { 'attendees.email': regex }],
      })
        .limit(5)
        .select('title startTime status type')
        .lean(),
    ]);

    const results = [
      ...leads.map((l) => ({
        id: l._id,
        title: l.name,
        subtitle: `${l.company || 'Individual'} · ${l.projectType} (${l.leadStatus})`,
        type: 'Lead',
        url: `/leads/${l._id}`,
        badge: `${l.leadScore}/100`,
      })),
      ...proposals.map((p) => ({
        id: p._id,
        title: `${p.proposalNumber} · ${p.clientName}`,
        subtitle: `${p.clientCompany || 'Client'} · $${(p.pricing?.total || 0).toLocaleString()}`,
        type: 'Proposal',
        url: `/proposals/${p._id}`,
        badge: p.status,
      })),
      ...quotations.map((q) => ({
        id: q._id,
        title: `${q.quotationNumber} · ${q.clientName}`,
        subtitle: `$${(q.total || 0).toLocaleString()}`,
        type: 'Quotation',
        url: `/quotations/${q._id}`,
        badge: q.status,
      })),
      ...contracts.map((c) => ({
        id: c._id,
        title: `${c.contractNumber} · ${c.projectName}`,
        subtitle: `${c.clientName} · $${(c.totalAmount || 0).toLocaleString()}`,
        type: 'Contract',
        url: `/contracts/${c._id}`,
        badge: c.status,
      })),
      ...invoices.map((inv) => ({
        id: inv._id,
        title: `${inv.invoiceNumber} · ${inv.clientName}`,
        subtitle: `$${(inv.total || 0).toLocaleString()} · Due ${new Date(inv.dueDate).toLocaleDateString()}`,
        type: 'Invoice',
        url: `/invoices/${inv._id}`,
        badge: inv.status,
      })),
      ...meetings.map((m) => ({
        id: m._id,
        title: m.title,
        subtitle: `${new Date(m.startTime).toLocaleString()} · ${m.type}`,
        type: 'Meeting',
        url: `/meetings`,
        badge: m.status,
      })),
    ];

    return apiSuccess({ results, total: results.length });
  } catch (error) {
    return apiError('Search error: ' + error.message, 500);
  }
}
