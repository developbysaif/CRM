import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import Lead from '@/models/Lead';
import ActivityLog from '@/models/ActivityLog';
import Notification from '@/models/Notification';
import { GooglePlacesProvider } from './google-places.provider';
import { ApifyProvider } from './apify.provider';
import { checkLeadDuplicate } from './dedup.service';
import { calculateLeadScore, explainLeadValue } from '../scoring/lead-scoring.service';
import { auditWebsite } from '../audit/website-audit.service';

/**
 * Executes full Lead Discovery workflow:
 * 1. Provider resolution (Google Places or Apify)
 * 2. Search query execution
 * 3. Normalization
 * 4. Multi-key duplicate check (email, phone, domain, Google Place ID, company+address)
 * 5. Enrichment & Website Audit
 * 6. 0-100 Lead Scoring & "Why is this lead valuable?"
 * 7. Saving to CRM database
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
      // If Google key not set, try Apify as configured provider fallback
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

  // 1. Search raw results from provider
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

  for (const candidate of rawResults) {
    // 2. Strict Deduplication Check
    const dedup = await checkLeadDuplicate(candidate, organizationId);
    if (dedup.isDuplicate) {
      duplicatesFound++;
      continue;
    }

    // 3. Optional Website Audit / SEO enrichment if website exists
    let auditData = null;
    if (candidate.website) {
      try {
        auditData = await auditWebsite(candidate.website, { shallow: true, organizationId });
        if (auditData) {
          candidate.seoScore = auditData.seo?.score || null;
          candidate.performanceScore = auditData.performance?.score || null;
          candidate.mobileScore = auditData.mobile?.score || null;
          candidate.accessibilityScore = auditData.accessibility?.score || null;
          candidate.securityScore = auditData.security?.score || null;
          candidate.websiteTechnology = auditData.techStack || [];
        }
      } catch (auditErr) {
        console.warn('Website enrichment note:', auditErr.message);
      }
    }

    // 4. Calculate 0 - 100 Lead Score
    const scoreResult = await calculateLeadScore(candidate, settings.scoringWeights);
    candidate.leadScore = scoreResult.score;
    candidate.leadStatus = scoreResult.status;

    // 5. Generate AI Explanation: "Why is this lead valuable?"
    const valueAnalysis = await explainLeadValue(candidate, scoreResult);
    candidate.whyValuable = valueAnalysis.whyValuable;
    candidate.nextAction = valueAnalysis.nextAction;
    candidate.recommendedService = valueAnalysis.recommendedService;

    // 6. Save to Database
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
      whyValuable: candidate.whyValuable,
      nextAction: candidate.nextAction,
      recommendedService: candidate.recommendedService,
      pipelineStatus: 'New Lead',
      source: candidate.source || `${leadProviderInstance.name} Discovery`,
    });

    if (newLead.leadStatus === 'Hot') {
      hotLeadsCount++;
    }

    await ActivityLog.create({
      organizationId,
      leadId: newLead._id,
      action: 'lead_created',
      title: `🎯 Lead Discovered: ${newLead.companyName}`,
      description: `Discovered in "${industry} in ${location}" with AI Score ${newLead.leadScore}/100 (${newLead.leadStatus}). ${newLead.whyValuable}`,
    });

    savedLeads.push(newLead);
  }

  // Record batch notification
  if (savedLeads.length > 0) {
    await Notification.create({
      organizationId,
      type: 'general',
      title: `⚡ Lead Discovery Completed: ${savedLeads.length} leads saved`,
      message: `Discovered for "${industry} in ${location}" (${hotLeadsCount} Hot Leads, ${duplicatesFound} duplicates filtered).`,
      link: '/leads',
    });
  }

  return {
    providerUsed: leadProviderInstance.name,
    totalDiscovered: rawResults.length,
    savedCount: savedLeads.length,
    duplicatesDetected: duplicatesFound,
    hotLeadsCount,
    leads: savedLeads,
  };
}
