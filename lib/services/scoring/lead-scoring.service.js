import OpenAI from 'openai';
import Settings from '@/models/Settings';

/**
 * Calculates a lead score from 0 to 100 based on digital footprint and signals
 *
 * Configurable weights:
 * - Website missing: +25
 * - Poor website / low tech: +20
 * - Poor mobile experience: +10
 * - Poor SEO score: +10
 * - Low performance score: +10
 * - High review count (>= 20 reviews): +5
 * - Strong business category: +5
 * - Public email available: +5
 * - Phone available: +5
 * - Strong buying signal / urgency: +5
 */
export async function calculateLeadScore(lead, customWeights = null) {
  let weights = {
    websiteMissingWeight: 25,
    poorWebsiteWeight: 20,
    poorMobileWeight: 10,
    poorSeoWeight: 10,
    lowPerformanceWeight: 10,
    highReviewCountWeight: 5,
    strongCategoryWeight: 5,
    publicEmailWeight: 5,
    phoneAvailableWeight: 5,
    buyingSignalWeight: 5,
  };

  if (customWeights) {
    weights = { ...weights, ...customWeights };
  } else {
    try {
      const settings = await Settings.findOne();
      if (settings?.scoringWeights) {
        weights = { ...weights, ...settings.scoringWeights };
      }
    } catch {}
  }

  let score = 0;
  const breakdown = [];

  // 1. Website Missing vs Poor Website
  if (!lead.website || lead.websiteStatus === 'Missing') {
    score += weights.websiteMissingWeight;
    breakdown.push(`No website detected (+${weights.websiteMissingWeight})`);
  } else if (lead.websiteStatus === 'Outdated' || lead.websiteStatus === 'Error' || (lead.seoScore && lead.seoScore < 50)) {
    score += weights.poorWebsiteWeight;
    breakdown.push(`Outdated or underperforming website (+${weights.poorWebsiteWeight})`);
  }

  // 2. Mobile Score
  if (lead.mobileScore !== null && lead.mobileScore !== undefined) {
    if (lead.mobileScore < 60) {
      score += weights.poorMobileWeight;
      breakdown.push(`Subpar mobile responsiveness (${lead.mobileScore}/100) (+${weights.poorMobileWeight})`);
    }
  } else if (!lead.website) {
    // If no website, mobile absence is also a major need
    score += weights.poorMobileWeight;
  }

  // 3. SEO Score
  if (lead.seoScore !== null && lead.seoScore !== undefined) {
    if (lead.seoScore < 60) {
      score += weights.poorSeoWeight;
      breakdown.push(`Weak SEO architecture (${lead.seoScore}/100) (+${weights.poorSeoWeight})`);
    }
  } else if (!lead.website) {
    score += weights.poorSeoWeight;
    breakdown.push(`Zero organic search footprint (+${weights.poorSeoWeight})`);
  }

  // 4. Performance Score
  if (lead.performanceScore !== null && lead.performanceScore !== undefined) {
    if (lead.performanceScore < 60) {
      score += weights.lowPerformanceWeight;
      breakdown.push(`Low Core Web Vitals performance (+${weights.lowPerformanceWeight})`);
    }
  }

  // 5. High Review Count (Proof of active real-world business & revenue)
  if (lead.reviewCount && lead.reviewCount >= 15) {
    score += weights.highReviewCountWeight;
    breakdown.push(`High customer review volume (${lead.reviewCount} reviews) (+${weights.highReviewCountWeight})`);
  }

  // 6. Strong Business Category
  const highValueIndustries = ['restaurant', 'dental', 'law', 'real estate', 'healthcare', 'ecommerce', 'construction', 'hotel', 'saas', 'clinic'];
  const ind = (lead.industry || lead.category || lead.businessType || '').toLowerCase();
  if (highValueIndustries.some((i) => ind.includes(i))) {
    score += weights.strongCategoryWeight;
    breakdown.push(`High-ticket commercial sector (${lead.industry || lead.businessType}) (+${weights.strongCategoryWeight})`);
  }

  // 7. Public Contact Availability
  if (lead.email) {
    score += weights.publicEmailWeight;
    breakdown.push(`Verified email reachable (+${weights.publicEmailWeight})`);
  }
  if (lead.phone) {
    score += weights.phoneAvailableWeight;
    breakdown.push(`Verified direct telephone reachable (+${weights.phoneAvailableWeight})`);
  }

  // 8. Commercial Buying Signals
  if (lead.rating && lead.rating >= 4.0 && (!lead.website || (lead.seoScore && lead.seoScore < 60))) {
    score += weights.buyingSignalWeight;
    breakdown.push(`High reputation rating (${lead.rating}★) with underdeveloped digital presence (+${weights.buyingSignalWeight})`);
  }

  // Clamp 0 - 100
  const finalScore = Math.min(Math.max(score, 10), 100);

  // Status mapping
  let leadStatus = 'Cold';
  if (finalScore >= 80) leadStatus = 'Hot';
  else if (finalScore >= 60) leadStatus = 'Warm';

  return {
    score: finalScore,
    status: leadStatus,
    breakdown,
  };
}

