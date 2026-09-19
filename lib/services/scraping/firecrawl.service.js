import mongoose from 'mongoose';
import Settings from '@/models/Settings';
import { runActorSync } from '@/lib/services/apify/apify.client';

/**
 * Normalizes URL with protocol
 */
function normalizeUrl(url) {
  if (!url) return '';
  let clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  return clean;
}

/**
 * Extracts hostname
 */
function extractHostname(url) {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '');
  } catch {
    return url || 'business.com';
  }
}

/**
 * Strips HTML tags and normalizes whitespace
 */
function stripHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts up to maxWords words from text to minimize prompt token burn
 */
function pruneToWordLimit(text, maxWords = 150) {
  if (!text) return '';
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Scrapes target website using Firecrawl API if configured,
 * with graceful fallback to Apify or built-in fast HTTP fetch.
 *
 * TOKEN OPTIMIZATION:
 * - Aggressively prunes extracted content to under 150 words.
 * - Computes technical metrics (SEO, Mobile, Performance) DETERMINISTICALLY (0 tokens).
 *
 * @param {string} targetUrl - Target website URL
 * @param {Object} options - Scrape options
 * @returns {Promise<Object>} Clean, pruned website intelligence
 */
export async function scrapeWebsiteForLead(targetUrl, { organizationId = 'org_default' } = {}) {
  const normalized = normalizeUrl(targetUrl);
  const hostname = extractHostname(normalized);

  let result = {
    url: normalized,
    hostname,
    title: hostname,
    description: '',
    headings: [],
    cleanSnippet: '',
    hasSSL: normalized.startsWith('https://'),
    hasMobileViewport: true,
    ttfbMs: 300,
    seoScore: 70,
    mobileScore: 75,
    performanceScore: 70,
    scrapedVia: 'direct_probe',
  };

  // 1. Direct HTTP Probe (Latency, Headers, Basic HTML)
  let rawHtml = '';
  try {
    const startTime = Date.now();
    const probeRes = await fetch(normalized, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LeadAI-Pro/3.0',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(6000),
    });
    result.ttfbMs = Date.now() - startTime;
    rawHtml = await probeRes.text();

    // Check SSL from response
    result.hasSSL = probeRes.url.startsWith('https://');

    // Parse HTML tags with lightweight regex (0 tokens)
    const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) result.title = titleMatch[1].trim();

    const descMatch = rawHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
                      rawHtml.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i);
    if (descMatch) result.description = descMatch[1].trim();

    const viewportMatch = rawHtml.match(/<meta\s+name=["']viewport["']/i);
    result.hasMobileViewport = Boolean(viewportMatch);

    const h1Matches = [...rawHtml.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi)].map(m => m[1].trim()).slice(0, 3);
    if (h1Matches.length > 0) result.headings = h1Matches;
  } catch (err) {
    // URL not reachable or timeout
    result.performanceScore = 40;
    result.seoScore = 45;
    result.mobileScore = 40;
    result.cleanSnippet = `Site timed out or unreachable at ${normalized}.`;
    return result;
  }

  // 2. Resolve API Keys from Settings / Env
  let settings = {};
  if (mongoose.connection?.readyState === 1) {
    try {
      settings = (await Settings.findOne({ organizationId })) || (await Settings.findOne()) || {};
    } catch {}
  }

  const firecrawlKey = process.env.FIRECRAWL_API_KEY || settings.firecrawlApiKey;
  const apifyToken = process.env.APIFY_API_TOKEN || settings.apifyApiToken;

  // 3. Try Firecrawl API if configured
  if (firecrawlKey) {
    try {
      const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firecrawlKey}`,
        },
        body: JSON.stringify({
          url: normalized,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (fcRes.ok) {
        const fcData = await fcRes.json();
        const md = fcData.data?.markdown || '';
        const metadata = fcData.data?.metadata || {};

        if (metadata.title) result.title = metadata.title;
        if (metadata.description) result.description = metadata.description;

        // Prune markdown to max 150 words (token optimizer!)
        result.cleanSnippet = pruneToWordLimit(md.replace(/[#*`_\[\]]/g, ' '), 150);
        result.scrapedVia = 'firecrawl';
      }
    } catch (fcErr) {
      console.warn('Firecrawl scrape fallback notice:', fcErr.message);
    }
  }

  // 4. Try Apify Crawler if Firecrawl didn't populate snippet and Apify is available
  if (!result.cleanSnippet && apifyToken) {
    try {
      const crawlInput = {
        startUrls: [{ url: normalized }],
        maxCrawlPages: 1,
        crawlerType: 'cheerio',
      };
      const apifyResult = await runActorSync('apify/website-content-crawler', crawlInput, { maxWaitSec: 25 });
      if (apifyResult.items?.length > 0) {
        const item = apifyResult.items[0];
        if (item.title) result.title = item.title;
        if (item.description) result.description = item.description;
        result.cleanSnippet = pruneToWordLimit(item.text || '', 150);
        result.scrapedVia = 'apify_crawler';
      }
    } catch (apifyErr) {
      console.warn('Apify scrape fallback notice:', apifyErr.message);
    }
  }

  // 5. Fallback snippet from direct HTML if still empty
  if (!result.cleanSnippet && rawHtml) {
    const strippedText = stripHtml(rawHtml);
    result.cleanSnippet = pruneToWordLimit(strippedText, 150);
    result.scrapedVia = 'direct_html';
  }

  // 6. Deterministic Technical Scores (0 AI Tokens Burned!)
  let seo = 60;
  if (result.title && result.title !== hostname) seo += 15;
  if (result.description) seo += 15;
  if (result.headings.length > 0) seo += 10;
  result.seoScore = Math.min(seo, 95);

  let mobile = result.hasMobileViewport ? 85 : 45;
  result.mobileScore = mobile;

  let perf = 85;
  if (result.ttfbMs > 800) perf = 50;
  else if (result.ttfbMs > 400) perf = 65;
  else if (result.ttfbMs > 250) perf = 78;
  result.performanceScore = perf;

  return result;
}
