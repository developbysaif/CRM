import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}

const resolveMx = (domain) => dns.promises.resolveMx(domain);

// Known disposable/temporary email provider domains
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
  'sharklasers.com', 'trashmail.com', 'yopmail.com', 'dispostable.com',
  'getairmail.com', 'throwawaymail.com', 'fakeinbox.com', 'burnermail.io',
  'temp-mail.org', 'inboxkitten.com', 'crazymailing.com', 'maildrop.cc',
  'mohmal.com', 'mytemp.email', 'tempail.com', 'generator.email'
]);

// Common generic role accounts
const ROLE_PREFIXES = new Set([
  'admin', 'support', 'info', 'sales', 'billing', 'contact', 'hello',
  'office', 'team', 'help', 'jobs', 'careers', 'marketing', 'press'
]);

/**
 * Validates standard email RFC syntax
 */
function isValidEmailSyntax(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {}

/**
 * Checks if the domain has valid DNS MX records
 */
async function checkMxRecords(domain) {
  try {
    const records = await resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Pings website URL to verify HTTP reachability
 */
async function checkWebsiteLive(url) {
  if (!url) return null;
  let target = url.trim();
  if (!target.startsWith('http://') && !target.startsWith('https://')) {
    target = `https://${target}`;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(target, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'LeadAI-Pro-Verifier/1.0' },
    });
    clearTimeout(timeout);
    return res.status < 500;
  } catch {
    return false;
  }
}

/**
 * Complete lead verification engine
 * @param {Object} lead - Lead object containing email, phone, website
 * @returns {Promise<Object>} Verification report
 */
export async function verifyLeadData(lead = {}) {
  const result = {
    status: 'valid', // 'valid' | 'risky' | 'invalid'
    emailValid: false,
    mxValid: false,
    isDisposable: false,
    isRoleAccount: false,
    phoneValid: null,
    websiteValid: null,
    details: '',
    score: 100,
    verifiedAt: new Date(),
  };

  const email = (lead.email || '').trim().toLowerCase();
  const phone = (lead.phone || '').trim();
  const website = (lead.website || '').trim();

  // 1. Email Verification
  if (email) {
    if (!isValidEmailSyntax(email)) {
      result.emailValid = false;
      result.status = 'invalid';
      result.details = 'Invalid email syntax format.';
      result.score = 0;
      return result;
    }

    result.emailValid = true;
    const [localPart, domain] = email.split('@');

    // Role check
    if (ROLE_PREFIXES.has(localPart)) {
      result.isRoleAccount = true;
      result.score -= 15;
    }

    // Disposable check
    if (DISPOSABLE_DOMAINS.has(domain)) {
      result.isDisposable = true;
      result.status = 'invalid';
      result.details = `Disposable/temporary email provider detected (${domain}).`;
      result.score = 10;
      return result;
    }

    // DNS MX Record lookup
    const hasMx = await checkMxRecords(domain);
    result.mxValid = hasMx;

    if (!hasMx) {
      result.status = 'invalid';
      result.details = `Domain (${domain}) has no active mail servers (MX records).`;
      result.score = 20;
    } else if (result.isRoleAccount) {
      result.status = 'risky';
      result.details = `Valid MX servers on ${domain}, but detected role-based inbox (${localPart}@).`;
    } else {
      result.details = `Verified personal corporate inbox with active MX servers on ${domain}.`;
    }
  } else {
    result.details = 'No email address provided for verification.';
  }

  // 2. Phone Verification
  if (phone) {
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    const phoneValid = cleaned.length >= 7 && cleaned.length <= 15 && /^\+?\d+$/.test(cleaned);
    result.phoneValid = phoneValid;
    if (!phoneValid) {
      result.score -= 10;
      if (result.status === 'valid') result.status = 'risky';
      result.details += ' Phone number format is irregular.';
    }
  }

  // 3. Website Verification
  if (website) {
    const isLive = await checkWebsiteLive(website);
    result.websiteValid = isLive;
    if (isLive === false) {
      result.score -= 10;
      result.details += ' Website ping timed out or returned error.';
    }
  }

  return result;
}
