/**
 * Validates environment variables at application initialization.
 * In production, logs clear warnings when required keys are missing.
 * Prevents silent fallbacks to fake data.
 */

const REQUIRED_ENVS = [
  { key: 'MONGODB_URI', alternative: 'DATABASE_URL', description: 'Database Connection String' },
  { key: 'JWT_SECRET', alternative: 'AUTH_SECRET', description: 'JWT Authentication Signing Secret' },
];

const OPTIONAL_INTEGRATIONS = [
  { key: 'OPENAI_API_KEY', name: 'OpenAI API' },
  { key: 'APIFY_API_TOKEN', name: 'Apify Web Mining' },
  { key: 'GOOGLE_PLACES_API_KEY', name: 'Google Places API' },
  { key: 'RESEND_API_KEY', name: 'Resend Email Dispatch' },
  { key: 'CRON_SECRET', name: 'Vercel Cron Bearer Secret' },
  { key: 'WHATSAPP_ACCESS_TOKEN', name: 'WhatsApp Business Cloud API' },
  { key: 'HUNTER_API_KEY', name: 'Hunter Deliverability Verification' },
];

export function validateEnv() {
  const missingRequired = [];

  for (const { key, alternative, description } of REQUIRED_ENVS) {
    const val = process.env[key] || (alternative ? process.env[alternative] : null);
    if (!val || !val.trim()) {
      missingRequired.push(`${key}${alternative ? ` or ${alternative}` : ''} (${description})`);
    }
  }

  if (missingRequired.length > 0) {
    const message = `[ENV VALIDATION CRITICAL] Missing required environment variables:\n - ${missingRequired.join('\n - ')}`;
    console.error(message);
    if (process.env.NODE_ENV === 'production') {
      console.warn('Production deployment running with missing primary environment credentials.');
    }
  }

  const missingOptional = OPTIONAL_INTEGRATIONS.filter(
    (item) => !process.env[item.key] || !process.env[item.key].trim()
  );

  return {
    valid: missingRequired.length === 0,
    missingRequired,
    missingOptional: missingOptional.map((o) => o.name),
  };
}
