/**
 * LeadAI Pro — Database Seed Script
 * Populates initial Admin user, system settings, and realistic demo CRM data.
 * Run with: npm run seed (or node scripts/seed.js)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-leads-platform';

async function seed() {
  console.log('⚡ Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected successfully!\n');

  const db = mongoose.connection.db;

  // 1. Create or Update Admin User
  console.log('👤 Seeding Admin User...');
  const usersCol = db.collection('users');
  const existingAdmin = await usersCol.findOne({ email: 'admin@leadaipro.com' });

  const hashedPassword = await bcrypt.hash('admin123456', 12);
  let adminId;

  if (existingAdmin) {
    await usersCol.updateOne(
      { _id: existingAdmin._id },
      {
        $set: {
          name: 'LeadAI System Admin',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          updatedAt: new Date(),
        },
      }
    );
    adminId = existingAdmin._id;
    console.log('✓ Admin user updated: admin@leadaipro.com (Password: admin123456)');
  } else {
    const res = await usersCol.insertOne({
      name: 'LeadAI System Admin',
      email: 'admin@leadaipro.com',
      password: hashedPassword,
      role: 'admin',
      avatar: '',
      phone: '+1 (800) 555-0199',
      isActive: true,
      preferences: {
        notifications: true,
        emailAlerts: true,
        darkMode: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    adminId = res.insertedId;
    console.log('✓ Admin user created: admin@leadaipro.com (Password: admin123456)');
  }

  // 2. Initialize System Settings
  console.log('\n⚙️ Seeding System Settings...');
  const settingsCol = db.collection('settings');
  const existingSettings = await settingsCol.findOne();

  const defaultSettings = {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o',
    apifyApiToken: process.env.APIFY_API_TOKEN || '',
    apifyDefaultActor: 'apify/website-content-crawler',
    resendApiKey: process.env.RESEND_API_KEY || '',
    resendFromEmail: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    companyName: 'LeadAI Pro Enterprise',
    companyEmail: 'sales@leadaipro.com',
    companyPhone: '+1 (800) 555-0199',
    companyWebsite: 'https://leadaipro.com',
    companyAddress: '100 Innovation Way, Suite 500, San Francisco, CA 94105',
    taxNumber: 'US-987654321',
    defaultCurrency: 'USD',
    defaultTaxRate: 10,
    scoringWeights: {
      budgetMaxWeight: 25,
      timelineUrgencyWeight: 15,
      projectTypeWeight: 15,
      businessTypeWeight: 10,
      featuresWeight: 15,
      countryWeight: 10,
      companyAndPhoneWeight: 10,
    },
    automations: {
      sendWelcomeEmail: true,
      sendProposalEmail: true,
      sendQuotationEmail: true,
      sendContractEmail: true,
      sendInvoiceEmail: true,
      sendPaymentReceiptEmail: true,
      sendMeetingReminderEmail: true,
      sendFollowupEmail: true,
      autoCreateLeadOnChat: true,
      enableRealtimeNotifications: true,
      autoEnrichWithApify: false,
    },
    updatedAt: new Date(),
  };

  if (existingSettings) {
    await settingsCol.updateOne({ _id: existingSettings._id }, { $set: defaultSettings });
    console.log('✓ System settings updated with current environment values.');
  } else {
    await settingsCol.insertOne({ ...defaultSettings, createdAt: new Date() });
    console.log('✓ System settings created.');
  }

  // 3. Clear existing demo leads & collections for clean seed
  console.log('\n🧹 Clearing old demo records for clean setup...');
  await db.collection('leads').deleteMany({});
  await db.collection('proposals').deleteMany({});
  await db.collection('quotations').deleteMany({});
  await db.collection('invoices').deleteMany({});
  await db.collection('contracts').deleteMany({});
  await db.collection('meetings').deleteMany({});
  await db.collection('activitylogs').deleteMany({});
  await db.collection('notifications').deleteMany({});

  // 4. Seed Diverse Demo Leads
  console.log('🚀 Seeding Realistic CRM Leads...');
  const leadsCol = db.collection('leads');

  const demoLeads = [
    {
      name: 'Sophia Laurent',
      email: 'sophia@novacarehealth.com',
      phone: '+1 (415) 890-1234',
      company: 'NovaCare Health',
      country: 'United States',
      website: 'https://novacarehealth.example.com',
      businessType: 'Healthcare',
      projectType: 'AI Solution',
      targetAudience: 'Patients and hospital staff',
      businessGoals: 'Automate patient triage and intake using HIPAA-compliant AI agents.',
      preferredTechnology: ['Next.js', 'Python', 'FastAPI', 'OpenAI', 'PostgreSQL'],
      expectedFeatures: ['Patient Intake Chatbot', 'EHR Integration', 'Automated Triage', 'Admin Analytics'],
      budget: { min: 25000, max: 45000, currency: 'USD', raw: '$25,000 - $45,000' },
      deadline: '2 months',
      urgency: 'High',
      leadScore: 94,
      leadStatus: 'Hot',
      projectComplexity: 'Enterprise',
      estimatedBudget: '$35,000 - $45,000',
      estimatedTimeline: '8 - 10 Weeks',
      recommendedStack: ['Next.js 16', 'FastAPI', 'LangChain', 'PostgreSQL'],
      requiredDevelopers: 3,
      aiSummary: 'Enterprise-grade healthcare lead with high budget and immediate Q4 deployment requirements.',
      pipelineStatus: 'Proposal Sent',
      assignedTo: adminId,
      notes: 'Had a discovery call. Client loved our AI chatbot demo. Requested formal proposal with milestone pricing.',
      tags: ['Enterprise', 'Healthcare', 'High-Budget', 'AI'],
      source: 'AI Chat',
      createdAt: new Date(Date.now() - 4 * 86400000),
      updatedAt: new Date(),
    },
    {
      name: 'Marcus Vance',
      email: 'marcus@apexrealty.co',
      phone: '+1 (212) 745-9810',
      company: 'Apex Luxury Real Estate',
      country: 'United States',
      website: 'https://apexrealty.example.com',
      businessType: 'Real Estate',
      projectType: 'CRM',
      targetAudience: 'High-net-worth property buyers and brokers',
      businessGoals: 'Centralized lead capturing from Zillow, social ads, and automated WhatsApp followup.',
      preferredTechnology: ['React', 'Node.js', 'MongoDB', 'Twilio'],
      expectedFeatures: ['Lead Auto-Assignment', 'WhatsApp Integration', 'Property Matching AI', 'Commission Tracking'],
      budget: { min: 18000, max: 28000, currency: 'USD', raw: '$18,000 - $28,000' },
      deadline: '6 weeks',
      urgency: 'High',
      leadScore: 88,
      leadStatus: 'Hot',
      projectComplexity: 'Complex',
      estimatedBudget: '$22,000 - $26,000',
      estimatedTimeline: '6 Weeks',
      recommendedStack: ['Next.js', 'Node.js', 'MongoDB', 'Twilio API'],
      requiredDevelopers: 2,
      aiSummary: 'High-intent real estate brokerage looking to replace Salesforce with a custom, tailored CRM.',
      pipelineStatus: 'Negotiation',
      assignedTo: adminId,
      notes: 'Contract draft sent. Reviewing payment milestones: 40% upfront, 30% milestone 1, 30% on completion.',
      tags: ['Real Estate', 'CRM', 'Custom Dev'],
      source: 'Website Form',
      createdAt: new Date(Date.now() - 7 * 86400000),
      updatedAt: new Date(),
    },
    {
      name: 'Elena Rostova',
      email: 'elena@solarpulse.io',
      phone: '+44 20 7946 0921',
      company: 'SolarPulse Energy',
      country: 'United Kingdom',
      website: 'https://solarpulse.example.com',
      businessType: 'AI Startup',
      projectType: 'Dashboard',
      targetAudience: 'Solar panel installers and commercial building managers',
      businessGoals: 'Real-time telemetry and energy yield forecasting with AI anomaly detection.',
      preferredTechnology: ['React', 'TypeScript', 'Tailwind', 'Python'],
      expectedFeatures: ['IoT Telemetry Charts', 'Predictive Weather Models', 'Client Portal', 'PDF Report Generator'],
      budget: { min: 30000, max: 50000, currency: 'USD', raw: '$30k - $50k' },
      deadline: '3 months',
      urgency: 'Medium',
      leadScore: 91,
      leadStatus: 'Hot',
      projectComplexity: 'Complex',
      estimatedBudget: '$38,000 - $44,000',
      estimatedTimeline: '10 Weeks',
      recommendedStack: ['Next.js 16', 'Recharts', 'Tailwind CSS', 'FastAPI'],
      requiredDevelopers: 3,
      aiSummary: 'Funded clean-tech startup requiring high-performance dashboards and IoT data visualization.',
      pipelineStatus: 'Contract Signed',
      assignedTo: adminId,
      notes: 'Contract signed! Initial deposit invoice generated. Project kickoff meeting scheduled.',
      tags: ['CleanTech', 'SaaS', 'IoT', 'Dashboard'],
      source: 'Referral',
      createdAt: new Date(Date.now() - 12 * 86400000),
      updatedAt: new Date(),
    },
    {
      name: 'Tariq Al-Mansoor',
      email: 'tariq@gourmetfleet.ae',
      phone: '+971 50 123 4567',
      company: 'GourmetFleet Cloud Kitchens',
      country: 'United Arab Emirates',
      website: 'https://gourmetfleet.example.ae',
      businessType: 'Restaurant',
      projectType: 'Booking System',
      targetAudience: 'Dine-in customers and delivery kitchens',
      businessGoals: 'Automate kitchen order routing and table reservations with multi-branch analytics.',
      preferredTechnology: ['Next.js', 'React Native', 'MongoDB'],
      expectedFeatures: ['POS Sync', 'Delivery App Integration', 'Staff Scheduling', 'Inventory Alerts'],
      budget: { min: 12000, max: 20000, currency: 'USD', raw: '$15k' },
      deadline: '1 month',
      urgency: 'Medium',
      leadScore: 78,
      leadStatus: 'Warm',
      projectComplexity: 'Medium',
      estimatedBudget: '$15,000 - $18,000',
      estimatedTimeline: '4 - 5 Weeks',
      recommendedStack: ['Next.js', 'Tailwind CSS', 'MongoDB', 'Stripe'],
      requiredDevelopers: 2,
      aiSummary: 'Expanding cloud kitchen chain in Dubai looking to modernize their ordering systems.',
      pipelineStatus: 'Qualified',
      assignedTo: adminId,
      notes: 'Shared case study of similar F&B solutions. Demo meeting planned for next Tuesday.',
      tags: ['Hospitality', 'F&B', 'Booking'],
      source: 'AI Chat',
      createdAt: new Date(Date.now() - 2 * 86400000),
      updatedAt: new Date(),
    },
    {
      name: 'David Chen',
      email: 'david@urbanfitgear.com',
      phone: '+1 (312) 555-0819',
      company: 'UrbanFit Athletics',
      country: 'United States',
      website: 'https://urbanfitgear.example.com',
      businessType: 'Ecommerce',
      projectType: 'Marketplace',
      targetAudience: 'Fitness enthusiasts and independent gym equipment makers',
      businessGoals: 'Custom multi-vendor apparel and gym gear marketplace with 3D product previews.',
      preferredTechnology: ['Next.js', 'Shopify Storefront API', 'Tailwind'],
      expectedFeatures: ['Vendor Portal', 'Automated Payouts', 'Stripe Connect', 'AI Product Recommendations'],
      budget: { min: 15000, max: 25000, currency: 'USD', raw: '$20,000' },
      deadline: '2 months',
      urgency: 'Medium',
      leadScore: 74,
      leadStatus: 'Warm',
      projectComplexity: 'Medium',
      estimatedBudget: '$18,000 - $22,000',
      estimatedTimeline: '6 Weeks',
      recommendedStack: ['Next.js 16', 'Stripe Connect', 'Tailwind', 'MongoDB'],
      requiredDevelopers: 2,
      aiSummary: 'Direct-to-consumer athletic brand converting to a multi-vendor marketplace.',
      pipelineStatus: 'New Lead',
      assignedTo: adminId,
      notes: 'Initial chat completed. Prospect scored 74/100. Followup email sent.',
      tags: ['Ecommerce', 'Marketplace', 'DTC'],
      source: 'AI Chat',
      createdAt: new Date(Date.now() - 1 * 86400000),
      updatedAt: new Date(),
    },
    {
      name: 'Liam O’Connor',
      email: 'liam@finflowai.io',
      phone: '+353 1 496 0123',
      company: 'FinFlow Global',
      country: 'Ireland',
      website: 'https://finflowai.example.io',
      businessType: 'Finance',
      projectType: 'SaaS',
      targetAudience: 'SME CFOs and accounting firms',
      businessGoals: 'Automated invoice factoring and cashflow forecasting engine using financial LLMs.',
      preferredTechnology: ['Next.js', 'Python', 'FastAPI', 'Plaid API'],
      expectedFeatures: ['Plaid Bank Linking', 'Automated Cashflow Forecast', 'Invoice Factoring Engine'],
      budget: { min: 40000, max: 65000, currency: 'USD', raw: '$50,000+' },
      deadline: '4 months',
      urgency: 'Critical',
      leadScore: 98,
      leadStatus: 'Hot',
      projectComplexity: 'Enterprise',
      estimatedBudget: '$50,000 - $60,000',
      estimatedTimeline: '12 Weeks',
      recommendedStack: ['Next.js 16', 'FastAPI', 'Plaid', 'PostgreSQL / MongoDB', 'OpenAI'],
      requiredDevelopers: 4,
      aiSummary: 'Exceptional enterprise opportunity with top-tier budget and clear technical specs.',
      pipelineStatus: 'Payment Received',
      assignedTo: adminId,
      notes: 'Invoice INV-00001 paid in full ($25,000 kickoff deposit). Team assigned to sprint planning.',
      tags: ['FinTech', 'High-Budget', 'Enterprise', 'Won'],
      source: 'Direct Inbound',
      createdAt: new Date(Date.now() - 20 * 86400000),
      updatedAt: new Date(),
    },
  ];

  const insertedLeads = await leadsCol.insertMany(demoLeads);
  console.log(`✓ Inserted ${insertedLeads.insertedCount} demo leads across all pipeline stages.`);

  const leadIds = Object.values(insertedLeads.insertedIds);

  // 5. Seed Proposals
  console.log('\n📄 Seeding Proposals...');
  const proposalsCol = db.collection('proposals');

  const demoProposals = [
    {
      leadId: leadIds[0],
      proposalNumber: 'PROP-00001',
      clientName: 'Sophia Laurent',
      clientEmail: 'sophia@novacarehealth.com',
      clientCompany: 'NovaCare Health',
      clientCountry: 'United States',
      executiveSummary: 'NovaCare Health AI Intake & Triage Suite to reduce patient wait times by 65% while maintaining strict HIPAA compliance.',
      businessGoals: 'Streamline patient registration, automate preliminary symptoms triage, and synchronize records seamlessly with existing hospital EHR.',
      projectScope: 'End-to-end design, development, HIPAA-compliant encryption, and hospital system deployment of the AI Triage Suite.',
      features: ['Patient Intake Chatbot', 'HIPAA Secure Storage', 'Doctor Dashboard', 'Automated Triage Routing'],
      technologyStack: ['Next.js 16', 'Python FastAPI', 'OpenAI Enterprise', 'PostgreSQL'],
      timeline: '8 Weeks (Phase 1 MVP + Phase 2 EHR Sync)',
      milestones: [
        { title: 'Architecture & HIPAA Security Compliance', duration: '2 Weeks', deliverables: ['Security Audit Plan', 'Wireframes', 'Architecture Spec'] },
        { title: 'AI Engine & Patient Intake Portal', duration: '4 Weeks', deliverables: ['Conversational AI agent', 'Frontend Portal', 'Triage Logic'] },
        { title: 'EHR Integration & Staff Training', duration: '2 Weeks', deliverables: ['EHR Connector API', 'Admin Analytics', 'Production Launch'] },
      ],
      deliverables: ['Custom AI Web App', 'Admin Dashboard', 'HIPAA Compliance Certificate', 'Full Source Code'],
      pricing: { subtotal: 35000, discount: 2000, tax: 3300, total: 36300, currency: 'USD', paymentPlan: '40% Deposit, 30% Milestone 2, 30% Launch' },
      terms: 'Net 15 payment terms. Includes 90 days of post-launch hypercare maintenance.',
      conclusion: 'We are thrilled to partner with NovaCare Health to redefine digital patient intake.',
      validUntil: new Date(Date.now() + 20 * 86400000),
      status: 'Sent',
      sentAt: new Date(Date.now() - 2 * 86400000),
      createdAt: new Date(Date.now() - 2 * 86400000),
      updatedAt: new Date(),
    },
    {
      leadId: leadIds[5],
      proposalNumber: 'PROP-00002',
      clientName: 'Liam O’Connor',
      clientEmail: 'liam@finflowai.io',
      clientCompany: 'FinFlow Global',
      clientCountry: 'Ireland',
      executiveSummary: 'FinFlow AI Cashflow Forecasting & Factoring Platform — Next-generation automated corporate finance management.',
      businessGoals: 'Provide real-time financial health scores and automated credit factoring for SMBs.',
      projectScope: 'Full stack development of the FinFlow SaaS platform, Plaid banking integration, and financial AI model fine-tuning.',
      features: ['Plaid Integration', 'Cashflow Forecasting Engine', 'Factor Approval Workflow', 'Stripe Billing'],
      technologyStack: ['Next.js 16', 'FastAPI', 'Plaid API', 'MongoDB', 'Tailwind CSS'],
      timeline: '12 Weeks',
      milestones: [
        { title: 'Core Backend & Plaid API Ingestion', duration: '4 Weeks', deliverables: ['Banking Data Ingestion', 'Auth & Security'] },
        { title: 'Financial Forecasting AI Models', duration: '4 Weeks', deliverables: ['Model Pipeline', 'Risk Scoring Algorithm'] },
        { title: 'User Dashboard & Production Launch', duration: '4 Weeks', deliverables: ['Responsive UI', 'Billing Integration', 'Deployment'] },
      ],
      deliverables: ['Production SaaS App', 'Developer Documentation', 'Cloud Infrastructure Templates'],
      pricing: { subtotal: 50000, discount: 0, tax: 5000, total: 55000, currency: 'USD', paymentPlan: '50% Upfront, 50% on Final Delivery' },
      terms: 'Standard Master Services Agreement applies. IP transferred upon final payment.',
      conclusion: 'Ready to launch FinFlow into the European FinTech space.',
      validUntil: new Date(Date.now() + 30 * 86400000),
      status: 'Accepted',
      sentAt: new Date(Date.now() - 15 * 86400000),
      respondedAt: new Date(Date.now() - 10 * 86400000),
      createdAt: new Date(Date.now() - 15 * 86400000),
      updatedAt: new Date(),
    },
  ];

  const insertedProposals = await proposalsCol.insertMany(demoProposals);
  console.log(`✓ Inserted ${insertedProposals.insertedCount} proposals.`);

  // 6. Seed Quotations
  console.log('\n📊 Seeding Quotations...');
  const quotationsCol = db.collection('quotations');

  const demoQuotations = [
    {
      leadId: leadIds[1],
      quotationNumber: 'QUO-00001',
      clientName: 'Marcus Vance',
      clientEmail: 'marcus@apexrealty.co',
      clientCompany: 'Apex Luxury Real Estate',
      clientCountry: 'United States',
      title: 'Custom Real Estate CRM & WhatsApp Automation',
      items: [
        { description: 'Custom Lead CRM Dashboard & Pipeline', quantity: 1, rate: 10000, amount: 10000 },
        { description: 'WhatsApp Business Cloud API Automated Followups', quantity: 1, rate: 4500, amount: 4500 },
        { description: 'Zillow & Meta Ads Lead Webhook Integrations', quantity: 1, rate: 3500, amount: 3500 },
        { description: 'Broker Performance Analytics & Commission Calc', quantity: 1, rate: 4000, amount: 4000 },
      ],
      subtotal: 22000,
      discountPercent: 5,
      discountAmount: 1100,
      taxPercent: 10,
      taxAmount: 2090,
      total: 22990,
      currency: 'USD',
      validUntil: new Date(Date.now() + 14 * 86400000),
      notes: 'Includes first year hosting setup and SSL certification.',
      status: 'Sent',
      sentAt: new Date(Date.now() - 3 * 86400000),
      createdAt: new Date(Date.now() - 3 * 86400000),
      updatedAt: new Date(),
    },
  ];

  const insertedQuotations = await quotationsCol.insertMany(demoQuotations);
  console.log(`✓ Inserted ${insertedQuotations.insertedCount} quotations.`);

  // 7. Seed Invoices
  console.log('\n💳 Seeding Invoices...');
  const invoicesCol = db.collection('invoices');

  const demoInvoices = [
    {
      invoiceNumber: 'INV-00001',
      leadId: leadIds[5],
      clientName: 'Liam O’Connor',
      clientEmail: 'liam@finflowai.io',
      clientCompany: 'FinFlow Global',
      clientAddress: '24 Silicon Docks, Grand Canal Quay, Dublin, Ireland',
      clientCountry: 'Ireland',
      items: [
        { description: 'Kickoff Milestone: FinFlow SaaS Platform Sprint 1 & 2', quantity: 1, rate: 25000, amount: 25000 },
        { description: 'Infrastructure Setup & Plaid API Security Audit', quantity: 1, rate: 2500, amount: 2500 },
      ],
      subtotal: 27500,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      total: 27500,
      amountPaid: 27500,
      balanceDue: 0,
      currency: 'USD',
      issueDate: new Date(Date.now() - 10 * 86400000),
      dueDate: new Date(Date.now() - 3 * 86400000),
      paidAt: new Date(Date.now() - 5 * 86400000),
      paymentTerms: 'Due upon receipt',
      status: 'Paid',
      notes: 'Paid via International Wire Transfer. Reference: WIRE-FF-98214',
      createdAt: new Date(Date.now() - 10 * 86400000),
      updatedAt: new Date(),
    },
    {
      invoiceNumber: 'INV-00002',
      leadId: leadIds[2],
      clientName: 'Elena Rostova',
      clientEmail: 'elena@solarpulse.io',
      clientCompany: 'SolarPulse Energy',
      clientAddress: '15 Canary Wharf, London, UK',
      clientCountry: 'United Kingdom',
      items: [
        { description: 'SolarPulse Phase 1: IoT Telemetry Dashboard MVP', quantity: 1, rate: 16000, amount: 16000 },
        { description: 'Predictive Weather Forecast API Integration', quantity: 1, rate: 3000, amount: 3000 },
      ],
      subtotal: 19000,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 10,
      taxAmount: 1900,
      total: 20900,
      amountPaid: 10000,
      balanceDue: 10900,
      currency: 'USD',
      issueDate: new Date(Date.now() - 5 * 86400000),
      dueDate: new Date(Date.now() + 10 * 86400000),
      paymentTerms: 'Net 15',
      status: 'Partially Paid',
      notes: 'Initial deposit received. Remaining balance due on Phase 1 signoff.',
      createdAt: new Date(Date.now() - 5 * 86400000),
      updatedAt: new Date(),
    },
  ];

  const insertedInvoices = await invoicesCol.insertMany(demoInvoices);
  console.log(`✓ Inserted ${insertedInvoices.insertedCount} invoices.`);

  // 8. Seed Contracts
  console.log('\n📜 Seeding Contracts...');
  const contractsCol = db.collection('contracts');

  const demoContracts = [
    {
      contractNumber: 'CTR-00001',
      leadId: leadIds[2],
      title: 'Master Services Agreement — SolarPulse IoT Telemetry Suite',
      clientName: 'Elena Rostova',
      clientEmail: 'elena@solarpulse.io',
      clientCompany: 'SolarPulse Energy',
      clientAddress: '15 Canary Wharf, London, UK',
      contractType: 'Fixed Price',
      totalValue: 38000,
      currency: 'USD',
      startDate: new Date(),
      endDate: new Date(Date.now() + 70 * 86400000),
      scopeOfWork: 'Design and build the SolarPulse cloud IoT analytics portal with real-time monitoring and energy yield forecasting.',
      clauses: [
        { title: 'Intellectual Property', body: 'All bespoke code and custom deliverables belong to the Client upon full payment.' },
        { title: 'Confidentiality', body: 'Both parties agree not to disclose proprietary data or business secrets.' },
        { title: 'Warranty & Maintenance', body: 'Agency provides 60 days of complimentary bug-fixing post deployment.' },
      ],
      status: 'Signed',
      signedAt: new Date(Date.now() - 4 * 86400000),
      clientSigned: true,
      agencySigned: true,
      createdAt: new Date(Date.now() - 6 * 86400000),
      updatedAt: new Date(),
    },
  ];

  const insertedContracts = await contractsCol.insertMany(demoContracts);
  console.log(`✓ Inserted ${insertedContracts.insertedCount} contracts.`);

  // 9. Seed Scheduled Meetings
  console.log('\n📅 Seeding Scheduled Meetings...');
  const meetingsCol = db.collection('meetings');

  const demoMeetings = [
    {
      leadId: leadIds[0],
      title: 'Discovery & EHR Architecture Review — NovaCare Health',
      description: 'Review hospital EHR integration points and data security parameters with Chief Medical Officer.',
      date: new Date(Date.now() + 2 * 86400000),
      startTime: '14:00',
      endTime: '15:00',
      duration: 60,
      type: 'Video Call',
      location: 'https://meet.google.com/xyz-leadai-demo',
      participants: ['sophia@novacarehealth.com', 'admin@leadaipro.com'],
      status: 'Scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      leadId: leadIds[1],
      title: 'CRM Demo & WhatsApp Automation Walkthrough',
      description: 'Present interactive click-through demo of lead distribution and automated WhatsApp messaging.',
      date: new Date(Date.now() + 4 * 86400000),
      startTime: '16:30',
      endTime: '17:15',
      duration: 45,
      type: 'Video Call',
      location: 'https://meet.google.com/crm-apex-realty',
      participants: ['marcus@apexrealty.co', 'admin@leadaipro.com'],
      status: 'Scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const insertedMeetings = await meetingsCol.insertMany(demoMeetings);
  console.log(`✓ Inserted ${insertedMeetings.insertedCount} meetings.`);

  // 10. Seed Activity Logs
  console.log('\n📋 Seeding Activity Logs...');
  const activityLogsCol = db.collection('activitylogs');

  const demoActivities = [
    {
      leadId: leadIds[0],
      action: 'proposal_sent',
      title: '📄 Proposal Sent: NovaCare AI Suite',
      description: 'Formal proposal PROP-00001 ($36,300) dispatched to sophia@novacarehealth.com',
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      leadId: leadIds[5],
      action: 'payment_received',
      title: '💰 Payment Received ($27,500)',
      description: 'Invoice INV-00001 marked as paid via Wire Transfer from FinFlow Global.',
      createdAt: new Date(Date.now() - 5 * 86400000),
    },
    {
      leadId: leadIds[2],
      action: 'contract_signed',
      title: '✍️ Contract Signed: SolarPulse MSA',
      description: 'Contract CTR-00001 signed by Elena Rostova for $38,000 USD.',
      createdAt: new Date(Date.now() - 4 * 86400000),
    },
    {
      leadId: leadIds[3],
      action: 'lead_qualified',
      title: '🎯 Lead Scored & Qualified',
      description: 'GourmetFleet Cloud Kitchens scored 78/100 by AI Analysis engine.',
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
  ];

  await activityLogsCol.insertMany(demoActivities);
  console.log('✓ Inserted demo activity logs.');

  // 11. Seed Notifications
  console.log('\n🔔 Seeding Notifications...');
  const notificationsCol = db.collection('notifications');

  const demoNotifications = [
    {
      type: 'payment',
      title: '💰 Payment Received ($27,500.00)',
      message: 'FinFlow Global has completed payment for Invoice INV-00001.',
      link: '/invoices',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 3600000),
    },
    {
      type: 'lead',
      title: '🔥 New High-Scoring Lead (94/100)',
      message: 'Sophia Laurent from NovaCare Health submitted a request for an AI Solution.',
      link: `/leads/${leadIds[0]}`,
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 3600000),
    },
    {
      type: 'meeting',
      title: '📅 Upcoming Meeting Reminder',
      message: 'Discovery call with NovaCare Health scheduled in 2 days.',
      link: '/meetings',
      isRead: true,
      createdAt: new Date(Date.now() - 10 * 3600000),
    },
  ];

  await notificationsCol.insertMany(demoNotifications);
  console.log('✓ Inserted demo notifications.');

  console.log('\n======================================================');
  console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('Admin Credentials:');
  console.log('  Email:    admin@leadaipro.com');
  console.log('  Password: admin123456');
  console.log('======================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌ Seed failed with error:', err);
  process.exit(1);
});
