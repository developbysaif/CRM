import mongoose from 'mongoose';

const FollowUpSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },

    step: { type: Number, required: true, min: 1, max: 5 },
    stepName: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },

    scheduledFor: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['scheduled', 'approval_required', 'approved', 'sent', 'cancelled', 'skipped'],
      default: 'scheduled',
      index: true,
    },

    sentAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: null },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

FollowUpSchema.index({ organizationId: 1, status: 1, scheduledFor: 1 });

export default mongoose.models.FollowUp || mongoose.model('FollowUp', FollowUpSchema);
