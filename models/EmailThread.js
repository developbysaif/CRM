import mongoose from 'mongoose';

const EmailThreadSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },

    subject: { type: String, required: true, trim: true },
    snippet: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 1 },

    status: {
      type: String,
      enum: ['active', 'waiting_reply', 'replied', 'closed', 'unsubscribed'],
      default: 'waiting_reply',
    },

    aiIntent: {
      type: String,
      enum: [
        'Interested',
        'Not Interested',
        'Question',
        'Price Request',
        'Meeting Request',
        'Negotiation',
        'Out of Office',
        'Unsubscribe',
        'Wrong Person',
        'Already Has Provider',
        'Spam',
        'None',
      ],
      default: 'None',
    },

    suggestedReply: { type: String, default: '' },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

EmailThreadSchema.index({ organizationId: 1, leadId: 1, updatedAt: -1 });

export default mongoose.models.EmailThread || mongoose.model('EmailThread', EmailThreadSchema);
