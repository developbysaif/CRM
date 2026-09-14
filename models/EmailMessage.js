import mongoose from 'mongoose';

const EmailMessageSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', index: true },
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmailThread', required: true, index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },

    messageId: { type: String, default: '' }, // RFC / Provider Message-ID
    direction: { type: String, enum: ['outbound', 'inbound'], required: true },

    from: { type: String, required: true },
    to: { type: String, required: true },
    subject: { type: String, default: '' },
    bodyText: { type: String, default: '' },
    bodyHtml: { type: String, default: '' },

    status: {
      type: String,
      enum: ['draft', 'approval_required', 'approved', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed'],
      default: 'sent',
    },

    aiClassification: {
      intent: { type: String, default: 'None' },
      confidence: { type: Number, default: 0 },
      reasoning: { type: String, default: '' },
      suggestedReply: { type: String, default: '' },
    },

    sentAt: { type: Date, default: null },
    receivedAt: { type: Date, default: null },
    rawHeaders: { type: mongoose.Schema.Types.Mixed, default: {} },
    error: { type: String, default: '' },
  },
  { timestamps: true }
);

EmailMessageSchema.index({ threadId: 1, createdAt: 1 });
EmailMessageSchema.index({ messageId: 1 });

export default mongoose.models.EmailMessage || mongoose.model('EmailMessage', EmailMessageSchema);
