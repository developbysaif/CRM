import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
});

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', default: null },

    // Client details
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientCompany: { type: String, default: '' },
    clientAddress: { type: String, default: '' },
    clientCountry: { type: String, default: '' },

    // Financials
    items: [InvoiceItemSchema],
    subtotal: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },

    // Dates & Terms
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date, default: null },
    paymentTerms: { type: String, default: 'Due upon receipt' },
    notes: { type: String, default: '' },
    paymentInstructions: { type: String, default: 'Please remit payment via wire transfer or Stripe.' },

    // Status
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);

InvoiceSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    const count = (await mongoose.models.Invoice?.countDocuments()) || 0;
    this.invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
  }
  this.balanceDue = Math.max(0, (this.total || 0) - (this.amountPaid || 0));
  if (this.amountPaid >= this.total && this.total > 0) {
    this.status = 'Paid';
    if (!this.paidAt) this.paidAt = new Date();
  }
});

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
