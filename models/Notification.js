import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type: {
      type: String,
      enum: [
        'new_lead',
        'meeting',
        'proposal_accepted',
        'contract_signed',
        'invoice_paid',
        'follow_up',
        'system',
        'general',
        'proposal_created',
        'contract_created',
        'approval_required',
        'reply_received',
      ],
      default: 'system',
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