/**
 * Generates an AI explanation: "Why is this lead valuable?"
 */
export async function explainLeadValue(lead, scoreData) {
  const company = lead.companyName || lead.company || lead.name;
  const ind = lead.industry || lead.category || 'local business';
  const hasSite = Boolean(lead.website);

  // Build prompt context
  const context = `Company: ${company}
Industry: ${ind}
Location: ${lead.city || lead.address || lead.country || 'N/A'}
Google Rating: ${lead.rating || 'N/A'} (${lead.reviewCount || 0} reviews)
Has Website: ${hasSite ? lead.website : 'NO WEBSITE'}
SEO Score: ${lead.seoScore || 'N/A'}
Mobile Score: ${lead.mobileScore || 'N/A'}
Contact: Phone: ${lead.phone || 'None'}, Email: ${lead.email || 'None'}
Score: ${scoreData.score}/100 (${scoreData.status})
Score factors: ${scoreData.breakdown.join('; ')}`;

  let explanation = '';
  let nextAction = hasSite ? 'Send audit-backed modernizing proposal' : 'Pitch turnkey modern website & Google Maps sync';
  let recommendedService = hasSite ? 'Website Redesign & SEO Growth' : 'Turnkey Next.js Website & Online Ordering/Booking';

  let apiKey = process.env.OPENAI_API_KEY;
  try {
    const settings = await Settings.findOne();
    if (settings?.openaiApiKey) apiKey = settings.openaiApiKey;
  } catch {}

  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a senior B2B sales strategist. Analyze this lead and explain in 2 concise sentences why this lead is valuable to an agency and what specific service should be pitched.',
          },
          { role: 'user', content: context },
        ],
        max_tokens: 150,
        temperature: 0.3,
      });
      explanation = completion.choices[0]?.message?.content?.trim() || '';
    } catch (err) {
      console.warn('OpenAI explanation notice:', err.message);
    }
  }

  if (!explanation) {
    if (!hasSite) {
      explanation = `${company} has an active real-world presence (${lead.reviewCount ? `${lead.reviewCount} customer reviews` : 'verified profile'}) but lacks a dedicated website, representing an immediate high-probability opportunity for turnkey digital presence.`;
      nextAction = 'Reach out with turnkey website showcase tailored to their niche';
      recommendedService = 'Turnkey Next.js Web Presence & Google Sync';
    } else {
      explanation = `${company} maintains established operations with a ${lead.rating ? `${lead.rating}★ rating` : 'commercial footprint'}, but their digital stack has performance and conversion gaps that modern software will dramatically improve.`;
      nextAction = 'Send website performance benchmark report and redesign proposal';
      recommendedService = 'Full-Stack Redesign & SEO Conversion Optimization';
    }
  }

  return {
    whyValuable: explanation,
    nextAction,
    recommendedService,
  };
}
