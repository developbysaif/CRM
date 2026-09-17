'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent,
  Badge, PriorityBadge, LeadScoreBadge, LoadingSkeleton, EmptyState, Modal, Input, Select
} from '@/components/ui/index';
import {
  Search, Plus, Filter, DollarSign, Trophy, 
  GitPullRequest, ArrowUpRight, Building2, User, Calendar
} from 'lucide-react';

const PIPELINE_COLUMNS = [
  { id: 'New Lead', label: 'New', color: 'border-blue-500 bg-blue-50/20' },
  { id: 'Qualified', label: 'Qualified', color: 'border-indigo-500 bg-indigo-50/20' },
  { id: 'Proposal Sent', label: 'Proposal', color: 'border-amber-500 bg-amber-50/20' },
  { id: 'Negotiation', label: 'Negotiation', color: 'border-purple-500 bg-purple-50/20' },
  { id: 'Closed Won', label: 'Won', color: 'border-emerald-500 bg-emerald-50/20' },
  { id: 'Closed Lost', label: 'Lost', color: 'border-red-500 bg-red-50/20' },
];

export default function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: '',
    company: '',
    email: '',
    budgetRaw: '$10,000',
    status: 'New Lead',
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leads?limit=100');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.data?.leads || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleDragStart = (id) => {
    setDraggedLeadId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (columnId) => {
    if (!draggedLeadId) return;
    const targetId = draggedLeadId;
    setDraggedLeadId(null);

    // Optimistic UI update
    setLeads(prev => prev.map(l => l._id === targetId ? { ...l, status: columnId } : l));

    try {
      await fetch(`/api/leads/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: columnId }),
      });
    } catch (err) {
      console.error('Failed to update stage', err);
      fetchLeads();
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal),
      });
      if (res.ok) {
        setIsAddDealModalOpen(false);
        setNewDeal({ name: '', company: '', email: '', budgetRaw: '$10,000', status: 'New Lead' });
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLeads = leads.filter(l => {
    const q = search.toLowerCase();
    const name = (l.name || '').toLowerCase();
    const company = (l.companyName || l.company || '').toLowerCase();
    return name.includes(q) || company.includes(q);
  });

  // Calculate metrics
  const totalDeals = leads.length;
  const wonDeals = leads.filter(l => l.status === 'Closed Won').length;
  const winRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Deals & Pipeline Kanban
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Drag-and-drop active opportunities between stages to update deal velocity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddDealModalOpen(true)}
          >
            Create Deal
          </Button>
        </div>
      </div>

      {/* Pipeline KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Deals</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{totalDeals}</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Closed Won</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">{wonDeals} deals</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pipeline Win Rate</span>
          <span className="text-xl font-black text-blue-600 mt-1 block">{winRate}%</span>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pipeline Health</span>
          <span className="text-xl font-black text-indigo-600 mt-1 block">Optimal</span>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px]">
        {PIPELINE_COLUMNS.map((col) => {
          const colLeads = filteredLeads.filter(l => (l.status || 'New Lead') === col.id);
          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
              className="w-72 shrink-0 flex flex-col rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{col.label}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {colLeads.length}
                  </span>
                </div>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-3 overflow-y-auto min-h-[150px]">
                {loading ? (
                  <LoadingSkeleton count={2} />
                ) : colLeads.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                    Drop deals here
                  </div>
                ) : (
                  colLeads.map((deal) => (
                    <div
                      key={deal._id}
                      draggable
                      onDragStart={() => handleDragStart(deal._id)}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link
                          href={`/leads/${deal._id}`}
                          className="font-bold text-xs text-slate-900 dark:text-white hover:text-blue-600 transition-colors block line-clamp-1 no-underline"
                        >
                          {deal.companyName || deal.company || deal.name}
                        </Link>
                        <LeadScoreBadge score={deal.leadScore || 75} />
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{deal.name || 'Alex Morgan'}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <span className="font-extrabold text-emerald-600">
                          {deal.budgetRaw || '$8,500'}
                        </span>
                        <PriorityBadge priority={deal.leadScore >= 80 ? 'Urgent' : 'Medium'} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deal Modal */}
      <Modal
        isOpen={isAddDealModalOpen}
        onClose={() => setIsAddDealModalOpen(false)}
        title="Create New Pipeline Deal"
      >
        <form onSubmit={handleCreateDeal} className="space-y-4">
          <Input
            label="Deal / Prospect Name"
            required
            value={newDeal.name}
            onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
            placeholder="e.g. Enterprise Cloud Migration"
          />
          <Input
            label="Company Name"
            required
            value={newDeal.company}
            onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })}
            placeholder="e.g. Zenith Tech Solutions"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Email"
              type="email"
              required
              value={newDeal.email}
              onChange={(e) => setNewDeal({ ...newDeal, email: e.target.value })}
              placeholder="contact@zenith.com"
            />
            <Input
              label="Estimated Value"
              value={newDeal.budgetRaw}
              onChange={(e) => setNewDeal({ ...newDeal, budgetRaw: e.target.value })}
              placeholder="$15,000"
            />
          </div>
          <Select
            label="Starting Stage"
            options={PIPELINE_COLUMNS.map(c => ({ value: c.id, label: c.label }))}
            value={newDeal.status}
            onChange={(e) => setNewDeal({ ...newDeal, status: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsAddDealModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Deal
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
