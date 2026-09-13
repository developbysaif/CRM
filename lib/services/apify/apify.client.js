import connectDB from '@/lib/db';
import Settings from '@/models/Settings';

const APIFY_BASE_URL = 'https://api.apify.com/v2';

/**
 * Resolves the Apify API token from environment variables or database Settings.
 * Security: This is strictly server-side and never exposed to the frontend.
 */
export async function getApifyToken() {
  if (process.env.APIFY_API_TOKEN && process.env.APIFY_API_TOKEN.trim()) {
    return process.env.APIFY_API_TOKEN.trim();
  }
  try {
    await connectDB();
    const settings = await Settings.findOne();
    if (settings?.apifyApiToken && settings.apifyApiToken.trim()) {
      return settings.apifyApiToken.trim();
    }
  } catch (err) {
    console.warn('Could not read Apify token from Settings:', err.message);
  }
  return null;
}

/**
 * Standard HTTP request wrapper for Apify API v2
 */
async function apifyFetch(endpoint, options = {}) {
  const token = await getApifyToken();
  if (!token) {
    throw new Error('APIFY_API_TOKEN is not configured in environment or settings.');
  }

  const url = new URL(`${APIFY_BASE_URL}${endpoint}`);
  url.searchParams.set('token', token);

  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const fetchOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || 90000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url.toString(), {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorDetail = `HTTP ${res.status}`;
      try {
        const errJson = await res.json();
        errorDetail = errJson.error?.message || errJson.message || errorDetail;
      } catch {}
      throw new Error(`Apify API Error: ${errorDetail}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Apify request timed out after ${timeoutMs / 1000}s`);
    }
    throw err;
  }
}

/**
 * Start an Apify Actor run
 * @param {string} actorId e.g. "apify/website-content-crawler" or "compass/crawler-google-places"
 * @param {object} input actor input payload
 * @param {object} options { waitForFinish, timeout, memory, webhooks }
 */
export async function startActor(actorId, input = {}, options = {}) {
  const params = {};
  if (options.waitForFinish !== undefined) {
    params.waitForFinish = options.waitForFinish;
  }
  if (options.timeout) {
    params.timeout = options.timeout;
  }
  if (options.memory) {
    params.memory = options.memory;
  }
  if (options.webhooks) {
    params.webhooks = typeof options.webhooks === 'string' ? options.webhooks : JSON.stringify(options.webhooks);
  }

  const endpoint = `/acts/${encodeURIComponent(actorId)}/runs`;
  const response = await apifyFetch(endpoint, {
    method: 'POST',
    body: input,
    params,
    timeoutMs: options.waitForFinish ? (options.waitForFinish + 15) * 1000 : 30000,
  });

  return response.data;
}

/**
 * Get the status and details of an Actor run
 * @param {string} runId
 */
export async function getActorRun(runId) {
  if (!runId) throw new Error('runId is required');
  const response = await apifyFetch(`/actor-runs/${runId}`);
  return response.data;
}

/**
 * Retrieve items from a dataset
 * @param {string} datasetId
 * @param {object} options { limit, offset, clean, format }
 */
export async function getDatasetItems(datasetId, options = {}) {
  if (!datasetId) throw new Error('datasetId is required');
  const params = {
    limit: options.limit || 100,
    offset: options.offset || 0,
    clean: options.clean !== undefined ? options.clean : true,
    format: options.format || 'json',
  };

  const response = await apifyFetch(`/datasets/${datasetId}/items`, { params });
  return Array.isArray(response) ? response : response.data || [];
}

/**
 * Run an actor synchronously with polling if needed
 * @param {string} actorId
 * @param {object} input
 * @param {object} options { maxWaitSec, pollIntervalMs }
 */
export async function runActorSync(actorId, input = {}, options = {}) {
  const maxWaitSec = options.maxWaitSec || 60;
  const pollIntervalMs = options.pollIntervalMs || 2500;

  // Attempt initial start with waitForFinish
  try {
    const initialRun = await startActor(actorId, input, {
      waitForFinish: Math.min(maxWaitSec, 60),
    });

    if (initialRun.status === 'SUCCEEDED') {
      const items = await getDatasetItems(initialRun.defaultDatasetId);
      return { run: initialRun, items, status: 'SUCCEEDED' };
    }

    if (initialRun.status === 'FAILED' || initialRun.status === 'TIMED-OUT' || initialRun.status === 'ABORTED') {
      throw new Error(`Apify Actor finished with status: ${initialRun.status}`);
    }

    // If still running, poll until complete or maxWait reached
    let currentRun = initialRun;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitSec * 1000) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      currentRun = await getActorRun(currentRun.id);

      if (currentRun.status === 'SUCCEEDED') {
        const items = await getDatasetItems(currentRun.defaultDatasetId);
        return { run: currentRun, items, status: 'SUCCEEDED' };
      }

      if (['FAILED', 'TIMED-OUT', 'ABORTED'].includes(currentRun.status)) {
        throw new Error(`Apify Actor run ${currentRun.id} failed with status: ${currentRun.status}`);
      }
    }

    return { run: currentRun, items: [], status: 'RUNNING', message: 'Actor is still running in background' };
  } catch (err) {
    throw err;
  }
}

/**
 * Abort a running actor run
 * @param {string} runId
 */
export async function abortRun(runId) {
  if (!runId) throw new Error('runId is required');
  const response = await apifyFetch(`/actor-runs/${runId}/abort`, { method: 'POST' });
  return response.data;
}
