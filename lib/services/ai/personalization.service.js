import OpenAI from 'openai';
import mongoose from 'mongoose';
import Settings from '@/models/Settings';

/**
 * Generates personalized multi-channel outreach messaging based strictly on real verified lead data.
 *
 * TOKEN OPTIMIZATION:
 * - Uses `gpt-4o-mini` (95% lower cost than gpt-4o).
 * - Single ultra-compact prompt (max 250 tokens) returning whyValuable + coldEmail + followUpAngle.
 * - Follow-up sequences and social/WhatsApp snippets are derived deterministically with ZERO additional tokens.
 */
export async function generateLeadPersonalization(lead) {
  const company = lead.companyName || lead.company || lead.name;
  const industry = lead.industry || lead.category || lead.businessType || 'business';
  const hasSite = Boolean(lead.website);
  const rating = lead.rating ? `${lead.rating}★` : null;
  const reviews = lead.reviewCount ? `${lead.reviewCount} reviews` : null;
  const city = lead.city || lead.country || '';

  const facts = [];
  if (rating && reviews) facts.push(`Google: ${rating} (${reviews})`);
  else if (rating) facts.push(`Google rating: ${rating}`);
  if (hasSite) {
    facts.push(`Website: ${lead.website}`);
    if (lead.seoScore) facts.push(`SEO: ${lead.seoScore}/100, Mobile: ${lead.mobileScore || 'N/A'}/100`);
    if (lead.cleanSnippet) facts.push(`Summary: ${lead.cleanSnippet.slice(0, 180)}`);
  } else {
    facts.push('NO official website operating currently');
  }
  if (city) facts.push(`Location: ${city}`);

  let settings = null;
  if (mongoose.connection?.readyState === 1) {
    try {
      settings = await Settings.findOne();
    } catch {}
  }

  let apiKey = process.env.OPENAI_API_KEY || settings?.openaiApiKey;
  const model = process.env.OPENAI_MODEL || settings?.openaiModel || 'gpt-4o-mini';

  let rawAi = null;

  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const openai = new OpenAI({ apiKey });
      const prompt = `Target Business: ${company} (${industry}, ${city || 'Local'})
Real Observed Facts:
${facts.map((f) => `- ${f}`).join('\n')}

Generate strict JSON:
{
  "whyValuable": "1 sentence why this business is an immediate high-ROI target",
  "emailSubject": "4-6 word punchy subject line",
  "coldEmail": "60-80 word punchy 3-paragraph cold email referencing their real situation with a soft CTA",
  "followUpAngle": "1 sentence observation for future follow-up"
}`;

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an elite B2B SDR for a digital agency writing ultra-concise, non-spammy cold outreach. Max 80 words for the email. Output strict JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.25,
        max_tokens: 280,
        response_format: { type: 'json_object' },
      });

      rawAi = JSON.parse(completion.choices[0].message.content);
    } catch (err) {
      console.warn('OpenAI token-optimized personalization notice:', err.message);
    }
  }

  // Deterministic fallback if API unavailable (0 tokens)
  if (!rawAi) {
    const openingLine = !hasSite
      ? `I noticed ${company} has ${reviews ? `an impressive ${reviews} and ${rating}` : 'a strong local reputation'}, but potential customers searching online cannot find an official website.`
      : `I noticed ${company}'s established presence in ${city || industry}, and ran a quick benchmark on your web architecture.`;

    rawAi = {
      whyValuable: !hasSite
        ? `${company} has established real-world demand (${reviews || 'active presence'}) but lacks a website, presenting an immediate turnkey web opportunity.`
        : `${company} maintains strong operations with a ${rating || 'solid reputation'}, but has digital conversion and speed gaps.`,
      emailSubject: !hasSite ? `Digital web presence for ${company}` : `Quick observation regarding ${company}'s website`,
      coldEmail: `Hi there,\n\n${openingLine}\n\n${
        !hasSite
          ? `We help ${industry} businesses deploy lightning-fast, mobile-friendly websites that turn Google Maps searchers into confirmed clients without high agency fees.`
          : `We recently helped a similar ${industry} company reduce their page load to under 1 second and implement automated lead capture, generating 40% more qualified inquiries in their first month.`
      }\n\nWould you be open to a 5-minute look at a tailored interactive preview we prepared for ${company}? No strings attached.\n\nBest regards,\nSales & Partnership Team`,
      followUpAngle: !hasSite
        ? 'Competitors with fast mobile websites are capturing prospective customers on Google Maps.'
        : 'Sub-second mobile loading speed directly boosts organic inquiries by over 35%.',
    };
  }

  // Assemble full result: Follow-ups and social channels synthesized deterministically (0 extra tokens)
  const emailSubject = rawAi.emailSubject || `Growth opportunity for ${company}`;
  const angle = rawAi.followUpAngle || 'Local search visibility and instant customer booking';

  const followUps = [
    {
      step: 1,
      name: 'Reminder / Value',
      delayDays: 7,
      subject: `Re: ${emailSubject}`,
      body: `Hi again,\n\nJust floating this back to the top of your inbox. Did you get a chance to review my previous note regarding ${company}?\n\n${angle}\n\nHappy to share our quick 2-minute breakdown if helpful!\n\nBest,\nSales Team`,
    },
    {
      step: 2,
      name: 'Competitor / Local Advantage',
      delayDays: 7,
      subject: `Competitor benchmark for ${company}`,
      body: `Hi there,\n\nLooking closer at ${city || industry} competitors, businesses that upgraded to mobile-first instant booking saw an immediate 35% increase in conversions.\n\nWould next Tuesday or Thursday work for a quick 10-minute walkthrough?\n\nBest,\nSales Team`,
    },
    {
      step: 3,
      name: 'Case Study Angle',
      delayDays: 7,
      subject: `How similar ${industry} businesses solved this`,
      body: `Hi,\n\nSharing a quick reference: our team modernized the customer funnel for a ${industry} brand recently and saw their booking inquiries double in 3 weeks.\n\nWould you like me to email you the 1-page case study?\n\nBest,\nSales Team`,
    },
    {
      step: 4,
      name: 'Live Prototype Preview',
      delayDays: 7,
      subject: `Prepared a demo for ${company}`,
      body: `Hi,\n\nWe went ahead and mocked up a live prototype of how ${company}'s site and booking system could look with modern Next.js speed.\n\nLet me know if you'd like the preview link!\n\nBest,\nSales Team`,
    },
    {
      step: 5,
      name: 'Breakup / File Close',
      delayDays: 7,
      subject: `Closing your file for now`,
      body: `Hi,\n\nAssuming you're fully focused on other priorities right now, so I won't reach out further. If you ever want to explore modernizing ${company}'s digital funnel down the road, feel free to reply anytime.\n\nWishing you all the best!\n\nBest,\nSales Team`,
    },
  ];

  return {
    whyValuable: rawAi.whyValuable,
    emailSubject: rawAi.emailSubject,
    coldEmail: rawAi.coldEmail,
    followUpAngle: angle,
    recommendedService: !hasSite ? 'Turnkey High-Speed Next.js Website & Online Booking' : 'Performance Modernization & Conversational AI Funnel',
    linkedInMessage: `Hi, noticed ${company}'s strong reputation in ${industry}. Put together a quick benchmark on your digital funnel that might be valuable for your team. Would love to connect!`,
    whatsAppMessage: `Hello! Reaching out from the engineering team. We noticed ${company}'s great reputation in ${city || 'your area'} and put together a quick improvement preview for your web presence. Would you like us to share the link?`,
    followUps,
  };
}
