'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { LeadScoreBadge, Spinner, EmptyState, Pagination } from '@/components/ui/index';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { toast } from '@/components/ui/Toaster';
import {
  Search,
  Filter,
  Download,
  Plus,
  Phone,
  Mail,
  ExternalLink,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  CheckSquare,
  Square,
  ArrowUpDown,
  Building2,
  User,
  Layers,
  Star,
  X,
} from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', leadStatus: '', source: '', sortBy: 'score_desc' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [generating, setGenerating] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    contact: true,
    source: true,
    score: true,
    status: true,
    assigned: true,
    followup: true,
  });

  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    website: '',
    country: '',
    businessType: 'Restaurant',
    projectType: 'Website',
    budgetRaw: '$5k - $15k',
    leadScore: 75,
    leadStatus: 'Warm',
  });

  const stagesList = [
    'New Lead', 'Qualified', 'Contacted', 'Replied', 'Interested', 'Meeting',
    'Proposal Sent', 'Negotiation', 'Closed Won', 'Contract Sent', 'Contract Signed',
    'Payment Pending', 'Paid', 'Completed', 'Closed Lost', 'Do Not Contact'
  ];

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 25,
        search,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.leadStatus ? { leadStatus: filters.leadStatus } : {}),
      });
      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data.leads || []);
        setTotal(data.data.pagination?.total || 0);
      }
    } catch {
      toast.error('Failed to load leads');
    }
    setLoading(false);
  }, [page, search, filters.status, filters.leadStatus]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Client-side sorting & secondary filters
  const displayedLeads = useMemo(() => {
    let result = [...leads];

    if (filters.source) {
      result = result.filter((l) => (l.source || 'google_places').toLowerCase().includes(filters.source.toLowerCase()));
    }

    if (filters.sortBy === 'score_desc') {
      result.sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
    } else if (filters.sortBy === 'score_asc') {
      result.sort((a, b) => (a.leadScore || 0) - (b.leadScore || 0));
    } else if (filters.sortBy === 'name_asc') {
      result.sort((a, b) => (a.company || a.name || '').localeCompare(b.company || b.name || ''));
    } else if (filters.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [leads, filters.source, filters.sortBy]);

  async function updateStatus(leadId, pipelineStatus) {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, pipelineStatus } : l)));
        toast.success(`Stage moved to ${pipelineStatus}`);
        if (pipelineStatus === 'Interested') {
          toast.success('📄 AI Proposal Draft generated! Check Approval Center');
        } else if (pipelineStatus === 'Closed Won') {
          toast.success('📝 Contract generated in DRAFT! Check Owner Alert');
        }
      }
    } catch {
      toast.error('Failed to update stage');
    }
  }

  async function handleBulkStatusChange(pipelineStatus) {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/leads/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pipelineStatus }),
          })
        )
      );
      setLeads((prev) =>
        prev.map((l) => (selectedIds.includes(l._id) ? { ...l, pipelineStatus } : l))
      );
      toast.success(`Updated ${selectedIds.length} leads to ${pipelineStatus}`);
      setSelectedIds([]);
    } catch {
      toast.error('Bulk update failed');
    }
  }

  async function handleDraftOutreach(leadId) {
    setGenerating((prev) => ({ ...prev, [leadId]: 'outreach' }));
    try {
      const res = await fetch(`/api/leads/${leadId}/personalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enqueue: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Outreach draft queued in Approval Center!');
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to draft outreach');
    } finally {
      setGenerating((prev) => ({ ...prev, [leadId]: null }));
    }
  }

  async function handleCreateLead(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLead,
          budget: { raw: newLead.budgetRaw },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Lead created successfully!');
        setIsAddModalOpen(false);
        setNewLead({
          name: '',
          email: '',
          company: '',
          phone: '',
          website: '',
          country: '',
          businessType: 'Restaurant',
          projectType: 'Website',
          budgetRaw: '$5k - $15k',
          leadScore: 75,
          leadStatus: 'Warm',
        });
        fetchLeads();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to create lead');
    }
  }

  // Export to CSV
  function exportToCsv(selectedOnly = false) {
    const dataToExport = selectedOnly
      ? leads.filter((l) => selectedIds.includes(l._id))
      : displayedLeads;

    if (dataToExport.length === 0) {
      toast.error('No leads available to export');
      return;
    }

    const headers = ['Company', 'Contact Name', 'Email', 'Phone', 'Website', 'Industry', 'AI Score', 'Status', 'Created At'];
    const rows = dataToExport.map((l) => [
      `"${(l.companyName || l.company || '').replace(/"/g, '""')}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.website || ''}"`,
      `"${l.industry || l.businessType || ''}"`,
      l.leadScore || 50,
      `"${l.pipelineStatus || 'New Lead'}"`,
      `"${new Date(l.createdAt || Date.now()).toISOString().split('T')[0]}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${dataToExport.length} leads to CSV`);
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedLeads.map((l) => l._id));
    }
  };

  const toggleSelectLead = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <AppLayout title="Leads Management" subtitle={`${total} total verified prospects across lifecycle stages`}>
      {/* Search & Multi-Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 mb-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads by company, person, email, domain..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quality Filter */}
            <select
              value={filters.leadStatus}
              onChange={(e) => setFilters((p) => ({ ...p, leadStatus: e.target.value }))}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Quality</option>
              <option value="Hot">Hot (80–100)</option>
              <option value="Warm">Warm (60–79)</option>
              <option value="Cold">Cold (&lt;60)</option>
            </select>

            {/* Stage Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Stages</option>
              {stagesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="score_desc">Highest AI Score</option>
              <option value="score_asc">Lowest AI Score</option>
              <option value="name_asc">Company (A-Z)</option>
              <option value="newest">Recently Added</option>
            </select>

            {/* Export Button */}
            <button
              onClick={() => exportToCsv(false)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
              title="Export filtered leads to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {/* Column Visibility Trigger */}
            <button
              onClick={() => setShowColumnsModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
              title="Toggle column visibility"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns</span>
            </button>

            {/* Add Lead Primary CTA */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* Floating Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-blue-50/60 dark:bg-blue-950/30 p-2.5 rounded-xl animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                {selectedIds.length}
              </span>
              <span>leads selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Bulk Move:</span>
              <select
                onChange={(e) => {
                  if (e.target.value) handleBulkStatusChange(e.target.value);
                }}
                defaultValue=""
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-blue-200 text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="" disabled>Select Stage...</option>
                {stagesList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <button
                onClick={() => exportToCsv(true)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Export Selected
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Leads Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80">
          <Spinner size={36} />
          <p className="text-xs text-slate-500 mt-3 animate-pulse">Loading leads directory...</p>
        </div>
      ) : displayedLeads.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 rounded-2xl p-8">
          <EmptyState
            icon="👥"
            title="No leads found matching your filter criteria"
            description="Adjust your search filters, or run the autonomous AI Lead Discovery Engine to mine verified local businesses."
            action={
              <Link
                href="/discovery"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Discovery</span>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-4 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-700">
                      {selectedIds.length === displayedLeads.length && displayedLeads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Lead / Company</th>
                  {visibleColumns.contact && <th className="p-4">Contact</th>}
                  {visibleColumns.source && <th className="p-4">Source & Industry</th>}
                  {visibleColumns.score && <th className="p-4 text-center">Score</th>}
                  {visibleColumns.status && <th className="p-4">Stage</th>}
                  {visibleColumns.assigned && <th className="p-4">Assigned To</th>}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedLeads.map((lead) => {
                  const isChecked = selectedIds.includes(lead._id);
                  return (
                    <tr
                      key={lead._id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all ${
                        isChecked ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="p-4">
                        <button
                          onClick={() => toggleSelectLead(lead._id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Company & Name */}
                      <td className="p-4">
                        <Link
                          href={`/leads/${lead._id}`}
                          className="flex items-center gap-3 no-underline group"
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                              lead.leadStatus === 'Hot'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : lead.leadStatus === 'Warm'
                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                : 'bg-blue-50 text-blue-600 border border-blue-200'
                            }`}
                          >
                            {(lead.companyName || lead.company || lead.name || 'L').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 truncate transition-colors">
                              {lead.companyName || lead.company || lead.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <span>{lead.name}</span>
                              {lead.city && <span>• {lead.city}</span>}
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Contact Info */}
                      {visibleColumns.contact && (
                        <td className="p-4">
                          <div className="space-y-1">
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}`}
                                className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 truncate"
                              >
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{lead.email}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[10px]">No public email</span>
                            )}
                            {lead.phone ? (
                              <a
                                href={`tel:${lead.phone}`}
                                className="flex items-center gap-1.5 text-blue-600 hover:underline truncate"
                              >
                                <Phone className="w-3 h-3 text-blue-500 shrink-0" />
                                <span>{lead.phone}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[10px]">No telephone</span>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Source & Industry */}
                      {visibleColumns.source && (
                        <td className="p-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {lead.industry || lead.businessType || 'General Business'}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            {lead.rating ? (
                              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {lead.rating} ({lead.reviewCount || 0})
                              </span>
                            ) : (
                              <span>Google Places</span>
                            )}
                            {lead.website && (
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                              >
                                <span>Site</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      )}

                      {/* Score Badge */}
                      {visibleColumns.score && (
                        <td className="p-4 text-center">
                          <LeadScoreBadge score={lead.leadScore || 50} />
                        </td>
                      )}

                      {/* Pipeline Stage Select */}
                      {visibleColumns.status && (
                        <td className="p-4">
                          <select
                            value={lead.pipelineStatus || 'New Lead'}
                            onChange={(e) => updateStatus(lead._id, e.target.value)}
                            className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                          >
                            {stagesList.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}

                      {/* Assigned To */}
                      {visibleColumns.assigned && (
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                              A
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              Aura AI Agent
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleDraftOutreach(lead._id)}
                            disabled={generating[lead._id] === 'outreach'}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 transition-all disabled:opacity-50"
                            title="Generate AI Outreach pitch"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{generating[lead._id] === 'outreach' ? 'Drafting...' : 'AI Pitch'}</span>
                          </button>

                          <Link
                            href={`/leads/${lead._id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
                          >
                            <span>Profile</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / 25) || 1}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Column Visibility Modal */}
      {showColumnsModal && (
        <Modal title="Configure Table Columns" onClose={() => setShowColumnsModal(false)}>
          <div className="space-y-3 p-2 text-xs">
            {Object.keys(visibleColumns).map((col) => (
              <label key={col} className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 capitalize">
                <input
                  type="checkbox"
                  checked={visibleColumns[col]}
                  onChange={() => setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }))}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>{col} Column</span>
              </label>
            ))}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowColumnsModal(false)}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-semibold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <Modal title="Add Verified Prospect" onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleCreateLead} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="form-group">
              <label className="input-label">Company Name *</label>
              <input
                className="input"
                required
                value={newLead.company}
                onChange={(e) => setNewLead({ ...newLead, company: e.target.value, name: newLead.name || e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Contact Person Name *</label>
              <input
                className="input"
                required
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Email Address</label>
              <input
                type="email"
                className="input"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Telephone</label>
              <input
                className="input"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Website URL</label>
              <input
                className="input"
                value={newLead.website}
                onChange={(e) => setNewLead({ ...newLead, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Location (City, Country)</label>
              <input
                className="input"
                value={newLead.country}
                onChange={(e) => setNewLead({ ...newLead, country: e.target.value })}
                placeholder="New York, USA"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Industry</label>
              <input
                className="input"
                value={newLead.businessType}
                onChange={(e) => setNewLead({ ...newLead, businessType: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="input-label">Initial AI Score (0–100)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="input"
                value={newLead.leadScore}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setNewLead({
                    ...newLead,
                    leadScore: s,
                    leadStatus: s >= 80 ? 'Hot' : s >= 60 ? 'Warm' : 'Cold',
                  });
                }}
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              >
                Create Lead
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

