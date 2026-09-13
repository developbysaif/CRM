import { apiSuccess, apiError } from '@/lib/api';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      projectType = 'Website',
      businessType = 'Ecommerce',
      features = [],
      platform = 'Web',
      designTier = 'Premium',
      urgency = 'Standard',
      integrations = [],
    } = body;

    // Base calculation weights
    const baseHoursByType = {
      'Website': 60,
      'Mobile App': 140,
      'AI Solution': 160,
      'CRM': 180,
      'ERP': 260,
      'Dashboard': 90,
      'Marketplace': 200,
      'SaaS': 220,
      'Booking System': 110,
      'Custom Software': 200,
    };

    const baseCostByPlatform = {
      'Web': 1.0,
      'iOS & Android': 1.6,
      'Web + Mobile App': 1.8,
      'Cross-Platform (React Native)': 1.4,
    };

    const featureHoursMap = {
      'Payment Gateway': 24,
      'Admin Dashboard': 36,
      'User Authentication (JWT/OAuth)': 18,
      'CMS & Blog Engine': 28,
      'Booking & Scheduling': 32,
      'Inventory Management': 40,
      'Advanced Reports & Analytics': 30,
      'AI Chatbot & Automation': 45,
      'Multi-tenant Architecture': 50,
      'Realtime Notifications & Sockets': 22,
      'Third-Party API Integrations': 26,
      'SEO & Performance Optimization': 16,
    };

    let totalHours = baseHoursByType[projectType] || 80;

    features.forEach((feat) => {
      totalHours += featureHoursMap[feat] || 20;
    });

    integrations.forEach(() => {
      totalHours += 15;
    });

    // Multipliers
    const platformMultiplier = baseCostByPlatform[platform] || 1.0;
    const urgencyMultiplier = urgency === 'Urgent (2-4 wks)' ? 1.3 : urgency === 'Express (1-2 wks)' ? 1.5 : 1.0;
    const designMultiplier = designTier === 'Bespoke Enterprise 3D/Motion' ? 1.25 : designTier === 'Premium Custom' ? 1.1 : 1.0;

    const adjustedHours = Math.round(totalHours * platformMultiplier * designMultiplier);
    const hourlyRate = 65; // Blended agency rate $/hr

    const baseTotal = adjustedHours * hourlyRate * urgencyMultiplier;
    const minBudget = Math.round((baseTotal * 0.85) / 500) * 500;
    const maxBudget = Math.round((baseTotal * 1.2) / 500) * 500;

    // Team and timeline recommendations
    let devCount = 1;
    let weeks = Math.ceil(adjustedHours / 40);

    if (adjustedHours > 200) {
      devCount = 3;
      weeks = Math.ceil(adjustedHours / 100);
    } else if (adjustedHours > 100) {
      devCount = 2;
      weeks = Math.ceil(adjustedHours / 60);
    }

    const recommendedStack = [
      'Next.js 15 (App Router)',
      'TypeScript',
      'Tailwind CSS',
      'Node.js & Express',
      'MongoDB & Mongoose',
      'Redis Caching',
      'Stripe Payments',
      'Docker & AWS',
      'OpenAI API Integration',
    ];

    const milestones = [
      { name: 'Phase 1: Discovery, UX/UI Design & System Architecture', duration: '1-2 weeks', percentage: '25%' },
      { name: 'Phase 2: Core Engineering, Database & API Development', duration: `${Math.max(2, Math.floor(weeks / 2))} weeks`, percentage: '45%' },
      { name: 'Phase 3: QA, Security Audit, Cloud Deployment & Handover', duration: '1-2 weeks', percentage: '30%' },
    ];

    return apiSuccess({
      projectType,
      businessType,
      platform,
      totalHours: adjustedHours,
      minBudget,
      maxBudget,
      currency: 'USD',
      estimatedBudgetFormatted: `$${minBudget.toLocaleString()} - $${maxBudget.toLocaleString()}`,
      estimatedTimeline: `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`,
      requiredDevelopers: devCount,
      teamStructure: `${devCount} Full Stack Engineer${devCount > 1 ? 's' : ''} + 1 UI/UX Specialist + 1 QA Engineer`,
      recommendedStack,
      milestones,
      featuresIncluded: features,
    });
  } catch (error) {
    return apiError('Failed to calculate estimate: ' + error.message, 500);
  }
}
