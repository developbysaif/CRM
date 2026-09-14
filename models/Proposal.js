import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: String,
  deliverables: [String],
});

const ProposalSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    proposalNumber: { type: String, unique: true },

    // Client Info
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    clientCompany: { type: String, default: '' },
    clientCountry: { type: String, default: '' },

    // Proposal Content
    proposalTitle: { type: String, default: 'Strategic Software & Digital Growth Proposal' },
    executiveSummary: { type: String, default: '' },
    clientProblem: { type: String, default: '' },
    recommendedSolution: { type: String, default: '' },
    businessGoals: { type: String, default: '' },
    projectScope: { type: String, default: '' },
    features: [{ type: String }],
    technologyStack: [{ type: String }],
    timeline: { type: String, default: '' },
    milestones: [MilestoneSchema],
    deliverables: [{ type: String }],
    assumptions: { type: String, default: '' },
    nextSteps: { type: String, default: '' },
    aiReasoning: { type: String, default: '' },

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

    // Approval Workflow Status
    status: {
      type: String,
      enum: ['Draft', 'Approval Required', 'Approved', 'Rejected', 'Sent', 'Viewed', 'Accepted', 'Revised'],
      default: 'Draft',
      index: true,
    },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sentAt: { type: Date, default: null },
    viewedAt: { type: Date, default: null },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ProposalSchema.pre('save', async function () {
  if (!this.proposalNumber) {
    const count = await mongoose.models.Proposal.countDocuments();
    this.proposalNumber = `PROP-${String(count + 1).padStart(5, '0')}`;
  }
});

export default mongoose.models.Proposal || mongoose.model('Proposal', ProposalSchema);
