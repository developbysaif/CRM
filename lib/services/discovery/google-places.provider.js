import { LeadProvider } from './lead-provider.interface';

export class GooglePlacesProvider extends LeadProvider {
  constructor(apiKey) {
    super('GooglePlacesProvider');
    this.apiKey = apiKey;
  }

  /**
   * Search Google Places API using Text Search & Place Details
   */
  async searchLeads({ query, industry, location, quantity = 20, filters = {} }) {
    if (!this.apiKey) {
      throw new Error('Google Places API key is not configured. Please add GOOGLE_MAPS_API_KEY in Settings or .env.local');
    }

    const searchQuery = query || `${industry || 'business'} in ${location || 'London, UK'}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${this.apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Places API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.error_message || data.status}`);
    }

    const results = (data.results || []).slice(0, quantity);
    const enrichedLeads = [];

    // Fetch Place Details for each place to get phone, website, Google Maps URL
    for (const place of results) {
      try {
        let details = {};
        if (place.place_id) {
          const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,types,geometry,url&key=${this.apiKey}`;
          const detailRes = await fetch(detailUrl);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData.status === 'OK' && detailData.result) {
              details = detailData.result;
            }
          }
        }

        const normalized = this.normalizeLead({ ...place, ...details, _searchIndustry: industry, _searchLocation: location });

        // Apply in-flight filters if requested
        if (filters.websiteRequired && !normalized.website) continue;
        if (filters.noWebsite && normalized.website) continue;
        if (filters.minRating && normalized.rating && normalized.rating < filters.minRating) continue;
        if (filters.maxRating && normalized.rating && normalized.rating > filters.maxRating) continue;
        if (filters.hasPhone && !normalized.phone) continue;

        enrichedLeads.push(normalized);
      } catch (err) {
        console.warn('Place detail fetch notice:', err.message);
      }
    }

    return enrichedLeads;
  }

  normalizeLead(raw) {
    const rawWebsite = raw.website || null;
    let domain = null;
    if (rawWebsite) {
      try {
        const urlObj = new URL(rawWebsite.startsWith('http') ? rawWebsite : `https://${rawWebsite}`);
        domain = urlObj.hostname.replace(/^www\./, '');
      } catch {}
    }

    return {
      name: raw.name || 'Business Prospect',
      companyName: raw.name || 'Business Prospect',
      company: raw.name || 'Business Prospect',
      email: null, // Google Places does not return email directly; enriched in next step
      phone: raw.formatted_phone_number || raw.international_phone_number || null,
      website: rawWebsite,
      domain,
      address: raw.formatted_address || raw.vicinity || null,
      city: raw._searchLocation || null,
      country: null,
      location: {
        lat: raw.geometry?.location?.lat || null,
        lng: raw.geometry?.location?.lng || null,
      },
      googlePlaceId: raw.place_id || null,
      googleMapsUrl: raw.url || (raw.place_id ? `https://www.google.com/maps/place/?q=place_id:${raw.place_id}` : null),
      rating: typeof raw.rating === 'number' ? raw.rating : null,
      reviewCount: typeof raw.user_ratings_total === 'number' ? raw.user_ratings_total : null,
      category: Array.isArray(raw.types) ? raw.types[0] : null,
      industry: raw._searchIndustry || 'General',
      websiteStatus: rawWebsite ? 'Active' : 'Missing',
      source: 'Google Places API',
    };
  }
}
