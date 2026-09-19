import mongoose from 'mongoose';

export const PIPELINE_STAGES = [
  'New Lead',
  'Qualified',
  'Contacted',
  'Replied',
  'Interested',
  'Meeting',
  'Proposal Sent',
  'Negotiation',
  'Closed Won',
  'Contract Sent',
  'Contract Signed',
  'Payment Pending',
  'Paid',
  'Completed',
  'Closed Lost',
  'Do Not Contact',
];

const LeadSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', index: true },

    // Primary Identity
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: null },
    phone: { type: String, trim: true, default: null },
    company: { type: String, trim: true, default: '' },
    companyName: { type: String, trim: true, default: '' },
    contactPerson: { type: String, trim: true, default: null },

    // Location & Geo
    address: { type: String, trim: true, default: null },
    city: { type: String, trim: true, default: null },
    country: { type: String, trim: true, default: '' },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    // Web & Digital Presence
    website: { type: String, trim: true, default: null },
    domain: { type: String, trim: true, default: null },
    websiteStatus: { type: String, default: null }, // e.g., 'Missing', 'Active', 'Outdated', 'Error'
    websiteTechnology: [{ type: String }],
    socialLinks: {
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
      facebook: { type: String, default: null },
      instagram: { type: String, default: null },
    },

    // Google Places Intelligence
    googlePlaceId: { type: String, trim: true, default: null, index: true },
    googleMapsUrl: { type: String, trim: true, default: null },
    rating: { type: Number, default: null },
    reviewCount: { type: Number, default: null },
    category: { type: String, trim: true, default: null },
    industry: { type: String, trim: true, default: 'General' },

    // Business & Project Details
    businessType: {
      type: String,
      default: 'Other',
    },
    projectType: {
      type: String,
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

    // Technical & Audit Scores (0 - 100)
    seoScore: { type: Number, default: null },
    performanceScore: { type: Number, default: null },
    mobileScore: { type: Number, default: null },
    accessibilityScore: { type: Number, default: null },
    securityScore: { type: Number, default: null },

    // AI Lead Intelligence
    leadScore: { type: Number, default: 50, min: 0, max: 100 },
    leadStatus: {
      type: String,
      enum: ['Hot', 'Warm', 'Cold'],
      default: 'Warm',
    },
    whyValuable: { type: String, default: '' },
    nextAction: { type: String, default: 'Send initial outreach' },
    recommendedService: { type: String, default: 'Website Redesign & AI Automation' },
    projectComplexity: { type: String, enum: ['Simple', 'Medium', 'Complex', 'Enterprise'], default: 'Medium' },
    estimatedBudget: { type: String, default: '' },
    estimatedTimeline: { type: String, default: '' },
    recommendedStack: [{ type: String }],
    requiredDevelopers: { type: Number, default: 1 },
    aiSummary: { type: String, default: '' },

    // Pipeline Status
    pipelineStatus: {
      type: String,
      enum: PIPELINE_STAGES,
      default: 'New Lead',
    },

    // Compliance & Outreach Controls
    doNotContact: { type: Boolean, default: false },
    unsubscribed: { type: Boolean, default: false },
    unsubscribeToken: { type: String, default: null },
    lastContactedAt: { type: Date, default: null },
    nextFollowUpDate: { type: Date, default: null },
    followUpCount: { type: Number, default: 0 },

    // Lead & Deliverability Verification
    verification: {
      status: { type: String, enum: ['unverified', 'valid', 'risky', 'invalid'], default: 'unverified' },
      emailValid: { type: Boolean, default: null },
      mxValid: { type: Boolean, default: null },
      isDisposable: { type: Boolean, default: false },
      isRoleAccount: { type: Boolean, default: false },
      phoneValid: { type: Boolean, default: null },
      websiteValid: { type: Boolean, default: null },
      verifiedAt: { type: Date, default: null },
      details: { type: String, default: '' },
    },

    // Token-Optimized AI Outreach Draft
    personalizedEmail: {
      subject: { type: String, default: '' },
      body: { type: String, default: '' },
      angle: { type: String, default: '' },
      generatedAt: { type: Date, default: null },
    },

    // Assignments & Annotations
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, default: '' },
    tags: [{ type: String }],

    // Related Documents
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal', default: null },
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', default: null },

    // Discovery Source
    source: { type: String, default: 'AI Discovery' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

LeadSchema.pre('save', function () {
  if (this.companyName && !this.company) {
    this.company = this.companyName;
  } else if (this.company && !this.companyName) {
    this.companyName = this.company;
  }
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
});

LeadSchema.index({ organizationId: 1, email: 1 });
LeadSchema.index({ organizationId: 1, phone: 1 });
LeadSchema.index({ organizationId: 1, domain: 1 });
LeadSchema.index({ organizationId: 1, googlePlaceId: 1 });
LeadSchema.index({ organizationId: 1, leadScore: -1 });
LeadSchema.index({ organizationId: 1, pipelineStatus: 1 });
LeadSchema.index({ createdAt: -1 });

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
