import mongoose from 'mongoose';

const SuppressionListSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', index: true },
    email: { type: String, trim: true, lowercase: true, index: true, default: null },
    phone: { type: String, trim: true, default: null },
    domain: { type: String, trim: true, lowercase: true, default: null },
    reason: {
      type: String,
      enum: ['unsubscribed', 'do_not_contact', 'bounced', 'complaint'],
      default: 'unsubscribed',
    },
    source: { type: String, default: 'Unsubscribe Link' },
  },
  { timestamps: true }
);

SuppressionListSchema.index({ organizationId: 1, email: 1 });

export default mongoose.models.SuppressionList || mongoose.model('SuppressionList', SuppressionListSchema);
