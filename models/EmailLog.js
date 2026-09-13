import mongoose from 'mongoose';

const EmailLogSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', default: null },
    type: {
      type: String,
      required: true,
      enum: [
        'welcome',
        'proposal',
        'quotation',
        'contract',
        'invoice',
        'followup',
        'meeting_reminder',
        'meeting_confirmation',
        'payment_reminder',
        'status_update',
        'thank_you',
        'general',
      ],
    },
    recipient: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    provider: {
      type: String,
      enum: ['resend', 'smtp', 'simulated'],
      default: 'resend',
    },
    providerMessageId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending', 'cancelled'],
      default: 'pending',
    },
    sentAt: { type: Date, default: null },
    error: { type: String, default: '' },
    retryCount: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    // Dedup key format: e.g. "welcome_<leadId>" or "invoice_<invoiceId>"
    dedupKey: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

EmailLogSchema.index({ recipient: 1, createdAt: -1 });
EmailLogSchema.index({ status: 1 });
EmailLogSchema.index({ type: 1 });
EmailLogSchema.index({ leadId: 1 });

export default mongoose.models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);
