'use client';
import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, CardHeader, CardTitle, CardContent,
  Badge, StatusBadge, PriorityBadge, LeadScoreBadge, Tabs, Modal, Input, Select, LoadingSkeleton
} from '@/components/ui/index';
import {
  ArrowLeft, Phone, Mail, FileText, Calendar, Clock, 
  Trash2, Edit3, Send, Sparkles, Building2, Globe, MapPin, 
  CheckCircle2, AlertCircle, MessageSquare, History, UserCheck, Check
} from 'lucide-react';

export default function LeadDetailPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  const [outreachDrafts, setOutreachDrafts] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([]);

  const fetchLead = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${id}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data.data?.lead || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleGenerateOutreach = async () => {
    setIsGeneratingOutreach(true);
    try {
      const res = await fetch(`/api/leads/${id}/personalize`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOutreachDrafts(data.data?.outreach || null);
        setActiveTab('outreach');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingOutreach(false);
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes(prev => [
      { text: newNote, date: new Date().toLocaleDateString(), author: 'Saif (Admin)' },
      ...prev
    ]);
    setNewNote('');
  };

  const handleDeleteLead = async () => {
    if (!confirm('Are you sure you want to permanently delete this lead?')) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) router.push('/leads');
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Details' },
    { id: 'outreach', label: 'AI Outreach Drafts', icon: Sparkles },
    { id: 'timeline', label: 'Activity Timeline', icon: History },
    { id: 'followups', label: '5-Step Follow-ups', icon: Clock },
    { id: 'notes', label: 'Notes & Tasks', icon: FileText },
  ];

  if (loading && !lead) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto py-8">
          <LoadingSkeleton count={6} />
        </div>
      </AppLayout>
    );
  }

  if (!lead) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Lead Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">This prospect may have been deleted.</p>
          <Link href="/leads">
            <Button variant="outline" size="sm" icon={ArrowLeft}>Back to Leads</Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/leads" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 no-underline transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Leads Directory
        </Link>
      </div>

      {/* Profile Header Card */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              {(lead.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {lead.name || 'Unnamed Prospect'}
                </h1>
                <StatusBadge status={lead.status || 'New Lead'} />
                <PriorityBadge priority={lead.priority || (lead.leadScore >= 80 ? 'Urgent' : 'Medium')} />
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {lead.companyName || lead.company || 'Private Organization'}
                </span>
                {lead.industry && <span>• {lead.industry}</span>}
                {lead.city && <span>• {lead.city}</span>}
              </div>
            </div>
          </div>

          {/* Quick Action Strip */}
          <div className="flex items-center gap-2 flex-wrap">
            {lead.phone && (
              <a href={`tel:${lead.phone}`}>
                <Button variant="outline" size="sm" icon={Phone}>
                  Call
                </Button>
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`}>
                <Button variant="outline" size="sm" icon={Mail}>
                  Email
                </Button>
              </a>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={Sparkles}
              loading={isGeneratingOutreach}
              onClick={handleGenerateOutreach}
            >
              Generate AI Pitch
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDeleteLead}
            />
          </div>
        </div>
      </Card>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tabs & Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="px-5 pt-3" />

            <div className="p-6">
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-1">Direct Email</span>
                        <span className="font-bold text-slate-800 dark:text-white">{lead.email || 'Not provided'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-1">Direct Phone</span>
                        <span className="font-bold text-slate-800 dark:text-white">{lead.phone || 'Not provided'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-1">Website URL</span>
                        <span className="font-bold text-blue-600 truncate block">
                          {lead.website ? (
                            <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer">
                              {lead.website}
                            </a>
                          ) : 'No official website found'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-1">Location</span>
                        <span className="font-bold text-slate-800 dark:text-white">{lead.city || lead.country || 'International'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Commercial Scope & Budget
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-1">Estimated Budget</span>
                        <span className="font-extrabold text-emerald-600 text-sm">{lead.budgetRaw || '$5,000 - $15,000'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-1">Project Need</span>
                        <span className="font-bold text-slate-800 dark:text-white">{lead.projectType || 'Modern SaaS Platform'}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 block mb-1">Discovery Source</span>
                        <span className="font-bold text-slate-800 dark:text-white">{lead.source || 'Google Places & Apify'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: AI Outreach Drafts */}
              {activeTab === 'outreach' && (
                <div className="space-y-4">
                  {outreachDrafts ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                            Cold Email Subject: {outreachDrafts.emailSubject || 'Digital modernization proposal'}
                          </span>
                          <Badge variant="warning">Approval Required</Badge>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                          {outreachDrafts.emailBody || 'Dear Lead, we identified high-growth opportunities for your digital operations...'}
                        </p>
                      </div>

                      {outreachDrafts.linkedinPitch && (
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block mb-1.5">
                            LinkedIn Connection Note (300 chars)
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {outreachDrafts.linkedinPitch}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">No AI Outreach Synthesized Yet</h4>
                      <p className="text-xs text-slate-500 mb-4">Click below to generate personalized email, LinkedIn, and pitch copy.</p>
                      <Button size="sm" icon={Sparkles} loading={isGeneratingOutreach} onClick={handleGenerateOutreach}>
                        Generate AI Outreach Now
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Timeline */}
              {activeTab === 'timeline' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3 relative pl-4 border-l-2 border-blue-500">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 absolute -left-[5px] top-1" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">Prospect Added & Scored</span>
                      <p className="text-slate-500">Lead assigned score {lead.leadScore || 75}/100 based on digital footprint.</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(lead.createdAt || Date.now()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: 5-Step Follow-ups */}
              {activeTab === 'followups' && (
                <div className="space-y-3">
                  {[
                    { step: 1, delay: '+7 days', title: 'Value & Case Study Introduction' },
                    { step: 2, delay: '+14 days', title: 'Specific ROI & Cost Efficiency Demo' },
                    { step: 3, delay: '+21 days', title: 'Executive Follow-up with Direct Calendar Link' },
                    { step: 4, delay: '+28 days', title: 'Feature Spotlight & Client Benchmark' },
                    { step: 5, delay: '+35 days', title: 'Breakup & Permission to Archive Inquiries' },
                  ].map((s) => (
                    <div key={s.step} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-[10px]">
                          {s.step}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">{s.title}</span>
                          <span className="text-[10px] text-slate-400 block">{s.delay}</span>
                        </div>
                      </div>
                      <Badge variant="neutral">Cadence Scheduled</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 5: Notes & Tasks */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add an internal note or task for this prospect..."
                      rows={3}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-end">
                      <Button size="sm" type="submit">Add Note</Button>
                    </div>
                  </form>

                  <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {notes.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No internal notes yet.</p>
                    ) : (
                      notes.map((n, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800">
                          <p className="text-slate-800 dark:text-slate-200">{n.text}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                            <span>{n.author}</span>
                            <span>{n.date}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Summary Panel */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Prospect Telemetry & Health
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Lead Score</span>
                <LeadScoreBadge score={lead.leadScore || 75} status={lead.leadStatus || 'Warm'} />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Pipeline Stage</span>
                <StatusBadge status={lead.status || 'New Lead'} />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Assigned Rep</span>
                <span className="font-bold text-slate-800 dark:text-white">{lead.assignedTo || 'Saif (Admin)'}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Estimated Value</span>
                <span className="font-extrabold text-emerald-600">{lead.budgetRaw || '$5,000 - $15,000'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Autonomous Killswitch</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
