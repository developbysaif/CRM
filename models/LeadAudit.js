import mongoose from 'mongoose';

const LeadAuditSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', index: true },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null, index: true },
    url: { type: String, required: true, trim: true },
    hostname: { type: String, default: '' },

    overallScore: { type: Number, default: 50, min: 0, max: 100 },

    // Category Scores & Diagnoses
    performance: {
      score: { type: Number, default: 0 },
      grade: { type: String, default: 'C' },
      issues: [{ type: String }],
      recommendations: [{ type: String }],
    },
    seo: {
      score: { type: Number, default: 0 },
      grade: { type: String, default: 'C' },
      issues: [{ type: String }],
      recommendations: [{ type: String }],
    },
    mobile: {
      score: { type: Number, default: 0 },
      grade: { type: String, default: 'C' },
      issues: [{ type: String }],
      recommendations: [{ type: String }],
    },
    accessibility: {
      score: { type: Number, default: 0 },
      grade: { type: String, default: 'C' },
      issues: [{ type: String }],
      recommendations: [{ type: String }],
    },
    security: {
      score: { type: Number, default: 0 },
      grade: { type: String, default: 'C' },
      issues: [{ type: String }],
      recommendations: [{ type: String }],
    },
    ux: {
      score: { type: Number, default: 0 },
      grade: { type: String, default: 'C' },
      issues: [{ type: String }],
      recommendations: [{ type: String }],
    },

    // Diagnostics & Meta
    coreWebVitals: {
      lcp: { value: String, status: String },
      fid: { value: String, status: String },
      cls: { value: String, status: String },
      ttfb: { value: String, status: String },
    },
    techStack: [{ type: String }],
    hasSSL: { type: Boolean, default: true },
    hasMetaDescription: { type: Boolean, default: true },
    hasH1: { type: Boolean, default: true },
    hasSchema: { type: Boolean, default: false },

    // Opportunities & Recommendations
    summary: { type: String, default: '' },
    problems: [{ type: String }],
    opportunities: [{ type: String }],
    recommendedServices: [{ type: String }],
    estimatedImprovementCost: { type: String, default: '$2,500 - $5,000' },
    estimatedTimeline: { type: String, default: '2-4 weeks' },

    source: { type: String, default: 'Real Web Crawler' },
  },
  { timestamps: true }
);

LeadAuditSchema.index({ organizationId: 1, url: 1 });
LeadAuditSchema.index({ createdAt: -1 });

export default mongoose.models.LeadAudit || mongoose.model('LeadAudit', LeadAuditSchema);
