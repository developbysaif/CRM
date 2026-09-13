import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: {
      type: String,
      required: true,
      enum: [
        'lead_created',
        'stage_changed',
        'score_updated',
        'proposal_created',
        'proposal_sent',
        'proposal_accepted',
        'quotation_created',
        'quotation_sent',
        'contract_created',
        'contract_signed',
        'invoice_created',
        'invoice_sent',
        'payment_received',
        'meeting_scheduled',
        'meeting_completed',
        'note_added',
        'email_sent',
        'website_audited',
        'competitor_analyzed',
      ],
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ leadId: 1, createdAt: -1 });

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
