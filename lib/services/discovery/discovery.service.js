import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import Lead from '@/models/Lead';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import { GooglePlacesProvider } from './google-places.provider';
import { ApifyProvider } from './apify.provider';
import { checkLeadDuplicate } from './dedup.service';
import { calculateLeadScore } from '../scoring/lead-scoring.service';
import { scrapeWebsiteForLead } from '../scraping/firecrawl.service';
import { verifyLeadData } from '../verification/lead-verification.service';
import { generateLeadPersonalization } from '../ai/personalization.service';
import { enqueueForApproval } from '../approvals/approval.service';

/**
 * Executes full Lead Discovery & Token-Optimized Processing Workflow:
 *
 * USER (Category + Location)
 *   -> Apify / Google Places (Google Maps Data)
 *   -> Lead Processing:
 *        Track A: Website -> Firecrawl / Apify (Pruned <150 words summary, SSL, Mobile)
 *        Track B: Phone/Email -> Verification (DNS MX, disposable check, phone check)
 *   -> MongoDB (Persist enriched lead)
 *   -> OpenAI (Token-optimized single call: Lead Score Explanation + Cold Email)
 *   -> User Approval (Enqueued into ApprovalQueue for human review before sending)
 */
export async function executeLeadDiscovery({
  provider = 'google', // 'google' | 'apify'
  query = '',
  industry = 'Restaurant',
  location = 'London, UK',
  quantity = 15,
  filters = {},
  organizationId = 'org_default',
}) {
  await connectDB();
  const settings = (await Settings.findOne({ organizationId })) || (await Settings.findOne()) || {};

  let leadProviderInstance;
  if (provider === 'google' || provider === 'google_places') {
    const googleKey = process.env.GOOGLE_MAPS_API_KEY || settings.googlePlacesApiKey;
    if (!googleKey) {
      const apifyToken = process.env.APIFY_API_TOKEN || settings.apifyApiToken;
      if (apifyToken) {
        leadProviderInstance = new ApifyProvider(apifyToken, settings.apifyDefaultActor || 'compass/crawler-google-places');
      } else {
        throw new Error('Neither Google Places API Key nor Apify Token are configured. Please enter API credentials in Settings.');
      }
    } else {
      leadProviderInstance = new GooglePlacesProvider(googleKey);
    }
  } else {
    const apifyToken = process.env.APIFY_API_TOKEN || settings.apifyApiToken;
    if (!apifyToken) {
      throw new Error('Apify API token is not configured. Please enter APIFY_API_TOKEN in Settings or .env.local');
    }
    leadProviderInstance = new ApifyProvider(apifyToken, settings.apifyDefaultActor || 'compass/crawler-google-places');
  }

  // 1. Apify / Google Places: Fetch Google Maps Data
  const rawResults = await leadProviderInstance.searchLeads({
    query,
    industry,
    location,
    quantity: Math.min(Number(quantity) || 15, 50),
    filters,
  });

  const savedLeads = [];
  let duplicatesFound = 0;
  let hotLeadsCount = 0;
  let queuedOutreachCount = 0;

  for (const candidate of rawResults) {
    // 2. Multi-key deduplication (0 tokens)
    const dedup = await checkLeadDuplicate(candidate, organizationId);
    if (dedup.isDuplicate) {
      duplicatesFound++;
      continue;
    }

    // 3. Lead Processing: Parallel Track A (Website Scrape) & Track B (Phone/Email Verification)
    let websiteIntelligence = null;
    let verificationResult = null;

    const [siteRes, verifyRes] = await Promise.allSettled([
      candidate.website
        ? scrapeWebsiteForLead(candidate.website, { organizationId })
        : Promise.resolve(null),
      (candidate.email || candidate.phone)
        ? verifyLeadData(candidate)
        : Promise.resolve(null),
    ]);

    if (siteRes.status === 'fulfilled' && siteRes.value) {
      websiteIntelligence = siteRes.value;
      candidate.seoScore = websiteIntelligence.seoScore;
      candidate.performanceScore = websiteIntelligence.performanceScore;
      candidate.mobileScore = websiteIntelligence.mobileScore;
      candidate.cleanSnippet = websiteIntelligence.cleanSnippet;
    }

    if (verifyRes.status === 'fulfilled' && verifyRes.value) {
      verificationResult = verifyRes.value;
    } else {
      verificationResult = { status: 'unverified', details: 'No email or phone to verify' };
    }

    // 4. Deterministic Lead Scoring (0-100) (0 tokens)
    const scoreResult = await calculateLeadScore(candidate, settings.scoringWeights);
    candidate.leadScore = scoreResult.score;
    candidate.leadStatus = scoreResult.status;

    // 5. Save Enriched Lead to MongoDB
    const newLead = await Lead.create({
      organizationId,
      name: candidate.name,
      companyName: candidate.companyName || candidate.company,
      company: candidate.company || candidate.companyName,
      email: candidate.email || null,
      phone: candidate.phone || null,
      website: candidate.website || null,
      domain: candidate.domain || null,
      address: candidate.address || null,
      city: candidate.city || location,
      country: candidate.country || '',
      location: candidate.location || { lat: null, lng: null },
      googlePlaceId: candidate.googlePlaceId || null,
      googleMapsUrl: candidate.googleMapsUrl || null,
      rating: candidate.rating || null,
      reviewCount: candidate.reviewCount || null,
      category: candidate.category || null,
      industry: candidate.industry || industry,
      businessType: candidate.industry || 'Other',
      projectType: 'Website',
      websiteStatus: candidate.websiteStatus || (candidate.website ? 'Active' : 'Missing'),
      websiteTechnology: candidate.websiteTechnology || [],
      seoScore: candidate.seoScore || null,
      performanceScore: candidate.performanceScore || null,
      mobileScore: candidate.mobileScore || null,
      accessibilityScore: candidate.accessibilityScore || null,
      securityScore: candidate.securityScore || null,
      leadScore: candidate.leadScore,
      leadStatus: candidate.leadStatus,
      verification: verificationResult,
      pipelineStatus: 'New Lead',
      source: candidate.source || `${leadProviderInstance.name} Discovery`,
    });

    // 6. OpenAI: Token-Optimized Single Call (Personalized Email + Value Explanation)
    try {
      const outreach = await generateLeadPersonalization({
        ...candidate,
        _id: newLead._id,
        cleanSnippet: candidate.cleanSnippet,
      });

      newLead.whyValuable = outreach.whyValuable;
      newLead.recommendedService = outreach.recommendedService;
      newLead.personalizedEmail = {
        subject: outreach.emailSubject,
        body: outreach.coldEmail,
        angle: outreach.followUpAngle,
        generatedAt: new Date(),
      };
      await newLead.save();

      // 7. User Approval Queue: Enqueue cold email for human review before sending
      if (newLead.email) {
        await enqueueForApproval({
          organizationId,
          type: 'message',
          leadId: newLead._id,
          title: `Cold Outreach: ${newLead.companyName}`,
          recipient: newLead.email,
          channel: 'email',
          subject: outreach.emailSubject,
          content: outreach.coldEmail,
          aiReasoning: outreach.whyValuable,
          payload: {
            followUps: outreach.followUps || [],
          },
          status: 'approval_required',
        });
        queuedOutreachCount++;
      }
    } catch (aiErr) {
      console.warn('Personalization and approval enqueue note:', aiErr.message);
    }

    if (newLead.leadStatus === 'Hot') {
      hotLeadsCount++;
    }

    await ActivityLog.create({
      organizationId,
      leadId: newLead._id,
      action: 'lead_created',
      title: `🎯 Lead Discovered: ${newLead.companyName}`,
      description: `Discovered in "${industry} in ${location}" (AI Score: ${newLead.leadScore}/100 [${newLead.leadStatus}] | Verification: ${newLead.verification?.status || 'unverified'}). Cold draft staged in Approval Center.`,
    });

    savedLeads.push(newLead);
  }

  // Record batch notification
  if (savedLeads.length > 0) {
    await Notification.create({
      organizationId,
      type: 'general',
      title: `⚡ Lead Discovery Completed: ${savedLeads.length} leads saved`,
      message: `Discovered for "${industry} in ${location}" (${hotLeadsCount} Hot Leads, ${queuedOutreachCount} cold outreach drafts queued in Approval Center).`,
      link: '/approvals',
    });
  }

  return {
    providerUsed: leadProviderInstance.name,
    totalDiscovered: rawResults.length,
    savedCount: savedLeads.length,
    duplicatesDetected: duplicatesFound,
    hotLeadsCount,
    queuedOutreachCount,
    leads: savedLeads,
  };
}
