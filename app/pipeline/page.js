'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner, LeadScoreBadge } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';
import {
  Kanban,
  Search,
  Plus,
  Sparkles,
  DollarSign,
  Briefcase,
  Clock,
  User,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';

export const PIPELINE_STAGES = [
  { id: 'New Lead', color: '#64748b', probability: 10 },
  { id: 'Qualified', color: '#0284c7', probability: 25 },
  { id: 'Contacted', color: '#2563eb', probability: 35 },
  { id: 'Replied', color: '#8b5cf6', probability: 50 },
  { id: 'Interested', color: '#059669', probability: 65 },
  { id: 'Meeting', color: '#0d9488', probability: 75 },
  { id: 'Proposal Sent', color: '#d97706', probability: 80 },
  { id: 'Negotiation', color: '#ea580c', probability: 85 },
  { id: 'Closed Won', color: '#16a34a', probability: 100 },
  { id: 'Contract Sent', color: '#4f46e5', probability: 90 },
  { id: 'Contract Signed', color: '#15803d', probability: 100 },
  { id: 'Payment Pending', color: '#ca8a04', probability: 95 },
  { id: 'Paid', color: '#166534', probability: 100 },
  { id: 'Completed', color: '#0f766e', probability: 100 },
  { id: 'Closed Lost', color: '#dc2626', probability: 0 },
  { id: 'Do Not Contact', color: '#991b1b', probability: 0 },
];

export default function PipelinePage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads?limit=300');
      const data = await res.json();
      if (data.success) {
        setLeads(data.data.leads || []);
      }
    } catch {
      toast.error('Failed to load pipeline leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function updateLeadStage(leadId, newStage) {
    if (!leadId || !newStage) return;
    const targetLead = leads.find((l) => l._id === leadId);
    if (!targetLead || targetLead.pipelineStatus === newStage) return;

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l._id === leadId ? { ...l, pipelineStatus: newStage } : l))
    );
    setUpdatingId(leadId);

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus: newStage }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Moved to ${newStage}`);
        if (newStage === 'Interested') {
          toast.success('🤖 AI Proposal Draft automatically queued in Approval Center');
        } else if (newStage === 'Closed Won') {
          toast.success('📝 Contract automatically generated! Check Owner Notification');
        }
      } else {
        toast.error(data.message || 'Stage update failed');
        fetchLeads(); // Revert
      }
    } catch {
      toast.error('Network error updating stage');
      fetchLeads(); // Revert
    } finally {
      setUpdatingId(null);
    }
  }

  // Drag Handlers
  function onDragStart(e, leadId) {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  }

  function onDragOver(e, stageId) {
    e.preventDefault();
    setDragOverStage(stageId);
  }

  function onDragLeave() {
    setDragOverStage(null);
  }

  function onDrop(e, targetStage) {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    setDragOverStage(null);
    setDraggedLeadId(null);
    if (leadId) {
      updateLeadStage(leadId, targetStage);
    }
  }

  const filteredLeads = useMemo(() => {
    if (!search) return leads;
    const term = search.toLowerCase();
    return leads.filter(
      (lead) =>
        (lead.companyName || lead.company || '').toLowerCase().includes(term) ||
        (lead.name || '').toLowerCase().includes(term) ||
        (lead.industry || '').toLowerCase().includes(term) ||
        (lead.city || '').toLowerCase().includes(term)
    );
  }, [leads, search]);

  // Aggregate pipeline metrics
  const metrics = useMemo(() => {
    let totalVal = 0;
    let activeCount = 0;
    let wonCount = 0;

    leads.forEach((l) => {
      const val = l.estimatedValue || l.budget?.amount || 8500;
      if (l.pipelineStatus === 'Closed Won' || l.pipelineStatus === 'Paid') {
        wonCount += 1;
        totalVal += val;
      } else if (l.pipelineStatus !== 'Closed Lost' && l.pipelineStatus !== 'Do Not Contact') {
        activeCount += 1;
        totalVal += val;
      }
    });

    const winRate = leads.length > 0 ? ((wonCount / leads.length) * 100).toFixed(0) : '25';

    return { totalVal, activeCount, wonCount, winRate };
  }, [leads]);

  return (
    <AppLayout
      title="Sales Pipeline & Opportunities"
      subtitle="Interactive Kanban board with drag-and-drop workflow advancement and automated document synthesis"
    >
      {/* Top Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pipeline Value</div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
              ${metrics.totalVal.toLocaleString()}
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Deals</div>
            <div className="text-lg font-black text-blue-600 mt-0.5">{metrics.activeCount}</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Closed Won</div>
            <div className="text-lg font-black text-emerald-600 mt-0.5">{metrics.wonCount}</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Win Rate</div>
            <div className="text-lg font-black text-purple-600 mt-0.5">{metrics.winRate}%</div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search deals by company, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/discovery"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Discovery</span>
          </Link>

          <Link
            href="/approvals"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
          >
            <span>Approval Center</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80">
          <Spinner size={36} />
        </div>
      ) : (
        /* Kanban Board Horizontal Scroll Container */
        <div className="flex gap-3 overflow-x-auto pb-6 min-h-[70vh] items-start select-none">
          {PIPELINE_STAGES.map((stage) => {
            const columnLeads = filteredLeads.filter((l) => l.pipelineStatus === stage.id);
            const isOver = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => onDragOver(e, stage.id)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, stage.id)}
                className={`w-72 shrink-0 rounded-2xl flex flex-col max-h-[calc(100vh-210px)] transition-all ${
                  isOver
                    ? 'bg-blue-50/50 dark:bg-blue-950/30 border-2 border-dashed border-blue-500'
                    : 'bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Column Header */}
                <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 rounded-t-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {stage.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      ({stage.probability}%)
                    </span>
                  </div>

                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {columnLeads.length}
                  </span>
                </div>

                {/* Column Cards List */}
                <div className="p-2.5 overflow-y-auto flex-1 flex flex-col gap-2.5">
                  {columnLeads.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 font-medium">
                      Drop deals here
                    </div>
                  ) : (
                    columnLeads.map((lead) => {
                      const dealVal = lead.estimatedValue || lead.budget?.amount || 8500;
                      const isUpdating = updatingId === lead._id;
                      const isDragging = draggedLeadId === lead._id;

                      return (
                        <div
                          key={lead._id}
                          draggable
                          onDragStart={(e) => onDragStart(e, lead._id)}
                          className={`p-3.5 bg-white dark:bg-slate-800 rounded-xl border cursor-grab active:cursor-grabbing shadow-xs hover:shadow-md transition-all ${
                            isUpdating
                              ? 'border-blue-500 ring-2 ring-blue-500/20'
                              : 'border-slate-200/80 dark:border-slate-700'
                          } ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
                        >
                          {/* Card Top: Company & Score */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <Link
                              href={`/leads/${lead._id}`}
                              className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 line-clamp-1 leading-snug"
                            >
                              {lead.companyName || lead.company || lead.name}
                            </Link>
                            <LeadScoreBadge score={lead.leadScore || 50} />
                          </div>

                          {/* Customer & Industry */}
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">
                            👤 {lead.name} {lead.city ? `• ${lead.city}` : ''}
                          </div>

                          {/* Deal Value & Probability Badge */}
                          <div className="flex items-center justify-between mb-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-0.5">
                              <DollarSign className="w-3 h-3 text-emerald-600" />
                              <span>{dealVal.toLocaleString()}</span>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                              {stage.probability}% win
                            </span>
                          </div>

                          {/* Footer: Assignee & Next Follow-up */}
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                              <User className="w-3 h-3" />
                              <span>Aura AI</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>Next: +7d</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

