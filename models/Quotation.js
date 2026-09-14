import mongoose from 'mongoose';

const QuotationItemSchema = new mongoose.Schema({
  service: { type: String, required: true },
  description: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
});

const QuotationSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    quotationNumber: { type: String, unique: true },

    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientCompany: { type: String, default: '' },
    clientCountry: { type: String, default: '' },
    clientPhone: { type: String, default: '' },

    items: [QuotationItemSchema],

    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    tax: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },

    notes: { type: String, default: '' },
    terms: { type: String, default: '' },
    validUntil: { type: Date },

    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
      default: 'Draft',
    },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

QuotationSchema.pre('save', async function () {
  if (!this.quotationNumber) {
    const count = await mongoose.models.Quotation.countDocuments();
    this.quotationNumber = `QUO-${String(count + 1).padStart(5, '0')}`;
  }
});

export default mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema);
