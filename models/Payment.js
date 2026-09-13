import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema(
  {
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paymentMethod: {
      type: String,
      enum: ['Stripe', 'Bank Wire', 'Credit Card', 'PayPal', 'Crypto', 'Cash', 'Other'],
      default: 'Stripe',
    },
    transactionId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Completed',
    },
    paidAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
