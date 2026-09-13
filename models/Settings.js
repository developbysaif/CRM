import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    // OpenAI Configuration
    openaiApiKey: { type: String, default: '' },
    openaiModel: { type: String, default: 'gpt-4o' },

    // Apify Configuration (Backend only)
    apifyApiToken: { type: String, default: '' },
    apifyDefaultActor: { type: String, default: 'apify/website-content-crawler' },

    // Resend Email Configuration (Backend only)
    resendApiKey: { type: String, default: '' },
    resendFromEmail: { type: String, default: 'onboarding@resend.dev' },

    // Company Information
    companyName: { type: String, default: 'LeadAI Pro Software Agency' },
    companyEmail: { type: String, default: 'sales@leadaipro.com' },
    companyPhone: { type: String, default: '+1 (800) 555-0199' },
    companyWebsite: { type: String, default: 'https://leadaipro.com' },
    companyAddress: { type: String, default: '100 Innovation Way, Suite 500, San Francisco, CA 94105' },
    taxNumber: { type: String, default: 'US-987654321' },
    defaultCurrency: { type: String, default: 'USD' },
    defaultTaxRate: { type: Number, default: 10 },

    // Email SMTP Configuration
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    smtpSecure: { type: Boolean, default: false },
    fromEmail: { type: String, default: 'noreply@leadaipro.com' },

    // Lead Scoring Weights
    scoringWeights: {
      budgetMaxWeight: { type: Number, default: 25 },
      timelineUrgencyWeight: { type: Number, default: 15 },
      projectTypeWeight: { type: Number, default: 15 },
      businessTypeWeight: { type: Number, default: 10 },
      featuresWeight: { type: Number, default: 15 },
      countryWeight: { type: Number, default: 10 },
      companyAndPhoneWeight: { type: Number, default: 10 },
    },

    // Automation switches
    automations: {
      sendWelcomeEmail: { type: Boolean, default: true },
      sendProposalEmail: { type: Boolean, default: true },
      sendQuotationEmail: { type: Boolean, default: true },
      sendContractEmail: { type: Boolean, default: true },
      sendInvoiceEmail: { type: Boolean, default: true },
      sendPaymentReceiptEmail: { type: Boolean, default: true },
      sendMeetingReminderEmail: { type: Boolean, default: true },
      sendFollowupEmail: { type: Boolean, default: true },
      autoCreateLeadOnChat: { type: Boolean, default: true },
      enableRealtimeNotifications: { type: Boolean, default: true },
      autoEnrichWithApify: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
