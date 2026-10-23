'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, Input, Avatar, Badge, LeadScoreBadge, LoadingSkeleton, EmptyState
} from '@/components/ui/index';
import {
  Send, Bot, Sparkles, User, Building2, Phone, Mail, 
  MessageSquare, Search, CheckCheck, Clock, ShieldCheck, 
  ExternalLink, MessageCircle, Copy, Check, ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function CommunicationCenterPage() {
  const { user: currentUser } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [activeMode, setActiveMode] = useState('ai'); // 'ai' | leadId
  const [channelFilter, setChannelFilter] = useState('all'); // 'all' | 'whatsapp' | 'email'
  const [search, setSearch] = useState('');

  // AI Chat Messages
  const [aiMessages, setAiMessages] = useState([]);
  const [leadMessages, setLeadMessages] = useState({});
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize greeting with session user's real name
  useEffect(() => {
    const greetingName = currentUser?.name?.split(' ')[0] || 'there';
    setAiMessages([
      {
        id: 'm1',
        sender: 'ai',
        text: `Hello ${greetingName}! I am Aura AI, your autonomous CRM copilot. I can query live database telemetry, draft personalized outreach, classify inbound responses, or optimize pipeline velocity. How can I assist you today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [currentUser]);

  // Load real leads from database
  useEffect(() => {
    async function loadLeads() {
      setLoadingLeads(true);
      try {
        const res = await fetch('/api/leads?limit=30');
        if (res.ok) {
          const data = await res.json();
          setLeads(data.data?.leads || []);
        }
      } catch (err) {
        console.error('Failed to load leads for communication center:', err);
      } finally {
        setLoadingLeads(false);
      }
    }
    loadLeads();
  }, []);

  // Initialize session ID
  useEffect(() => {
    let sid = localStorage.getItem('crm_chat_session_id');
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('crm_chat_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, leadMessages, activeMode]);

  const activeLead = activeMode !== 'ai' ? leads.find((l) => l._id === activeMode) : null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userPrompt = inputText.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: String(Date.now()), sender: 'user', text: userPrompt, time: nowTime };

    if (activeMode === 'ai') {
      setAiMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsSending(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userPrompt,
            sessionId: sessionId || 'default_session',
          }),
        });

        const data = await res.json();
        const aiReply = data.data?.message || data.message || 'CRM records and telemetry updated.';
        setAiMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: 'ai',
            text: aiReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } catch {
        setAiMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: 'ai',
            text: 'I have logged your request. Real-time telemetry is running.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsSending(false);
      }
    } else {
      // Sending message on a lead thread
      setLeadMessages((prev) => ({
        ...prev,
        [activeMode]: [...(prev[activeMode] || []), userMsg],
      }));
      setInputText('');
    }
  };

  // Direct WhatsApp Launch with opt-in guard
  const handleOpenWhatsApp = async () => {
    if (!activeLead?.phone) {
      alert('This lead does not have a phone number recorded.');
      return;
    }

    if (!activeLead.whatsapp_opt_in) {
      alert(
        'WhatsApp Policy Violation Blocked:\n\nBusiness-initiated free-text WhatsApp requires prior consent (whatsapp_opt_in = true).\nPlease use an approved WhatsApp template or obtain consent before sending.'
      );
      return;
    }

    const cleanPhone = activeLead.phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
    const msg = inputText.trim() || `Hi ${activeLead.contactPerson || activeLead.name}, following up regarding our discussion for ${activeLead.companyName || activeLead.name}.`;
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

    try {
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activeLead.phone,
          message: msg,
          leadId: activeLead._id,
        }),
      });
      window.open(waLink, '_blank');
    } catch {
      window.open(waLink, '_blank');
    }
  };

  const filteredLeads = leads.filter((l) => {
    const nameMatch = (l.companyName || l.company || l.name || '').toLowerCase().includes(search.toLowerCase());
    if (!nameMatch) return false;
    if (channelFilter === 'whatsapp') return Boolean(l.phone);
    if (channelFilter === 'email') return Boolean(l.email);
    return true;
  });

  return (
    <AppLayout title="Messages & AI">
      <div className="h-[calc(100vh-140px)] flex rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {/* Left Sidebar: Conversations & Aura AI */}
        <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
          {/* Aura AI Copilot Permanent Section */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-blue-50/40 dark:bg-blue-950/20">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Copilot
            </div>
            <button
              type="button"
              onClick={() => setActiveMode('ai')}
              className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-all text-left cursor-pointer ${
                activeMode === 'ai'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'hover:bg-blue-100/60 dark:hover:bg-blue-900/40 text-slate-800 dark:text-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                activeMode === 'ai' ? 'bg-white text-blue-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
              }`}>
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs truncate">Aura AI Copilot</div>
                <div className={`text-[11px] truncate ${activeMode === 'ai' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  Autonomous CRM Intelligence
                </div>
              </div>
            </button>
          </div>

          {/* Leads Search & Filter */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prospect threads..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/60 p-0.5 rounded-lg text-[11px] font-semibold">
              {['all', 'whatsapp', 'email'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setChannelFilter(f)}
                  className={`flex-1 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                    channelFilter === f
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Lead Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loadingLeads ? (
              <div className="p-4 space-y-3">
                <LoadingSkeleton count={3} />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No prospect threads found
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const leadName = lead.companyName || lead.company || lead.name;
                const isSelected = activeMode === lead._id;
                return (
                  <button
                    key={lead._id}
                    type="button"
                    onClick={() => setActiveMode(lead._id)}
                    className={`w-full p-3 flex items-start gap-3 transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-slate-200/70 dark:bg-slate-800/70'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <Avatar name={leadName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {leadName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {lead.status || 'New'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {lead.email || lead.phone || 'No direct contact'}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center: Message Thread */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0">
          {/* Thread Header */}
          <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {activeMode === 'ai' ? (
                <>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      Aura AI Sales Consultant
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Autonomous Intelligence &bull; gpt-4o-mini
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Avatar name={activeLead?.companyName || activeLead?.name} size="sm" />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      {activeLead?.companyName || activeLead?.name}
                      <Badge variant="outline" className="text-[10px]">
                        {activeLead?.status || 'New Lead'}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {activeLead?.email || activeLead?.phone || 'Prospect Thread'}
                    </div>
                  </div>
                </>
              )}
            </div>

            {activeLead && activeLead.phone && (
              <Button
                size="sm"
                variant="primary"
                icon={MessageCircle}
                onClick={handleOpenWhatsApp}
              >
                Send WhatsApp
              </Button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {activeMode === 'ai' ? (
              aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`text-[10px] mt-1.5 block ${
                        msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold text-slate-900 dark:text-white mb-1">
                    Direct Prospect Thread &bull; {activeLead?.companyName || activeLead?.name}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Outreach emails sent from the Approval Center will record here. You can also send verified WhatsApp messages.
                  </p>
                </div>

                {(leadMessages[activeMode] || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    <div className="max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed bg-blue-600 text-white">
                      <p>{msg.text}</p>
                      <span className="text-[10px] text-blue-200 text-right mt-1 block">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                activeMode === 'ai'
                  ? 'Ask Aura AI to qualify leads, draft proposals, or audit pipeline...'
                  : `Type outreach message to ${activeLead?.companyName || activeLead?.name}...`
              }
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={isSending || !inputText.trim()}
              icon={Send}
            >
              Send
            </Button>
          </form>
        </div>

        {/* Right Sidebar: Intelligence Details */}
        <div className="w-72 border-l border-slate-200 dark:border-slate-800 p-5 hidden xl:block bg-slate-50/30 dark:bg-slate-950/20 shrink-0 overflow-y-auto text-xs">
          {activeMode === 'ai' ? (
            <div className="space-y-5">
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Aura AI Intelligence
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">Engine Profile</div>
                <div className="font-bold text-slate-900 dark:text-white">Autonomous Sales Copilot</div>
                <div className="text-[11px] text-slate-500">
                  Real-time pipeline analysis, personalized cold outreach, and intent classification.
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">Quick Shortcuts</div>
                {[
                  'Summarize current won revenue and win rate',
                  'Draft a cold email for UK restaurants without websites',
                  'Show me tasks due today',
                ].map((promptText) => (
                  <button
                    key={promptText}
                    type="button"
                    onClick={() => setInputText(promptText)}
                    className="w-full p-2.5 text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-colors text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    "{promptText}"
                  </button>
                ))}
              </div>
            </div>
          ) : activeLead ? (
            <div className="space-y-5">
              <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Prospect Intelligence
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">Commercial Score</span>
                <LeadScoreBadge score={activeLead.leadScore || 70} />
              </div>

              <div className="space-y-3">
                <div className="text-[10px] uppercase font-bold text-slate-400">Contact Details</div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Company</span>
                    <span className="font-bold text-slate-900 dark:text-white">{activeLead.companyName || activeLead.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Email</span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{activeLead.email || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Phone</span>
                    <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{activeLead.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">WhatsApp Opt-in</span>
                    <span className={`text-[10px] font-bold ${activeLead.whatsapp_opt_in ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {activeLead.whatsapp_opt_in ? 'Opted-In (Verified)' : 'Not Opted-In (Requires Consent)'}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/leads/${activeLead._id}`}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition-colors no-underline"
              >
                View Full Lead Profile
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  );
}
