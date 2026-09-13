import connectDB from '@/lib/db';
import Invoice from '@/models/Invoice';
import Payment from '@/models/Payment';
import Lead from '@/models/Lead';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api';
import { sendAutomatedEmail } from '@/lib/services/email/email.service';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const invoice = await Invoice.findById(id).populate('leadId');
    if (!invoice) return apiError('Invoice not found', 404);

    const payments = await Payment.find({ invoiceId: id }).sort({ createdAt: -1 });

    return apiSuccess({ invoice, payments });
  } catch (error) {
    return apiError('Failed to fetch invoice: ' + error.message, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const invoice = await Invoice.findById(id);
    if (!invoice) return apiError('Invoice not found', 404);

    // If recording a payment
    if (body.recordPayment) {
      const paymentAmount = Number(body.amount || 0);
      const paymentMethod = body.paymentMethod || 'Stripe';
      const transactionId = body.transactionId || `TXN-${Date.now()}`;

      await Payment.create({
        invoiceId: id,
        leadId: invoice.leadId,
        amount: paymentAmount,
        currency: invoice.currency || 'USD',
        paymentMethod,
        transactionId,
        status: 'Completed',
        notes: body.notes || 'Payment recorded via portal',
      });

      invoice.amountPaid = (invoice.amountPaid || 0) + paymentAmount;
      invoice.balanceDue = Math.max(0, invoice.total - invoice.amountPaid);
      if (invoice.amountPaid >= invoice.total) {
        invoice.status = 'Paid';
        invoice.paidAt = new Date();
      } else {
        invoice.status = 'Partially Paid';
      }
      await invoice.save();

      if (invoice.leadId) {
        if (invoice.status === 'Paid') {
          await Lead.findByIdAndUpdate(invoice.leadId, { pipelineStatus: 'Payment Received' });
        }
        await ActivityLog.create({
          leadId: invoice.leadId,
          action: 'payment_received',
          title: `💰 Payment Received: $${paymentAmount.toLocaleString()}`,
          description: `Invoice ${invoice.invoiceNumber} paid via ${paymentMethod}`,
        });
        await Notification.create({
          type: 'invoice_paid',
          title: `💰 Payment of $${paymentAmount.toLocaleString()} Received`,
          message: `Invoice ${invoice.invoiceNumber} from ${invoice.clientName}`,
          link: `/invoices/${invoice._id}`,
        });
      }

      // Auto-send Thank You & Receipt Email if configured
      const settings = await Settings.findOne();
      if (settings?.automations?.sendPaymentReceiptEmail !== false && invoice.clientEmail) {
        try {
          await sendAutomatedEmail({
            to: invoice.clientEmail,
            template: 'thank_you',
            variables: {
              clientName: invoice.clientName,
              invoiceNumber: invoice.invoiceNumber,
              paymentAmount: `$${paymentAmount.toLocaleString()}`,
              receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
            },
            leadId: invoice.leadId || null,
            dedupKey: `payment_receipt_${transactionId}`,
          });
        } catch (mailErr) {
          console.warn('Payment receipt email dispatch notice:', mailErr.message);
        }
      }

      return apiSuccess(invoice, 'Payment recorded successfully');
    }

    // Generic update
    Object.assign(invoice, body);
    await invoice.save();

    return apiSuccess(invoice, 'Invoice updated');
  } catch (error) {
    return apiError('Failed to update invoice: ' + error.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await Invoice.findByIdAndDelete(id);
    return apiSuccess(null, 'Invoice deleted');
  } catch (error) {
    return apiError('Failed to delete invoice: ' + error.message, 500);
  }
}
