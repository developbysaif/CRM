'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner, LeadScoreBadge } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';

const QUICK_PRESETS = [
  { label: '🍽️ Restaurants without websites', industry: 'Restaurant', filters: { noWebsite: true } },
  { label: '🦷 Dental clinics', industry: 'Dental clinic', filters: { hasPhone: true } },
  { label: '⚖️ Law firms', industry: 'Law firm', filters: { minRating: 4.0 } },
  { label: '🏢 Real estate agencies', industry: 'Real estate agency', filters: { hasPhone: true } },
  { label: '💻 SaaS companies', industry: 'SaaS company', filters: { websiteRequired: true } },
  { label: '🛍️ Shopify & E-commerce stores', industry: 'Ecommerce', filters: { websiteRequired: true } },
  { label: '🏨 Hotels & Hospitality', industry: 'Hotel', filters: { minRating: 3.5 } },
  { label: '🏗️ Construction companies', industry: 'Construction company', filters: { hasPhone: true } },
  { label: '⭐ Businesses with low Google ratings', industry: 'Local business', filters: { maxRating: 3.8 } },
  { label: '🌐 Outdated websites needing redesign', industry: 'Professional services', filters: { websiteRequired: true } },
];

export default function DiscoveryPage() {
  const [provider, setProvider] = useState('google');
  const [providerInfo, setProviderInfo] = useState([]);
  const [industry, setIndustry] = useState('Restaurant');
  const [city, setCity] = useState('London');
  const [country, setCountry] = useState('United Kingdom');
  const [quantity, setQuantity] = useState(15);
  const [filters, setFilters] = useState({
    noWebsite: false,
    websiteRequired: false,
    hasPhone: false,
    hasEmail: false,
    minRating: '',
    maxRating: '',
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [personalizingId, setPersonalizingId] = useState(null);

  useEffect(() => {
    async function loadProviders() {
      try {
        const res = await fetch('/api/discovery/search');
        const data = await res.json();
        if (data.success && data.data?.providers) {
          setProviderInfo(data.data.providers);
          // Default to configured provider
          const active = data.data.providers.find((p) => p.isConfigured);
          if (active) setProvider(active.id);
        }
      } catch {}
    }
    loadProviders();
  }, []);

  async function handleSearch(e) {
    if (e) e.preventDefault();
    setLoading(true);
    setResults(null);
    try {
      const location = `${city}, ${country}`.replace(/^,\s*/, '').replace(/,\s*$/, '');
      const res = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          industry,
          location: location || 'London, UK',
          quantity: Number(quantity) || 15,
          filters: {
            ...filters,
            minRating: filters.minRating ? Number(filters.minRating) : undefined,
            maxRating: filters.maxRating ? Number(filters.maxRating) : undefined,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        toast.success(
          `Discovered ${data.data.savedCount} verified prospects (${data.data.duplicatesDetected} duplicates filtered)`
        );
      } else {
        toast.error(data.message || 'Discovery search failed');
      }
    } catch (err) {
      toast.error('Network error during discovery search');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateOutreach(leadId) {
    setPersonalizingId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}/personalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enqueue: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Outreach drafted and enqueued in Approval Center!');
      } else {
        toast.error(data.message || 'Personalization failed');
      }
    } catch {
      toast.error('Failed to draft outreach');
    } finally {
      setPersonalizingId(null);
    }
  }

  return (
    <AppLayout
      title="AI Sales Employee & Lead Discovery"
      subtitle="Discover verified commercial prospects via Google Places or Apify with automated de-duplication and 0-100 lead scoring"
    >
      {/* Question Hero Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: 'white',
          padding: '24px 28px',
          marginBottom: 24,
          borderRadius: 12,
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>🤖</span>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
            What type of leads do you want?
          </h2>
        </div>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px 0', maxWidth: 680 }}>
          Select a high-converting prospect preset below or configure custom geographical and industry criteria.
          Our Lead Engine verifies contact details, crawls active web properties, and filters duplicates against your CRM database.
        </p>

        {/* Presets Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setIndustry(preset.industry);
                setFilters((prev) => ({ ...prev, ...preset.filters }));
              }}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 12px',
                borderRadius: 20,
                background: industry === preset.industry ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                border: industry === preset.industry ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Query Configuration Panel */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Target Industry / Niche
              </label>
              <input
                className="input"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Restaurants, Dental clinics"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                City
              </label>
              <input
                className="input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. London, San Francisco"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Country
              </label>
              <input
                className="input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United Kingdom, USA"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Lead Provider
              </label>
              <select
                className="input"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="google">Google Places API (Official)</option>
                <option value="apify">Apify Crawler Engine</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                Prospect Quantity ({quantity})
              </label>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
          </div>

          {/* Filter Checkboxes */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 13,
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={filters.noWebsite}
                onChange={(e) =>
                  setFilters({ ...filters, noWebsite: e.target.checked, websiteRequired: false })
                }
              />
              🚫 Missing Website (+25 Score)
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={filters.websiteRequired}
                onChange={(e) =>
                  setFilters({ ...filters, websiteRequired: e.target.checked, noWebsite: false })
                }
              />
              🌐 Has Existing Website
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={filters.hasPhone}
                onChange={(e) => setFilters({ ...filters, hasPhone: e.target.checked })}
              />
              📞 Direct Telephone Required
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#64748b' }}>Min Rating:</span>
              <input
                className="input"
                style={{ width: 64, padding: '4px 8px', fontSize: 12 }}
                placeholder="4.0"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ minWidth: 200, padding: '10px 20px', fontSize: 14 }}
            >
              {loading ? (
                <>
                  <Spinner size={16} /> Discovering & Scoring Leads...
                </>
              ) : (
                `⚡ Discover ${quantity} Verified Leads`
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Discovery Results View */}
      {results && (
        <div>
          {/* Summary Stat Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Total Discovered
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{results.totalDiscovered}</div>
            </div>

            <div className="card" style={{ padding: '14px 18px', textAlign: 'center', background: '#f0fdf4' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                New Verified Leads Saved
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#15803d' }}>{results.savedCount}</div>
            </div>

            <div className="card" style={{ padding: '14px 18px', textAlign: 'center', background: '#fef2f2' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                Hot Leads (80-100)
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#b91c1c' }}>{results.hotLeadsCount}</div>
            </div>

            <div className="card" style={{ padding: '14px 18px', textAlign: 'center', background: '#fffbeb' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
                Duplicates Filtered Out
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#b45309' }}>{results.duplicatesDetected}</div>
            </div>
          </div>

          {/* Results Table */}
          {results.leads.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                All discovered prospects already exist in your CRM
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                Our 5-key deduplication engine filtered out all {results.duplicatesDetected} items to prevent spamming the same businesses.
              </div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Business / Prospect</th>
                    <th>Digital Presence</th>
                    <th>Google Reputation</th>
                    <th>AI Score</th>
                    <th>Why Valuable?</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.leads.map((lead) => (
                    <tr key={lead._id}>
                      <td>
                        <Link
                          href={`/leads/${lead._id}`}
                          style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}
                        >
                          {lead.companyName || lead.company || lead.name}
                        </Link>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          {lead.address || `${city}, ${country}`}
                        </div>
                        {lead.phone && (
                          <div style={{ fontSize: 11, color: '#2563eb', marginTop: 2 }}>
                            📞 {lead.phone}
                          </div>
                        )}
                      </td>

                      <td>
                        {lead.website ? (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 12, color: '#2563eb', textDecoration: 'underline' }}
                          >
                            {lead.domain || 'Visit Website'} ↗
                          </a>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#dc2626',
                              background: '#fee2e2',
                              padding: '2px 8px',
                              borderRadius: 4,
                            }}
                          >
                            NO WEBSITE ⚠️
                          </span>
                        )}
                      </td>

                      <td>
                        {lead.rating ? (
                          <div style={{ fontSize: 12, fontWeight: 600 }}>
                            <span style={{ color: '#eab308' }}>★</span> {lead.rating}{' '}
                            <span style={{ color: '#94a3b8', fontWeight: 400 }}>({lead.reviewCount || 0})</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>Unrated</span>
                        )}
                      </td>

                      <td>
                        <LeadScoreBadge score={lead.leadScore} status={lead.leadStatus} />
                      </td>

                      <td style={{ maxWidth: 320 }}>
                        <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.4 }}>
                          {lead.whyValuable || lead.aiSummary}
                        </div>
                        <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, marginTop: 4 }}>
                          👉 {lead.nextAction}
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <button
                            onClick={() => handleGenerateOutreach(lead._id)}
                            disabled={personalizingId === lead._id}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: 11, padding: '4px 8px' }}
                          >
                            {personalizingId === lead._id ? 'Drafting...' : '✉️ Draft Outreach'}
                          </button>

                          <Link
                            href={`/leads/${lead._id}`}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '4px 8px', textAlign: 'center' }}
                          >
                            View Profile
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
