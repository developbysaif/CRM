import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', index: true },
    campaignName: { type: String, required: true, trim: true },
    targetIndustry: { type: String, default: 'All' },
    targetLocation: { type: String, default: 'All' },

    messageTemplate: {
      subject: { type: String, default: '' },
      body: { type: String, default: '' },
      channel: { type: String, enum: ['email', 'linkedin', 'whatsapp'], default: 'email' },
    },

    provider: {
      type: String,
      enum: ['resend', 'smtp', 'gmail', 'outlook'],
      default: 'resend',
    },

    dailyLimit: { type: Number, default: 50 },
    sentToday: { type: Number, default: 0 },
    lastSentDate: { type: Date, default: null },

    status: {
      type: String,
      enum: ['Draft', 'Ready', 'Running', 'Paused', 'Completed', 'Stopped'],
      default: 'Draft',
    },

    totalLeads: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
    interestedCount: { type: Number, default: 0 },

    leads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }],

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true }
);

CampaignSchema.index({ organizationId: 1, status: 1 });

export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
