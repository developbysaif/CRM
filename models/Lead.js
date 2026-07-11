import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },

    // Business Info
    businessType: {
      type: String,
      enum: ['Restaurant', 'Hospital', 'Real Estate', 'School', 'Travel', 'AI Startup', 'Ecommerce', 'Portfolio', 'Agency', 'Manufacturing', 'Healthcare', 'Finance', 'Education', 'Other'],
      default: 'Other',
    },
    projectType: {
      type: String,
      enum: ['Website', 'Mobile App', 'AI Solution', 'CRM', 'ERP', 'Dashboard', 'Marketplace', 'SaaS', 'Booking System', 'Custom Software', 'Other'],
      default: 'Website',
    },
    targetAudience: { type: String, default: '' },
    businessGoals: { type: String, default: '' },
    preferredTechnology: [{ type: String }],
    expectedFeatures: [{ type: String }],

    // Budget & Timeline
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      raw: { type: String, default: '' },
    },
    deadline: { type: String, default: '' },
    urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },

    // AI Analysis
    leadScore: { type: Number, default: 0, min: 0, max: 100 },
    leadStatus: {
      type: String,
      enum: ['Hot', 'Warm', 'Cold'],
      default: 'Warm',
    },
    projectComplexity: { type: String, enum: ['Simple', 'Medium', 'Complex', 'Enterprise'], default: 'Medium' },
    estimatedBudget: { type: String, default: '' },
    estimatedTimeline: { type: String, default: '' },
    recommendedStack: [{ type: String }],
    requiredDevelopers: { type: Number, default: 1 },
    aiSummary: { type: String, default: '' },

    // Pipeline Status
    pipelineStatus: {
      type: String,
      enum: ['New Lead', 'Qualified', 'Proposal Sent', 'Meeting Scheduled', 'Negotiation', 'Contract Signed', 'Invoice Sent', 'Payment Received', 'Completed', 'Lost'],
      default: 'New Lead',
    },

    // Assignments
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, default: '' },
    tags: [{ type: String }],

    // Related Documents
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', default: null },
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', default: null },

    // Source
    source: { type: String, default: 'AI Chat' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

LeadSchema.index({ email: 1 });
LeadSchema.index({ leadScore: -1 });
LeadSchema.index({ pipelineStatus: 1 });
LeadSchema.index({ businessType: 1 });
LeadSchema.index({ country: 1 });
LeadSchema.index({ createdAt: -1 });

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
