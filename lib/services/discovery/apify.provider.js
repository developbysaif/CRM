import { LeadProvider } from './lead-provider.interface';
import { runActorSync } from '@/lib/services/apify/apify.client';

export class ApifyProvider extends LeadProvider {
  constructor(apiToken, actorId = 'compass/crawler-google-places') {
    super('ApifyProvider');
    this.apiToken = apiToken;
    this.actorId = actorId;
  }

  /**
   * Search leads using Apify Crawler Actor
   */
  async searchLeads({ query, industry, location, quantity = 20, filters = {} }) {
    if (!this.apiToken) {
      throw new Error('Apify API token is not configured. Please add APIFY_API_TOKEN in Settings or .env.local');
    }

    const searchQuery = query || `${industry || 'business'} in ${location || 'London, UK'}`;
    const searchLimit = Math.min(Math.max(Number(quantity) || 10, 1), 50);

    const actorInput = {
      searchStringsArray: [searchQuery],
      maxCrawledPlacesPerSearch: searchLimit,
      language: 'en',
    };

    const result = await runActorSync(this.actorId, actorInput, { maxWaitSec: 60 });
    const items = result.items || [];

    const normalizedLeads = [];
    for (const item of items) {
      const normalized = this.normalizeLead({ ...item, _searchIndustry: industry, _searchLocation: location });

      // Apply in-flight filters
      if (filters.websiteRequired && !normalized.website) continue;
      if (filters.noWebsite && normalized.website) continue;
      if (filters.minRating && normalized.rating && normalized.rating < filters.minRating) continue;
      if (filters.maxRating && normalized.rating && normalized.rating > filters.maxRating) continue;
      if (filters.hasEmail && !normalized.email) continue;
      if (filters.hasPhone && !normalized.phone) continue;

      normalizedLeads.push(normalized);
    }

    return normalizedLeads;
  }

  normalizeLead(raw) {
    const rawWebsite = raw.website || raw.url || null;
    let domain = null;
    if (rawWebsite) {
      try {
        const urlObj = new URL(rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite}`);
        domain = urlObj.hostname.replace(/^www\./, '');
      } catch {}
    }

    return {
      name: raw.title || raw.name || 'Business Prospect',
      companyName: raw.title || raw.name || 'Business Prospect',
      company: raw.title || raw.name || 'Business Prospect',
      email: raw.email || null, // Real email only, null if missing (no fake @domain emails)
      phone: raw.phone || raw.internationalPhoneNumber || null,
      website: rawWebsite,
      domain,
      address: raw.address || raw.formattedAddress || null,
      city: raw._searchLocation || null,
      country: raw.countryCode || null,
      location: {
        lat: raw.location?.lat || raw.lat || null,
        lng: raw.location?.lng || raw.lng || null,
      },
      googlePlaceId: raw.placeId || raw.googlePlaceId || null,
      googleMapsUrl: raw.urlGoogleMaps || raw.googleMapsUrl || null,
      rating: typeof raw.totalScore === 'number' ? raw.totalScore : typeof raw.rating === 'number' ? raw.rating : null,
      reviewCount: typeof raw.reviewsCount === 'number' ? raw.reviewsCount : typeof raw.reviewCount === 'number' ? raw.reviewCount : null,
      category: raw.categoryName || raw.category || null,
      industry: raw._searchIndustry || 'General',
      websiteStatus: rawWebsite ? 'Active' : 'Missing',
      source: 'Apify Crawler (Google Places)',
    };
  }
}
