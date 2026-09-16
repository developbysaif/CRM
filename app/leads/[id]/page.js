'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { LeadScoreBadge, Spinner } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';
import { PIPELINE_STAGES } from '@/app/pipeline/page';
import {
  Phone,
  Mail,
  MessageSquare,
  CheckSquare,
  FileText,
  Clock,
  ExternalLink,
  Sparkles,
  Building2,
  User,
  Star,
  ArrowLeft,
  Send,
  ShieldCheck,
  ShieldAlert,
  Check,
  ChevronRight,
  Plus,
  MapPin,
  Calendar,
} from 'lucide-react';


export default function LeadDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personalization'); // 'personalization' | 'email_thread' | 'audit' | 'followups' | 'proposals' | 'overview'
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Email reply composer
  const [replyText, setReplyText] = useState('');
  const [replySubject, setReplySubject] = useState('');

  // Personalization state
  const [personalization, setPersonalization] = useState(null);

  const fetchLead = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setNotes(result.data?.lead?.notes || '');
      }
    } catch {
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchLead();
  }, [id, fetchLead]);

  // Load or generate AI personalization
  const loadPersonalization = useCallback(async () => {
    try {
      const res = await fetch(`/api/leads/${id}/personalize`);
      const result = await res.json();
      if (result.success) {
        setPersonalization(result.data?.personalization);
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    if (id) loadPersonalization();
  }, [id, loadPersonalization]);

  const lead = data?.lead;
  const proposals = data?.proposals || [];
  const contracts = data?.contracts || [];
  const activities = data?.activities || [];
  const audit = data?.audit;
  const followUps = data?.followUps || [];
  const emailThread = data?.emailThread;

  async function updateStage(newStage) {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStatus: newStage }),
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success(`Pipeline stage set to "${newStage}"`);
        if (newStage === 'Interested') {
          toast.success('📄 AI Proposal Draft queued in Approval Center');
        } else if (newStage === 'Closed Won') {
          toast.success('📝 Contract generated in DRAFT! Check Owner Alert');
        }
        fetchLead();
      } else {
        toast.error(resData.message);
      }
    } catch {
      toast.error('Failed to update stage');
    }
  }

  async function saveNotes() {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        toast.success('Notes saved successfully');
        fetchLead();
      }
    } catch {
      toast.error('Failed to save notes');
    }
  }

  async function handleEnqueueOutreach() {
    setActionLoading('enqueue');
    try {
      const res = await fetch(`/api/leads/${id}/personalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enqueue: true }),
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success('AI Outreach Draft sent to Approval Center!');
      } else {
        toast.error(resData.message);
      }
    } catch {
      toast.error('Failed to enqueue outreach');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSendReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;
    setActionLoading('reply');
    try {
      const res = await fetch(`/api/email/threads/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyText,
          subject: replySubject || `Re: Discussion with ${lead.companyName || lead.name}`,
          sendNow: false,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success('Reply submitted to Approval Center for review!');
        setReplyText('');
        fetchLead();
      } else {
        toast.error(resData.message);
      }
    } catch {
      toast.error('Failed to draft reply');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTriggerAudit() {
    if (!lead?.website) {
      toast.error('Lead has no recorded website URL to audit');
      return;
    }
    setActionLoading('audit');
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: lead.website }),
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success('Website audit completed!');
        fetchLead();
        setActiveTab('audit');
      } else {
        toast.error(resData.message);
      }
    } catch {
      toast.error('Audit failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateProposalDraft() {
    setActionLoading('prop');
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id }),
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success('Proposal generated in DRAFT! Check Approval Center.');
        fetchLead();
        setActiveTab('proposals');
      } else {
        toast.error(resData.message);
      }
    } catch {
      toast.error('Failed to create proposal');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCreateContractDraft() {
    setActionLoading('con');
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: id }),
      });
      const resData = await res.json();
      if (resData.success) {
        toast.success('Contract generated in DRAFT! Check Approval Center.');
        fetchLead();
      } else {
        toast.error(resData.message);
      }
    } catch {
      toast.error('Failed to create contract');
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <AppLayout title="Lead Profile">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spinner size={36} />
        </div>
      </AppLayout>
    );
  }

  if (!lead) {
    return (
      <AppLayout title="Lead Profile">
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <h3>Lead not found</h3>
          <Link href="/leads" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
            Return to Directory
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={lead.companyName || lead.company || lead.name}
      subtitle={`Verified ${lead.industry || 'B2B'} Prospect · ${lead.city || lead.country || 'Location Unspecified'}`}
    >
      {/* Back Link Breadcrumb */}
      <div className="mb-4">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Leads Directory</span>
        </Link>
      </div>

      {/* Top Profile Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 mb-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Company & Identity */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-black shrink-0 shadow-md shadow-blue-500/20">
              {(lead.companyName || lead.company || lead.name || 'B').charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  {lead.companyName || lead.company || lead.name}
                </h1>
                <LeadScoreBadge score={lead.leadScore || 50} />
                {lead.doNotContact && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200 uppercase">
                    Do Not Contact 🚫
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {lead.name || 'Direct Contact'}
                </span>
                {lead.phone && (
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    {lead.phone}
                  </a>
                )}
                {lead.email && (
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-slate-600 hover:text-blue-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {lead.email}
                  </a>
                )}
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" />
                    {lead.domain || 'Website'}
                  </a>
                ) : (
                  <span className="text-red-500 font-semibold text-[11px]">No Website</span>
                )}
                {lead.rating && (
                  <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {lead.rating} ({lead.reviewCount || 0})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Lifecycle Stage Selector */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stage:</span>
            <select
              value={lead.pipelineStatus || 'New Lead'}
              onChange={(e) => updateStage(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.id}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Dedicated CTA Section */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          {/* 1. Call */}
          <a
            href={lead.phone ? `tel:${lead.phone}` : '#'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              lead.phone
                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                : 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>

          {/* 2. Email */}
          <button
            onClick={() => setActiveTab('email_thread')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200/80 text-slate-700 dark:text-slate-200 transition-all"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>Email</span>
          </button>

          {/* 3. Message */}
          <button
            onClick={() => setActiveTab('personalization')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 hover:bg-indigo-100 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Message / Pitch</span>
          </button>

          {/* 4. Create Task */}
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
            <span>Create Task</span>
          </Link>

          {/* 5. Send Proposal */}
          <button
            onClick={handleCreateProposalDraft}
            disabled={actionLoading === 'prop'}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 hover:bg-amber-100 transition-all disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>{actionLoading === 'prop' ? 'Drafting...' : 'Send Proposal'}</span>
          </button>

          {/* 6. Schedule Follow-up */}
          <button
            onClick={() => setActiveTab('followups')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 border border-teal-200 hover:bg-teal-100 transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>


      {/* 2-Column Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'flex-start' }}>
        {/* Left / Main Content Column */}
        <div>
          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              borderBottom: '1px solid #e2e8f0',
              marginBottom: 20,
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'personalization', label: 'AI Personalization & Outreach', icon: '🤖' },
              { id: 'email_thread', label: `Gmail Thread (${emailThread?.messages?.length || 0})`, icon: '✉️' },
              { id: 'audit', label: `Website Audit ${audit ? `(${audit.overallScore}/100)` : ''}`, icon: '🔍' },
              { id: 'followups', label: `5-Step Follow-ups (${followUps.length})`, icon: '⏱️' },
              { id: 'proposals', label: `Proposals (${proposals.length})`, icon: '📄' },
              { id: 'overview', label: 'Notes & Timeline', icon: '📝' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '9px 14px',
                  fontSize: 13,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? '#2563eb' : '#64748b',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: AI Personalization & Multi-Channel Messaging */}
          {activeTab === 'personalization' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {personalization ? (
                <>
                  {/* Executive Pain Points & Recommended Pitch */}
                  <div className="card" style={{ padding: 20, borderLeft: '4px solid #2563eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                          Targeted Commercial Assessment
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '2px 0 0 0' }}>
                          {personalization.companySummary}
                        </h3>
                      </div>
                      <button
                        onClick={handleEnqueueOutreach}
                        disabled={actionLoading === 'enqueue'}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: 12 }}
                      >
                        {actionLoading === 'enqueue' ? 'Submitting...' : '🛡️ Send to Approval Center'}
                      </button>
                    </div>

                    <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
                      <strong>Core Business Gap: </strong>
                      {personalization.businessProblem}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {personalization.painPoints?.map((p, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 12,
                            padding: '3px 10px',
                            borderRadius: 12,
                            background: '#fee2e2',
                            color: '#991b1b',
                            fontWeight: 500,
                          }}
                        >
                          ⚠️ {p}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        background: '#f0fdf4',
                        padding: '10px 14px',
                        borderRadius: 6,
                        border: '1px solid #bbf7d0',
                        fontSize: 13,
                        color: '#166534',
                      }}
                    >
                      <strong>Recommended Solution: </strong> {personalization.recommendedService}
                    </div>
                  </div>

                  {/* Cold Email Draft */}
                  <div className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        ✉️ AI Tailored Cold Email Draft
                      </h4>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Human Approval Required Prior to Sending</span>
                    </div>

                    <div style={{ marginBottom: 10, fontSize: 13, color: '#334155' }}>
                      <strong>Subject: </strong>
                      <span style={{ fontFamily: 'monospace' }}>{personalization.emailSubject}</span>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        padding: 16,
                        fontSize: 13,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        color: '#1e293b',
                      }}
                    >
                      {personalization.coldEmail}
                    </div>
                  </div>

                  {/* Multi-channel snippets: LinkedIn & WhatsApp */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="card" style={{ padding: 18 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0077b5', marginBottom: 8 }}>
                        🔗 LinkedIn Connection Note
                      </h4>
                      <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: 12, borderRadius: 6 }}>
                        {personalization.linkedInMessage}
                      </div>
                    </div>

                    <div className="card" style={{ padding: 18 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#25d366', marginBottom: 8 }}>
                        💬 WhatsApp / SMS Message
                      </h4>
                      <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5, background: '#f8fafc', padding: 12, borderRadius: 6 }}>
                        {personalization.whatsAppMessage}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                  <Spinner size={28} />
                  <div style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>
                    Synthesizing AI personalization based on verified digital signals...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Gmail-Style Email Thread */}
          {activeTab === 'email_thread' && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    ✉️ Conversation Timeline
                  </h3>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Recipient: <strong>{lead.email || 'No email registered'}</strong>
                  </div>
                </div>

                {emailThread?.aiIntent && emailThread.aiIntent !== 'None' && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 12,
                      background: '#dbeafe',
                      color: '#1d4ed8',
                    }}
                  >
                    Client Intent: {emailThread.aiIntent}
                  </span>
                )}
              </div>

              {/* Messages Chronological List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {emailThread?.messages && emailThread.messages.length > 0 ? (
                  emailThread.messages.map((msg, idx) => {
                    const isOutbound = msg.direction === 'outbound';
                    return (
                      <div
                        key={idx}
                        style={{
                          background: isOutbound ? '#eff6ff' : '#f8fafc',
                          border: isOutbound ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                          borderRadius: 8,
                          padding: 14,
                          marginLeft: isOutbound ? 36 : 0,
                          marginRight: isOutbound ? 0 : 36,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: '#64748b' }}>
                          <span style={{ fontWeight: 700, color: isOutbound ? '#1e40af' : '#334155' }}>
                            {isOutbound ? '📤 Outbound (You)' : `📥 Inbound (${lead.name})`}
                          </span>
                          <span>{new Date(msg.sentAt || msg.receivedAt || msg.createdAt).toLocaleString()}</span>
                        </div>

                        {msg.subject && (
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                            Subject: {msg.subject}
                          </div>
                        )}

                        <div style={{ fontSize: 13, lineHeight: 1.5, color: '#0f172a', whiteSpace: 'pre-wrap' }}>
                          {msg.bodyText}
                        </div>

                        {msg.aiClassification?.intent && msg.aiClassification.intent !== 'None' && (
                          <div
                            style={{
                              marginTop: 8,
                              paddingTop: 6,
                              borderTop: '1px solid #e2e8f0',
                              fontSize: 11,
                              color: '#6366f1',
                            }}
                          >
                            🤖 Classified as: <strong>{msg.aiClassification.intent}</strong> ({msg.aiClassification.reasoning})
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No recorded email exchanges yet. Draft outreach above or use the reply box below.
                  </div>
                )}
              </div>

              {/* Compose Reply Form */}
              <form onSubmit={handleSendReply} style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  Draft Reply (Gates through Approval Center)
                </h4>
                <input
                  className="input"
                  style={{ marginBottom: 8, fontSize: 13 }}
                  placeholder="Subject line..."
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                />
                <textarea
                  className="input"
                  rows={4}
                  style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}
                  placeholder={
                    emailThread?.suggestedReply
                      ? `Suggested reply: "${emailThread.suggestedReply}"`
                      : 'Type your reply...'
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {emailThread?.suggestedReply && (
                    <button
                      type="button"
                      onClick={() => setReplyText(emailThread.suggestedReply)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11 }}
                    >
                      Use AI Suggested Reply
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={actionLoading === 'reply' || !replyText.trim()}
                    className="btn btn-primary btn-sm"
                  >
                    {actionLoading === 'reply' ? 'Drafting...' : '🛡️ Queue in Approval Center'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Website Audit Report */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {audit ? (
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                        Enterprise Web Architecture Audit
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                        {audit.hostname || audit.url}
                      </h3>
                    </div>

                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: audit.overallScore >= 80 ? '#dcfce7' : audit.overallScore >= 60 ? '#fef3c7' : '#fee2e2',
                        color: audit.overallScore >= 80 ? '#15803d' : audit.overallScore >= 60 ? '#b45309' : '#b91c1c',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: 18,
                      }}
                    >
                      <span>{audit.overallScore}</span>
                      <span style={{ fontSize: 9, fontWeight: 600 }}>/ 100</span>
                    </div>
                  </div>

                  {/* 5 Sub-category Scores Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
                    {[
                      { label: '⚡ Performance', score: audit.performance?.score, grade: audit.performance?.grade },
                      { label: '🔍 SEO Architecture', score: audit.seo?.score, grade: audit.seo?.grade },
                      { label: '📱 Mobile Touch', score: audit.mobile?.score, grade: audit.mobile?.grade },
                      { label: '♿ Accessibility', score: audit.accessibility?.score, grade: audit.accessibility?.grade },
                      { label: '🔒 Security Headers', score: audit.security?.score, grade: audit.security?.grade },
                    ].map((cat, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{cat.label}</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                          {cat.score ?? 'N/A'}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: '#e2e8f0' }}>
                          Grade {cat.grade || 'C'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Problems & Opportunities */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div style={{ background: '#fef2f2', padding: 14, borderRadius: 8, border: '1px solid #fecaca' }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', margin: '0 0 8px 0' }}>
                        Critical Problems Observed
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#7f1d1d', lineHeight: 1.5 }}>
                        {audit.problems?.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 8, border: '1px solid #bbf7d0' }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#166534', margin: '0 0 8px 0' }}>
                        Commercial Opportunities
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#14532d', lineHeight: 1.5 }}>
                        {audit.opportunities?.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Summary & Recommended Services */}
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: 12, borderRadius: 6 }}>
                    <strong>Technical Summary: </strong> {audit.summary}
                  </div>
                </div>
              ) : (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>No Audit Report Found</h3>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                    Run a deep performance, SEO, security, and mobile touch audit for this prospect's web domain.
                  </p>
                  <button
                    onClick={handleTriggerAudit}
                    disabled={actionLoading === 'audit' || !lead?.website}
                    className="btn btn-primary btn-sm"
                  >
                    {actionLoading === 'audit' ? 'Auditing Domain...' : '🔍 Run Audit Report Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 5-Step Follow-Up Sequence */}
          {activeTab === 'followups' && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    ⏱️ 5-Step Automated Follow-Up Sequence
                  </h3>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    7-day cadence between messages. Hard abort on reply, interested, or unsubscribe.
                  </div>
                </div>
              </div>

              {followUps.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {followUps.map((fu) => {
                    const statusColors = {
                      scheduled: '#d97706',
                      approval_required: '#2563eb',
                      sent: '#16a34a',
                      cancelled: '#94a3b8',
                    };

                    return (
                      <div
                        key={fu._id}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          padding: 14,
                          background: fu.status === 'cancelled' ? '#f8fafc' : '#ffffff',
                          opacity: fu.status === 'cancelled' ? 0.7 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: 12,
                                background: '#eff6ff',
                                color: '#1d4ed8',
                              }}
                            >
                              Step {fu.step} of 5
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                              {fu.stepName}
                            </span>
                          </div>

                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: statusColors[fu.status] || '#64748b',
                              textTransform: 'uppercase',
                            }}
                          >
                            {fu.status}
                          </span>
                        </div>

                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                          Scheduled for: <strong>{new Date(fu.scheduledFor).toLocaleDateString()}</strong>
                          {fu.cancellationReason && (
                            <span style={{ color: '#dc2626', marginLeft: 10 }}>
                              🚫 Cancelled: {fu.cancellationReason}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: 12, color: '#334155', background: '#f8fafc', padding: 10, borderRadius: 6, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                          <strong>Subject: {fu.subject}</strong>
                          <br /><br />
                          {fu.body}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No follow-up sequence currently active. Once initial outreach is approved and sent, the 5-step follow-up timeline is scheduled here automatically.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Proposals & Contracts */}
          {activeTab === 'proposals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Proposals List */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    📄 Client Proposals
                  </h3>
                  <button onClick={handleCreateProposalDraft} className="btn btn-secondary btn-sm">
                    + Generate New Proposal
                  </button>
                </div>

                {proposals.length > 0 ? (
                  proposals.map((p) => (
                    <div
                      key={p._id}
                      style={{
                        padding: 14,
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        marginBottom: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {p.proposalNumber} · {p.proposalTitle || 'Strategic Proposal'}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          Total: <strong>${(p.pricing?.total || 0).toLocaleString()}</strong> · Status: <strong>{p.status}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link href={`/proposals/${p._id}`} target="_blank" className="btn btn-secondary btn-sm">
                          Preview & PDF
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px 10px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No proposals generated yet. Click above or move lead to 'Interested' to auto-generate.
                  </div>
                )}
              </div>

              {/* Contracts List */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    📝 Legal Service Contracts
                  </h3>
                  <button onClick={handleCreateContractDraft} className="btn btn-secondary btn-sm">
                    + Prepare Contract
                  </button>
                </div>

                {contracts.length > 0 ? (
                  contracts.map((c) => (
                    <div
                      key={c._id}
                      style={{
                        padding: 14,
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        marginBottom: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {c.contractNumber} · {c.projectName}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                          Total: <strong>${(c.totalAmount || 0).toLocaleString()}</strong> · Status: <strong>{c.status}</strong>
                        </div>
                      </div>

                      <Link href={`/contracts/${c._id}`} target="_blank" className="btn btn-secondary btn-sm">
                        Preview & Sign
                      </Link>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px 10px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No contracts generated yet. Moving lead to 'Closed Won' automatically creates the draft contract.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Overview, Notes & Activity Timeline */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Internal Notes Editor */}
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  📝 Internal Notes & Deal Strategy
                </h4>
                <textarea
                  className="input"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record discovery findings, custom pricing commitments, or call logs..."
                />
                <button onClick={saveNotes} className="btn btn-secondary btn-sm" style={{ marginTop: 10 }}>
                  Save Notes
                </button>
              </div>

              {/* Activity Timeline */}
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
                  📋 Activity History
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activities.map((act) => (
                    <div key={act._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
                      <span style={{ fontSize: 16 }}>📌</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{act.title}</div>
                        <div style={{ color: '#64748b' }}>{act.description}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                          {new Date(act.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: AI Intelligence & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* AI Score & Valuation Card */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                AI Lead Intelligence
              </span>
              <LeadScoreBadge score={lead.leadScore} status={lead.leadStatus} />
            </div>

            <div
              style={{
                fontSize: 13,
                color: '#1e293b',
                lineHeight: 1.5,
                background: '#f8fafc',
                padding: 12,
                borderRadius: 8,
                marginBottom: 14,
                border: '1px solid #e2e8f0',
              }}
            >
              <strong style={{ color: '#2563eb' }}>Why is this lead valuable?</strong>
              <div style={{ marginTop: 4 }}>
                {lead.whyValuable || lead.aiSummary || 'Lead shows active real-world commercial footprint.'}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Recommended Next Action
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                👉 {lead.nextAction || 'Send initial outreach email'}
              </div>
            </div>

            {lead.nextFollowUpDate && (
              <div style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>
                ⏱️ Next Follow-up: {new Date(lead.nextFollowUpDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Pipeline Stage Switcher Card */}
          <div className="card" style={{ padding: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
              Sales Pipeline Stage
            </label>
            <select
              className="input"
              value={lead.pipelineStatus}
              onChange={(e) => updateStage(e.target.value)}
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}
                </option>
              ))}
            </select>

            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
              Changing to <strong>Interested</strong> auto-prepares a proposal. Changing to <strong>Closed Won</strong> auto-prepares a contract.
            </div>
          </div>

          {/* Prospect Contact & Address Overview */}
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
              Prospect Meta & Geography
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#475569' }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Category: </span>
                <strong>{lead.category || lead.industry || 'General'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Location: </span>
                <strong>{lead.address || lead.city || 'N/A'}</strong>
              </div>
              {lead.googlePlaceId && (
                <div>
                  <span style={{ color: '#94a3b8' }}>Google Place ID: </span>
                  <strong style={{ fontSize: 11, fontFamily: 'monospace' }}>{lead.googlePlaceId}</strong>
                </div>
              )}
              <div>
                <span style={{ color: '#94a3b8' }}>Source: </span>
                <strong>{lead.source || 'Direct Entry'}</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Created: </span>
                <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
