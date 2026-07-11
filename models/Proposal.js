import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: String,
  deliverables: [String],
});

const ProposalSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    proposalNumber: { type: String, unique: true },

    // Client Info
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientCompany: { type: String, default: '' },
    clientCountry: { type: String, default: '' },

    // Proposal Content
    executiveSummary: { type: String, default: '' },
    businessGoals: { type: String, default: '' },
    projectScope: { type: String, default: '' },
    features: [{ type: String }],
    technologyStack: [{ type: String }],
    timeline: { type: String, default: '' },
    milestones: [MilestoneSchema],
    deliverables: [{ type: String }],

    // Pricing
    pricing: {
      subtotal: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      paymentPlan: { type: String, default: '' },
    },

    // Terms
    terms: { type: String, default: '' },
    conclusion: { type: String, default: '' },
    validUntil: { type: Date },

    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Viewed', 'Accepted', 'Rejected', 'Revised'],
      default: 'Draft',
    },
    sentAt: { type: Date },
    viewedAt: { type: Date },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

ProposalSchema.pre('save', async function (next) {
  if (!this.proposalNumber) {
    const count = await mongoose.models.Proposal.countDocuments();
    this.proposalNumber = `PROP-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

export default mongoose.models.Proposal || mongoose.model('Proposal', ProposalSchema);
