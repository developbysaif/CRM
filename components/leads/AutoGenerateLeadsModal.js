'use client';
import { useState } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui/index';
import { Sparkles, Compass, CheckCircle2, AlertCircle, Building2, MapPin, Globe, Loader2 } from 'lucide-react';

const INDUSTRIES = [
  'Restaurants & Cafes',
  'Dental & Healthcare Clinics',
  'Real Estate & Luxury Properties',
  'Law Firms & Legal Consultancies',
  'Gyms & Fitness Centers',
  'Hotels & Boutique Resorts',
  'Ecommerce & Retail Brands',
  'Software & IT Consultancies',
  'Accounting & Financial Services',
  'Automotive & Dealerships',
];

const POPULAR_LOCATIONS = [
  'London, UK',
  'New York, NY, USA',
  'Dubai, United Arab Emirates',
  'San Francisco, CA, USA',
  'Toronto, ON, Canada',
  'Sydney, NSW, Australia',
  'Berlin, Germany',
  'Singapore',
];

export default function AutoGenerateLeadsModal({ isOpen, onClose, onSuccess }) {
  const [industry, setIndustry] = useState('Restaurants & Cafes');
  const [location, setLocation] = useState('London, UK');
  const [provider, setProvider] = useState('apify'); // 'apify' | 'google'
  const [quantity, setQuantity] = useState(10);
  const [filterMissingWebsite, setFilterMissingWebsite] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [resultSummary, setResultSummary] = useState(null);

  const resetState = () => {
    setError(null);
    setResultSummary(null);
    setIsGenerating(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setResultSummary(null);

    try {
      const res = await fetch('/api/discovery/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          industry,
          location,
          quantity: Number(quantity),
          filters: {
            requireMissingWebsite: filterMissingWebsite,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Auto lead discovery encountered an error.');
      }

      setResultSummary(data.data || { savedCount: quantity, duplicatesDetected: 0 });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to auto-generate leads. Please check API keys.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="⚡ Automatic Lead Generation Engine" maxWidth="max-w-xl">
      <div className="space-y-4">
        {!resultSummary ? (
          <form onSubmit={handleGenerate} className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aura AI scans live Google Maps, web directories, and business registries to discover, audit, score, and import high-intent prospects into your CRM.
            </p>

            {/* Industry Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Business Industry / Niche
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Geographic Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Manchester, UK or Austin, TX"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Quick location pills */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {POPULAR_LOCATIONS.slice(0, 4).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Provider Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Discovery Quantity
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">5 High-Quality Leads</option>
                  <option value={10} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">10 Verified Leads</option>
                  <option value={20} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">20 Deep-Scraped Leads</option>
                  <option value={50} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">50 Bulk Enterprise Leads</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Discovery Engine
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="apify" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Apify Crawler (Google Maps & Web)</option>
                  <option value="google" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Google Places Official API</option>
                </select>
              </div>
            </div>

            {/* Smart Filter Option */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Prioritize Missing / Outdated Websites
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Filters for businesses that lack a website (prime target for agency pitches).
                </span>
              </div>
              <input
                type="checkbox"
                checked={filterMissingWebsite}
                onChange={(e) => setFilterMissingWebsite(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={handleClose} disabled={isGenerating}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                icon={isGenerating ? Loader2 : Sparkles}
                loading={isGenerating}
              >
                {isGenerating ? 'Scanning & Scoring Leads...' : `Auto-Generate ${quantity} Leads`}
              </Button>
            </div>
          </form>
        ) : (
          /* Success Summary Screen */
          <div className="p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
              Auto-Lead Generation Complete!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Successfully queried {provider.toUpperCase()}, normalized data, ran 5-key de-duplication, and computed 0-100 intent scores.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-300 py-2">
              <div>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 block">
                  {resultSummary.savedCount || 0}
                </span>
                <span>New Leads Added</span>
              </div>
              <div>
                <span className="text-2xl font-black text-amber-600 block">
                  {resultSummary.duplicatesDetected || 0}
                </span>
                <span>Duplicates Filtered</span>
              </div>
            </div>
            <div className="pt-2">
              <Button size="sm" onClick={handleClose}>
                View Newly Added Leads
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
