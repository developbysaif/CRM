'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, Input, Select, Modal, Badge,
  LeadScoreBadge, StatusBadge, PriorityBadge, Pagination, EmptyState, LoadingSkeleton
} from '@/components/ui/index';
import {
  Search, Filter, Plus, Download, Upload, Trash2, 
  Eye, Edit3, MoreHorizontal, CheckSquare, Sparkles, 
  Building2, Mail, Phone, Calendar, ArrowUpDown
} from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [qualityFilter, setQualityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    industry: 'Technology',
    status: 'New Lead',
    leadStatus: 'Warm',
    leadScore: 75,
    assignedTo: 'Saif (Account Exec)',
  });

  const stages = [
    'New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 
    'Negotiation', 'Closed Won', 'Closed Lost'
  ];

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        search,
        ...(stageFilter ? { status: stageFilter } : {}),
        ...(qualityFilter ? { leadStatus: qualityFilter } : {}),
        sortBy,
        sortOrder,
      });
      const res = await fetch(`/api/leads?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.data?.leads || []);
        setTotal(data.data?.pagination?.total || (data.data?.leads || []).length);
      }
    } catch (err) {
      console.error('Failed to load leads', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, stageFilter, qualityFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(leads.map(l => l._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewLead({
          name: '',
          company: '',
          email: '',
          phone: '',
          industry: 'Technology',
          status: 'New Lead',
          leadStatus: 'Warm',
          leadScore: 75,
          assignedTo: 'Saif (Account Exec)',
        });
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Quality', 'Score'];
    const rows = leads.map(l => [
      `"${l.name || ''}"`,
      `"${l.companyName || l.company || ''}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.status || 'New Lead'}"`,
      `"${l.leadStatus || 'Warm'}"`,
      l.leadScore || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Leads Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track, score, and move qualified business opportunities through the sales funnel.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 mb-6" hover={false}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by contact name, company, or email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Stage & Quality Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={stageFilter}
              onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Stages</option>
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={qualityFilter}
              onChange={(e) => { setQualityFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Quality Tiers</option>
              <option value="Hot">🔥 Hot (Score 80-100)</option>
              <option value="Warm">⚡ Warm (Score 60-79)</option>
              <option value="Cold">❄️ Cold (Score 0-59)</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort ({sortOrder.toUpperCase()})</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Floating Bulk Actions Drawer */}
      {selectedLeads.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
            <CheckSquare className="w-4 h-4" />
            <span>{selectedLeads.length} leads selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedLeads([])}
            >
              Deselect
            </Button>
            <Button
              size="sm"
              variant="danger"
              icon={Trash2}
              onClick={() => alert(`Bulk delete triggered for ${selectedLeads.length} leads.`)}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Main Leads Table */}
      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={leads.length > 0 && selectedLeads.length === leads.length}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-4">Contact & Company</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">AI Score</th>
                <th className="p-4">Pipeline Stage</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Assigned Rep</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <LoadingSkeleton count={5} />
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <EmptyState
                      title="No matching leads"
                      description="Try clearing your filters or create a new prospect."
                      action={
                        <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                          Add New Lead
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead._id)}
                        onChange={() => handleSelectOne(lead._id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* Contact & Company */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                          {(lead.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/leads/${lead._id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 truncate block no-underline"
                          >
                            {lead.name || 'Unnamed Contact'}
                          </Link>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{lead.companyName || lead.company || 'Private Business'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="p-4 text-slate-500 dark:text-slate-400 space-y-1">
                      {lead.email && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 truncate text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* AI Score */}
                    <td className="p-4">
                      <LeadScoreBadge score={lead.leadScore || 70} status={lead.leadStatus || 'Warm'} />
                    </td>

                    {/* Stage */}
                    <td className="p-4">
                      <StatusBadge status={lead.status || 'New Lead'} />
                    </td>

                    {/* Priority */}
                    <td className="p-4">
                      <PriorityBadge priority={lead.priority || (lead.leadScore >= 80 ? 'Urgent' : 'Medium')} />
                    </td>

                    {/* Assigned Rep */}
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {lead.assignedTo || 'Saif (Admin)'}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <Link
                        href={`/leads/${lead._id}`}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Lead 360° Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <Pagination
            page={page}
            totalPages={Math.ceil(total / 20) || 1}
            totalItems={total}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </Card>

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Qualified Lead"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <Input
            label="Contact Full Name"
            required
            value={newLead.name}
            onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            placeholder="e.g. Rachel Green"
          />
          <Input
            label="Company Name"
            required
            value={newLead.company}
            onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
            placeholder="e.g. Ralph Lauren Inc"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Work Email"
              type="email"
              required
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              placeholder="rachel@ralphlauren.com"
            />
            <Input
              label="Phone"
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              placeholder="+1 212-555-0143"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Pipeline Stage"
              options={stages}
              value={newLead.status}
              onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
            />
            <Select
              label="Quality Tier"
              options={['Hot', 'Warm', 'Cold']}
              value={newLead.leadStatus}
              onChange={(e) => setNewLead({ ...newLead, leadStatus: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Lead
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
