import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import Lead from '@/models/Lead';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api';
import { sendAutomatedEmail } from '@/lib/services/email/email.service';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const leadId = searchParams.get('leadId');
    const search = searchParams.get('search');

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (leadId) filter.leadId = leadId;
    if (search) {
      filter.$or = [
        { clientName: new RegExp(search, 'i') },
        { invoiceNumber: new RegExp(search, 'i') },
        { clientEmail: new RegExp(search, 'i') },
      ];
    }

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });

    // Summary stats
    const totalBilled = invoices.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalPaid = invoices.filter((i) => i.status === 'Paid').reduce((acc, curr) => acc + (curr.total || 0), 0);
    const totalPending = totalBilled - totalPaid;

    return apiSuccess({
      invoices,
      stats: { totalBilled, totalPaid, totalPending, count: invoices.length },
    });
  } catch (error) {
    return apiError('Failed to fetch invoices: ' + error.message, 500);
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      leadId,
      clientName,
      clientEmail,
      clientCompany,
      clientAddress,
      clientCountry,
      items = [],
      discountPercent = 0,
      taxPercent = 10,
      currency = 'USD',
      dueDate,
      notes,
    } = body;

    if (!clientName || !clientEmail) {
      return apiError('Client name and email are required', 400);
    }

    const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.rate || 0)), 0);
    const discountAmount = (subtotal * Number(discountPercent || 0)) / 100;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = (taxableAmount * Number(taxPercent || 0)) / 100;
    const total = taxableAmount + taxAmount;

    const invoice = await Invoice.create({
      leadId: leadId || null,
      clientName,
      clientEmail,
      clientCompany: clientCompany || '',
      clientAddress: clientAddress || '',
      clientCountry: clientCountry || '',
      items: items.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity || 1),
        rate: Number(i.rate || 0),
        amount: Number(i.quantity || 1) * Number(i.rate || 0),
      })),
      subtotal,
      discountPercent,
      discountAmount,
      taxPercent,
      taxAmount,
      total,
      currency,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: notes || 'Thank you for your business.',
      status: 'Sent',
    });

    if (leadId) {
      await Lead.findByIdAndUpdate(leadId, { pipelineStatus: 'Invoice Sent' });
      await ActivityLog.create({
        leadId,
        action: 'invoice_created',
        title: `🧾 Invoice Created: ${invoice.invoiceNumber}`,
        description: `Billed $${total.toLocaleString()} to ${clientName}`,
      });
      await Notification.create({
        type: 'invoice_paid',
        title: `🧾 Invoice ${invoice.invoiceNumber} Sent`,
        message: `Amount: $${total.toLocaleString()} sent to ${clientName}`,
        link: `/invoices/${invoice._id}`,
      });
    }

    // Auto-send Invoice Email if configured
    const settings = await Settings.findOne();
    if (settings?.automations?.sendInvoiceEmail !== false && clientEmail) {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        await sendAutomatedEmail({
          to: clientEmail,
          template: 'invoice',
          variables: {
            clientName,
            invoiceNumber: invoice.invoiceNumber,
            total: invoice.total,
            dueDate: new Date(invoice.dueDate).toLocaleDateString(),
            invoiceUrl: `${appUrl}/invoices/${invoice._id}`,
          },
          leadId: leadId || null,
          dedupKey: `invoice_${invoice._id}`,
        });
      } catch (mailErr) {
        console.warn('Invoice email dispatch notice:', mailErr.message);
      }
    }

    return apiSuccess(invoice, 'Invoice created successfully', 201);
  } catch (error) {
    return apiError('Failed to create invoice: ' + error.message, 500);
  }
}
