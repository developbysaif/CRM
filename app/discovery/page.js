'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Badge, Input, Select, LeadScoreBadge, EmptyState
} from '@/components/ui/index';
import {
  Search, Sparkles, MapPin, Globe, Star, 
  Building2, CheckCircle2, ArrowUpRight 
} from 'lucide-react';

export default function DiscoveryPage() {
  const [query, setQuery] = useState('High-end restaurants');
  const [location, setLocation] = useState('London, UK');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const res = await fetch(`/api/discovery/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.data?.leads || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportLead = async (item) => {
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.contactName || item.name || 'Business Manager',
          company: item.name || item.companyName,
          website: item.website,
          phone: item.phone,
          city: location,
          leadScore: item.leadScore || 80,
          leadStatus: 'Hot',
          status: 'New Lead',
        }),
      });
      alert(`Imported ${item.name} into verified CRM leads!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Autonomous Lead Discovery Scanner
            </h1>
            <Badge variant="primary">Google Places & Apify</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mine real commercial registries, verify domain tech stacks, and auto-deduplicate prospects.
          </p>
        </div>
      </div>

      {/* Discovery Search Card */}
      <Card hover={false} className="p-6 mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Input
            label="Target Industry / Business Type"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Luxury Hotels or Dental Clinics"
          />
          <Input
            label="Geographic Region"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Manchester, UK"
          />
          <Button
            type="submit"
            icon={Sparkles}
            loading={isSearching}
            className="w-full"
          >
            Launch Discovery Scan
          </Button>
        </form>
      </Card>

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Discovered Prospects ({results.length})</span>
          <span>Zero Synthetic Guarantee</span>
        </div>

        {results.length === 0 ? (
          <Card hover={false} className="py-12 text-center">
            <EmptyState
              icon={Search}
              title="No prospects mined yet"
              description="Enter a business category and geographic target above to query real commercial databases."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((r, i) => (
              <Card key={i} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {r.name || r.companyName}
                    </h3>
                    <LeadScoreBadge score={r.leadScore || 85} status="Hot" />
                  </div>

                  <div className="text-xs text-slate-500 space-y-1.5 py-2">
                    {r.formattedAddress && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{r.formattedAddress}</span>
                      </div>
                    )}
                    {r.website && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-blue-600 truncate">{r.website}</span>
                      </div>
                    )}
                    {r.rating && (
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{r.rating} ({r.userRatingsTotal || 0} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button size="sm" onClick={() => handleImportLead(r)}>
                    Import to CRM
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
