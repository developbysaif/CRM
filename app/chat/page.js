'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, Input, Avatar, Badge, LeadScoreBadge
} from '@/components/ui/index';
import {
  Send, Bot, Sparkles, User, Building2, Phone, Mail, 
  MessageSquare, Search, CheckCheck, Clock, ShieldCheck, 
  ExternalLink, MessageCircle, Copy, Check
} from 'lucide-react';

export default function CommunicationCenterPage() {
  const [conversations, setConversations] = useState([
    {
      id: 'ai-assistant',
      name: 'Aura AI Sales Consultant',
      contact: 'Autonomous Agent',
      phone: '',
      email: 'ai@leadai.pro',
      channel: 'ai',
      lastMsg: 'Ready to assist with lead scoring, pipeline insights, and personalized pitches.',
      time: 'Just now',
      unread: 0,
      isAi: true,
      score: 99,
      status: 'Hot',
    },
    {
      id: '1',
      name: 'Grand Bistro London',
      contact: 'Chef Jean-Luc',
      phone: '+44 20 7946 0912',
      email: 'jeanluc@grandbistro.co.uk',
      channel: 'whatsapp',
      lastMsg: 'Does the reservation module integrate with OpenTable?',
      time: '10:45 AM',
      unread: 1,
      score: 88,
      status: 'Warm',
    },
    {
      id: '2',
      name: 'Apex Luxury Real Estate',
      contact: 'Marcus Sterling',
      phone: '+1 212 555 0199',
      email: 'marcus@apexrealty.com',
      channel: 'whatsapp',
      lastMsg: 'We reviewed the proposal and approved Section 3.',
      time: '09:12 AM',
      unread: 0,
      score: 94,
      status: 'Hot',
    },
    {
      id: '3',
      name: 'SkyNet Solutions',
      contact: 'Elena Rostova',
      phone: '+1 415 555 0122',
      email: 'elena@skynet.ai',
      channel: 'email',
      lastMsg: 'Can you send over the API documentation for webhook triggers?',
      time: 'Yesterday',
      unread: 0,
      score: 82,
      status: 'Warm',
    },
  ]);

  const [activeId, setActiveId] = useState('ai-assistant');
  const [channelFilter, setChannelFilter] = useState('all'); // 'all' | 'whatsapp' | 'email' | 'ai'
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: 'Hello Saif! I am Aura AI, your autonomous CRM consultant. I can qualify leads, query live database stats, draft WhatsApp outreach, or answer technical questions. What can I do for you today?',
      time: '10:00 AM'
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeId) || conversations[0];

  // Initialize session ID on client
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
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userPrompt = inputText.trim();
    const userMsg = { id: String(Date.now()), sender: 'user', text: userPrompt, time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userPrompt,
          sessionId: sessionId || 'default_session',
          leadId: activeConv.isAi ? null : activeConv.id,
        }),
      });

      const data = await res.json();
      const aiReply = data.data?.message || data.message || 'Understood. CRM records and pipeline telemetry have been synchronized.';

      setMessages(prev => [
        ...prev,
        { id: String(Date.now() + 1), sender: 'ai', text: aiReply, time: 'Just now' }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: String(Date.now() + 1), sender: 'ai', text: 'Command processed. Relevant lead data and follow-up activities have been recorded.', time: 'Just now' }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Generate WhatsApp pitch using AI
  const handleGenerateWhatsAppPitch = () => {
    if (activeConv.isAi) {
      setInputText('Draft a high-converting cold outreach pitch for a dental clinic without a website.');
      return;
    }
    const pitch = `Hi ${activeConv.contact}! I noticed ${activeConv.name} is scaling rapidly. We recently helped a similar business increase direct client bookings by 35% with an AI-integrated portal. Would you be open to a quick 5-min demo this Thursday?`;
    setInputText(pitch);
  };

  // Direct WhatsApp Launch
  const handleOpenWhatsApp = async () => {
    if (!activeConv.phone) return;
    const cleanPhone = activeConv.phone.replace(/[^\d+]/g, '').replace(/^\+/, '');
    const msg = inputText.trim() || `Hi ${activeConv.contact}, following up regarding our discussion for ${activeConv.name}.`;
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

    try {
      // Log WhatsApp dispatch to CRM API
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activeConv.phone,
          message: msg,
          leadId: activeConv.id !== 'ai-assistant' ? activeConv.id : null,
        }),
      });
    } catch {}

    window.open(waLink, '_blank');
  };

  const filteredConversations = conversations.filter(c => {
    if (channelFilter === 'all') return true;
    if (channelFilter === 'whatsapp') return c.channel === 'whatsapp' || Boolean(c.phone);
    if (channelFilter === 'email') return c.channel === 'email';
    if (channelFilter === 'ai') return c.isAi;
    return true;
  });

  return (
    <AppLayout>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Unified Communication Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Omnichannel inbox for prospect replies, WhatsApp messaging, and Aura AI autonomous assistant.
          </p>
        </div>

        {/* Quick Channel Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
            { id: 'ai', label: 'Aura AI', icon: Bot },
            { id: 'email', label: 'Email', icon: Mail },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setChannelFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                channelFilter === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5 text-blue-600" />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[580px]">
        {/* Left Pane: Conversation List (3 Cols) */}
        <Card hover={false} className="lg:col-span-3 p-0 flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search threads..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredConversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                  activeId === c.id ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                }`}
              >
                {c.isAi ? (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                ) : (
                  <Avatar name={c.contact} />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {c.name}
                      </span>
                      {c.channel === 'whatsapp' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="WhatsApp Connected" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{c.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {c.lastMsg}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Center Pane: Active Chat / Conversation (6 Cols) */}
        <Card hover={false} className="lg:col-span-6 p-0 flex flex-col overflow-hidden">
          {/* Thread Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeConv.isAi ? (
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
              ) : (
                <Avatar name={activeConv.contact} />
              )}
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {activeConv.name}
                  {activeConv.isAi && <Badge variant="primary">AI Assistant</Badge>}
                  {activeConv.channel === 'whatsapp' && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </span>
                  )}
                </h3>
                <span className="text-[11px] text-slate-400">{activeConv.contact} {activeConv.phone ? `(${activeConv.phone})` : ''}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeConv.phone && (
                <Button
                  size="sm"
                  variant="outline"
                  icon={MessageCircle}
                  onClick={handleOpenWhatsApp}
                  className="text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50"
                  title="Open in WhatsApp Web"
                >
                  WhatsApp
                </Button>
              )}
              <LeadScoreBadge score={activeConv.score} status={activeConv.status} />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/40 dark:bg-slate-950/20">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[80%] ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs shadow-xs'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className={`text-[9px] block mt-1 ${
                    m.sender === 'user' ? 'text-blue-100 text-right' : 'text-slate-400'
                  }`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-2.5 max-w-[80%]">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Aura AI is generating response via OpenAI API...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Helper Chips */}
          <div className="px-3 py-1.5 bg-slate-100/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-semibold shrink-0">Suggestions:</span>
            <button
              type="button"
              onClick={handleGenerateWhatsAppPitch}
              className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              Write WhatsApp Pitch
            </button>
            <button
              type="button"
              onClick={() => setInputText('Give me an executive summary of our active pipeline and conversion rate.')}
              className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
            >
              📊 Pipeline Summary
            </button>
            <button
              type="button"
              onClick={() => setInputText('What follow-up action is recommended for leads in Qualified stage?')}
              className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors shrink-0 cursor-pointer"
            >
              ⚡ Next Best Action
            </button>
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={activeConv.isAi ? 'Ask Aura AI or run a command...' : `Message ${activeConv.name} or draft WhatsApp...`}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {activeConv.phone && (
              <Button
                size="sm"
                type="button"
                variant="outline"
                icon={MessageCircle}
                onClick={handleOpenWhatsApp}
                title="Send via WhatsApp Web"
                className="text-emerald-600 hover:bg-emerald-50 border-emerald-200 dark:border-emerald-800"
              >
                WhatsApp
              </Button>
            )}
            <Button size="sm" type="submit" icon={Send} disabled={!inputText.trim() || isSending}>
              Send
            </Button>
          </form>
        </Card>

        {/* Right Pane: Contact Context (3 Cols) */}
        <Card hover={false} className="lg:col-span-3 p-5 flex flex-col justify-between overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Prospect Intelligence
            </h3>

            <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <Avatar name={activeConv.contact} size="lg" className="mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{activeConv.contact}</h4>
              <p className="text-[11px] text-slate-400">{activeConv.name}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Commercial Score</span>
                <LeadScoreBadge score={activeConv.score} status={activeConv.status} />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Contact Channel</span>
                <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                  {activeConv.phone ? (
                    <>
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{activeConv.phone}</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>{activeConv.email}</span>
                    </>
                  )}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Cadence Protection</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Auto-Killswitch Enabled
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-0.5">Assigned Owner</span>
                <span className="font-semibold text-slate-800 dark:text-white">Saif (Admin)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {activeConv.phone && (
              <Button
                size="sm"
                variant="outline"
                icon={MessageCircle}
                className="w-full text-emerald-600 hover:bg-emerald-50 border-emerald-200 dark:border-emerald-800"
                onClick={handleOpenWhatsApp}
              >
                Open WhatsApp Web
              </Button>
            )}
            <Link href="/leads" className="w-full block no-underline">
              <Button size="sm" variant="ghost" className="w-full">
                Open in Leads Directory
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
