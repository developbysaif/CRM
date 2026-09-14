import { apiSuccess, apiError } from '@/lib/api';
import { executeLeadDiscovery } from '@/lib/services/discovery/discovery.service';
import Settings from '@/models/Settings';
import connectDB from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      provider = 'google',
      query = '',
      industry = 'Restaurant',
      location = 'London, UK',
      quantity = 15,
      filters = {},
    } = body;

    const result = await executeLeadDiscovery({
      provider,
      query,
      industry,
      location,
      quantity: Number(quantity) || 15,
      filters,
    });

    return apiSuccess(
      result,
      `Lead Discovery completed: ${result.savedCount} verified leads saved to CRM (${result.duplicatesDetected} duplicates filtered)`
    );
  } catch (error) {
    console.error('Lead Discovery API Error:', error);
    return apiError(error.message || 'Failed to execute Lead Discovery', 500);
  }
}

export async function GET() {
  try {
    await connectDB();
    const settings = (await Settings.findOne()) || {};
    const googleConfigured = Boolean(process.env.GOOGLE_MAPS_API_KEY || settings.googlePlacesApiKey);
    const apifyConfigured = Boolean(process.env.APIFY_API_TOKEN || settings.apifyApiToken);

    return apiSuccess({
      providers: [
        {
          id: 'google',
          name: 'Google Places API',
          description: 'Official Google Places Text Search & Details API',
          isConfigured: googleConfigured,
        },
        {
          id: 'apify',
          name: 'Apify Crawler',
          description: 'High-volume Google Places & Web Scraper Actor',
          isConfigured: apifyConfigured,
        },
      ],
      industries: [
        'Restaurants without websites',
        'Restaurants with poor websites',
        'Real estate agencies',
        'Dental clinics',
        'Law firms',
        'SaaS companies',
        'E-commerce businesses',
        'Shopify stores',
        'WordPress websites',
        'Local businesses',
        'Marketing agencies',
        'Construction companies',
        'Hotels',
        'Businesses with low Google ratings',
      ],
    });
  } catch (error) {
    return apiError('Failed to fetch provider status: ' + error.message, 500);
  }
}
