import mongoose from 'mongoose';

const ApifyJobSchema = new mongoose.Schema(
  {
    actorId: { type: String, required: true },
    runId: { type: String, default: '' },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },
    jobType: {
      type: String,
      required: true,
      enum: ['website_audit', 'competitor_analysis', 'lead_generation', 'lead_enrichment', 'business_research'],
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'succeeded', 'failed', 'timed_out'],
      default: 'pending',
    },
    inputData: { type: mongoose.Schema.Types.Mixed, default: {} },
    datasetId: { type: String, default: '' },
    resultsCount: { type: Number, default: 0 },
    resultsSummary: { type: mongoose.Schema.Types.Mixed, default: {} },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    error: { type: String, default: '' },
  },
  { timestamps: true }
);

ApifyJobSchema.index({ jobType: 1, createdAt: -1 });
ApifyJobSchema.index({ status: 1 });
ApifyJobSchema.index({ runId: 1 });

export default mongoose.models.ApifyJob || mongoose.model('ApifyJob', ApifyJobSchema);
