import mongoose from 'mongoose';

const ServiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  basePrice: { type: Number, default: 2500 },
  currency: { type: String, default: 'USD' },
  deliveryDays: { type: Number, default: 14 },
});

const SettingsSchema = new mongoose.Schema(
  {
    organizationId: { type: String, default: 'org_default', unique: true },

    // OpenAI Configuration
    openaiApiKey: { type: String, default: '' },
    openaiModel: { type: String, default: 'gpt-4o-mini' },

    // Google Places & Scraping Configuration (Firecrawl & Apify)
    googlePlacesApiKey: { type: String, default: '' },
    firecrawlApiKey: { type: String, default: '' },
    apifyApiToken: { type: String, default: '' },
    apifyDefaultActor: { type: String, default: 'compass/crawler-google-places' },
    apifyWebsiteActor: { type: String, default: 'apify/website-content-crawler' },

    // Resend Email Configuration (Backend only)
    resendApiKey: { type: String, default: '' },
    resendFromEmail: { type: String, default: 'onboarding@resend.dev' },

    // WhatsApp Cloud API Configuration
    whatsappAccessToken: { type: String, default: '' },
    whatsappPhoneNumberId: { type: String, default: '' },
    whatsappBusinessAccountId: { type: String, default: '' },

    // Lead & Email Verification Configuration
    verificationApiKey: { type: String, default: '' },

    // Company / Business Profile Information
    companyName: { type: String, default: 'LeadAI Pro Software Agency' },
    companyEmail: { type: String, default: 'sales@leadaipro.com' },
    companyPhone: { type: String, default: '+1 (800) 555-0199' },
    companyWebsite: { type: String, default: 'https://leadaipro.com' },
    companyAddress: { type: String, default: '100 Innovation Way, Suite 500, San Francisco, CA 94105' },
    taxNumber: { type: String, default: 'US-987654321' },
    defaultCurrency: { type: String, default: 'USD' },
    defaultTaxRate: { type: Number, default: 10 },
    emailSignature: {
      type: String,
      default: 'Best regards,\nSales & Partnership Team\nLeadAI Pro Agency',
    },

    // Configurable Services Catalog for Proposals & Estimates
    services: {
      type: [ServiceItemSchema],
      default: [
        { name: 'Website Development', description: 'Next.js high-performance SSR web application', basePrice: 4500, currency: 'USD', deliveryDays: 21 },
        { name: 'WordPress to Next.js Modernization', description: 'Rebuilding legacy WP sites into lightning fast React apps', basePrice: 3500, currency: 'USD', deliveryDays: 14 },
        { name: 'Shopify Custom Storefront', description: 'Headless e-commerce with custom checkout and CRM sync', basePrice: 5000, currency: 'USD', deliveryDays: 25 },
        { name: 'SEO & Core Web Vitals Optimization', description: 'Rank boost, schema markup, and sub-second page loads', basePrice: 2000, currency: 'USD', deliveryDays: 10 },
        { name: 'UI/UX Brand Design & Wireframes', description: 'Figma interactive prototypes and responsive design systems', basePrice: 2800, currency: 'USD', deliveryDays: 12 },
        { name: 'Mobile App (React Native)', description: 'Cross-platform iOS and Android mobile development', basePrice: 8500, currency: 'USD', deliveryDays: 45 },
        { name: 'AI Automation & Custom Chatbots', description: '24/7 lead qualification agents and internal workflow automations', basePrice: 4000, currency: 'USD', deliveryDays: 18 },
        { name: 'Custom Software & Enterprise Portal', description: 'Bespoke dashboards, RBAC authentication, and API integrations', basePrice: 9500, currency: 'USD', deliveryDays: 50 },
        { name: 'Monthly Maintenance & Hosting SLA', description: 'Continuous updates, uptime guarantee, and bug warranty', basePrice: 850, currency: 'USD', deliveryDays: 30 },
      ],
    },

    // Email SMTP Configuration
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    smtpSecure: { type: Boolean, default: false },
    fromEmail: { type: String, default: 'noreply@leadaipro.com' },

    // Lead Scoring Weights (0 - 100 configurable)
    scoringWeights: {
      websiteMissingWeight: { type: Number, default: 25 },
      poorWebsiteWeight: { type: Number, default: 20 },
      poorMobileWeight: { type: Number, default: 10 },
      poorSeoWeight: { type: Number, default: 10 },
      lowPerformanceWeight: { type: Number, default: 10 },
      highReviewCountWeight: { type: Number, default: 5 },
      strongCategoryWeight: { type: Number, default: 5 },
      publicEmailWeight: { type: Number, default: 5 },
      phoneAvailableWeight: { type: Number, default: 5 },
      buyingSignalWeight: { type: Number, default: 5 },
    },

    // Automation & Approval switches
    automations: {
      requireApprovalForOutreach: { type: Boolean, default: true },
      requireApprovalForProposals: { type: Boolean, default: true },
      requireApprovalForContracts: { type: Boolean, default: true },
      autoCreateProposalOnInterested: { type: Boolean, default: true },
      autoCreateContractOnClosedWon: { type: Boolean, default: true },
      notifyOwnerOnContractGenerated: { type: Boolean, default: true },
      enableFollowUpSequences: { type: Boolean, default: true },
      autoStopFollowUpOnReply: { type: Boolean, default: true },
      dailyOutreachLimit: { type: Number, default: 50 },
      followUpIntervalDays: { type: Number, default: 7 },
      maxFollowUps: { type: Number, default: 5 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
