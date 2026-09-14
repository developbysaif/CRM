import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { apiSuccess, apiError } from '@/lib/api';

function maskKey(key) {
  if (!key) return '';
  const trimmed = key.trim();
  if (trimmed.length <= 8) return '********';
  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-4);
  return `${prefix}****************${suffix}`;
}

export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    const doc = settings.toObject();

    // Check environment fallbacks for active status indication
    const envOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const envApify = Boolean(process.env.APIFY_API_TOKEN);
    const envResend = Boolean(process.env.RESEND_API_KEY);
    const envGoogle = Boolean(process.env.GOOGLE_MAPS_API_KEY);

    // Mask sensitive keys before sending to frontend
    const maskedSettings = {
      ...doc,
      openaiApiKey: maskKey(doc.openaiApiKey || (envOpenAI ? process.env.OPENAI_API_KEY : '')),
      apifyApiToken: maskKey(doc.apifyApiToken || (envApify ? process.env.APIFY_API_TOKEN : '')),
      resendApiKey: maskKey(doc.resendApiKey || (envResend ? process.env.RESEND_API_KEY : '')),
      googlePlacesApiKey: maskKey(doc.googlePlacesApiKey || (envGoogle ? process.env.GOOGLE_MAPS_API_KEY : '')),
      smtpPass: doc.smtpPass ? '********' : '',
      isEnvConfigured: {
        openai: envOpenAI,
        apify: envApify,
        resend: envResend,
        google: envGoogle,
      },
    };

    return apiSuccess(maskedSettings);
  } catch (error) {
    return apiError('Failed to fetch settings: ' + error.message, 500);
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const body = await request.json();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }

    // Only update sensitive keys if they do not contain masked asterisks
    const sanitizedBody = { ...body };
    const secretFields = ['openaiApiKey', 'apifyApiToken', 'resendApiKey', 'googlePlacesApiKey', 'smtpPass'];

    for (const field of secretFields) {
      if (sanitizedBody[field] !== undefined) {
        if (sanitizedBody[field].includes('****')) {
          delete sanitizedBody[field]; // Keep existing value
        } else if (!sanitizedBody[field].trim()) {
          sanitizedBody[field] = '';
        }
      }
    }

    Object.assign(settings, sanitizedBody);
    await settings.save();

    return apiSuccess(null, 'Settings saved securely');
  } catch (error) {
    return apiError('Failed to update settings: ' + error.message, 500);
  }
}
