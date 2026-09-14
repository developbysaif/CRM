import mongoose from 'mongoose';

const ApprovalQueueSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', index: true },
    type: {
      type: String,
      required: true,
      enum: ['message', 'proposal', 'contract', 'campaign'],
      index: true,
    },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null, index: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },

    title: { type: String, required: true },
    recipient: { type: String, default: '' },
    channel: { type: String, enum: ['email', 'linkedin', 'whatsapp', 'proposal', 'contract'], default: 'email' },
    subject: { type: String, default: '' },
    content: { type: String, required: true },
    aiReasoning: { type: String, default: '' },

    status: {
      type: String,
      enum: ['ai_draft', 'approval_required', 'approved', 'rejected', 'scheduled', 'sent'],
      default: 'approval_required',
      index: true,
    },

    payload: { type: mongoose.Schema.Types.Mixed, default: {} },

    scheduledFor: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },
    sentAt: { type: Date, default: null },
    error: { type: String, default: '' },
  },
  { timestamps: true }
);

ApprovalQueueSchema.index({ organizationId: 1, status: 1, createdAt: -1 });

export default mongoose.models.ApprovalQueue || mongoose.model('ApprovalQueue', ApprovalQueueSchema);
