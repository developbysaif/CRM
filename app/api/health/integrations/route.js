import { apiSuccess, apiError } from '@/lib/api';
import { requireRole } from '@/lib/auth';

/**
 * Admin-only endpoint returning boolean status per integration (never secrets).
 */
export async function GET(request) {
  try {
    const auth = await requireRole(request, ['admin']);
    if (auth.error) {
      return apiError('Admin privileges required to view integration health', auth.status || 403);
    }

    const integrations = {
      database: Boolean(process.env.MONGODB_URI || process.env.DATABASE_URL),
      openai: Boolean(process.env.OPENAI_API_KEY),
      apify: Boolean(process.env.APIFY_API_TOKEN),
      google_places: Boolean(process.env.GOOGLE_PLACES_API_KEY),
      firecrawl: Boolean(process.env.FIRECRAWL_API_KEY),
      hunter: Boolean(process.env.HUNTER_API_KEY),
      email: Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER)),
      whatsapp: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
      cron: Boolean(process.env.CRON_SECRET),
      stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    };

    return apiSuccess({
      integrations,
      timestamp: new Date().toISOString(),
    }, 'Integration health retrieved');
  } catch (error) {
    console.error('Integrations health error:', error);
    return apiError('Failed to check integration status', 500);
  }
}
