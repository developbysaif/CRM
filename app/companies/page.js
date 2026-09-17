'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent, 
  Input, Select, Modal, Badge, EmptyState, LoadingSkeleton
} from '@/components/ui/index';
import { 
  Building2, Globe, Users, DollarSign, MapPin, 
  Plus, Search, ArrowUpRight, ExternalLink 
} from 'lucide-react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: 'Financial Technology',
    website: '',
    location: 'New York, USA',
    employees: '50-200',
    revenue: '$5M - $10M',
  });

  useEffect(() => {
    async function loadCompanies() {
      setLoading(true);
      try {
        const res = await fetch('/api/leads?limit=50');
        if (res.ok) {
          const data = await res.json();
          // Group leads by company
          const leads = data.data?.leads || [];
          const companyMap = {};
          leads.forEach(l => {
            const comp = l.companyName || l.company || l.name;
            if (!companyMap[comp]) {
              companyMap[comp] = {
                id: l._id,
                name: comp,
                industry: l.industry || 'Technology & Services',
                website: l.website || `${comp.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                location: l.city || l.country || 'United States',
                employees: '25-100',
                revenue: l.budgetRaw || '$2M - $5M',
                contactsCount: 1,
                dealsCount: 1,
                leadScore: l.leadScore || 75,
              };
            } else {
              companyMap[comp].contactsCount += 1;
              companyMap[comp].dealsCount += 1;
            }
          });
          setCompanies(Object.values(companyMap));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, []);

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Company Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise client accounts, org intelligence, and associated contacts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Company
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 mb-6" hover={false}>
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts by company name or industry..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      {/* Companies Grid */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No companies found" description="Add a company to begin managing accounts." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <Card key={c.name} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {c.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {c.industry}
                      </span>
                    </div>
                  </div>
                  <Badge variant="primary">{c.revenue}</Badge>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Globe className="w-3.5 h-3.5" /> Website
                    </span>
                    <span className="font-semibold text-blue-600 truncate max-w-[150px]">{c.website}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5" /> Location
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">{c.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5" /> Employees
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">{c.employees}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 text-xs">
                <div className="text-[11px] text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-200">{c.contactsCount}</strong> contacts • <strong className="text-slate-700 dark:text-slate-200">{c.dealsCount}</strong> deal
                </div>
                <Link
                  href={`/leads/${c.id}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 no-underline"
                >
                  View Account <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Company Account"
      >
        <form onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }} className="space-y-4">
          <Input
            label="Company Name"
            required
            value={newCompany.name}
            onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
            placeholder="e.g. Vercel Technologies"
          />
          <Input
            label="Industry"
            value={newCompany.industry}
            onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
            placeholder="Cloud Infrastructure"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Website"
              value={newCompany.website}
              onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
              placeholder="https://vercel.com"
            />
            <Input
              label="Location"
              value={newCompany.location}
              onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
              placeholder="San Francisco, CA"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Account
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
