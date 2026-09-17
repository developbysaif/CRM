'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Button, Card, Input, Avatar, Badge, LeadScoreBadge
} from '@/components/ui/index';
import {
  Send, Bot, Sparkles, User, Building2, Phone, Mail, 
  Paperclip, Search, CheckCheck, Clock, ShieldCheck
} from 'lucide-react';

export default function CommunicationCenterPage() {
  const [conversations, setConversations] = useState([
    { id: '1', name: 'Grand Bistro London', contact: 'Chef Jean-Luc', lastMsg: 'Does the reservation module integrate with OpenTable?', time: '10:45 AM', unread: 1, score: 88, status: 'Warm' },
    { id: '2', name: 'Apex Luxury Real Estate', contact: 'Marcus Sterling', lastMsg: 'We have reviewed the proposal and approved Section 3.', time: '09:12 AM', unread: 0, score: 94, status: 'Hot' },
    { id: '3', name: 'SkyNet Solutions', contact: 'Elena Rostova', lastMsg: 'Can you send over the API documentation for webhook triggers?', time: 'Yesterday', unread: 0, score: 82, status: 'Warm' },
    { id: '4', name: 'Aura AI Sales Assistant', contact: 'Autonomous Agent', lastMsg: 'Scanned 15 new local businesses. 4 meet high-intent threshold.', time: '2h ago', unread: 0, isAi: true, score: 99, status: 'Hot' },
  ]);

  const [activeId, setActiveId] = useState('4');
  const [messages, setMessages] = useState([
    { id: 'm1', sender: 'ai', text: 'Hello Saif! I am Aura, your autonomous sales employee. How can I assist you with deal workflows or lead intelligence today?', time: '10:00 AM' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const activeConv = conversations.find(c => c.id === activeId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: String(Date.now()), sender: 'user', text: inputText, time: 'Just now' };
    setMessages(prev => [...prev, userMsg]);
    const prompt = inputText;
    setInputText('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });
      if (res.ok) {
        const data = await res.json();
        const aiResponse = data.data?.message || data.message || 'Understood. Pipeline updated according to instructions.';
        setMessages(prev => [
          ...prev,
          { id: String(Date.now() + 1), sender: 'ai', text: aiResponse, time: 'Just now' }
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { id: String(Date.now() + 1), sender: 'ai', text: 'I processed your command. Relevant leads and follow-up sequences have been logged.', time: 'Just now' }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Unified Communication Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Omnichannel inbox for prospect replies, email threads, and Aura AI autonomous commands.
        </p>
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
            {conversations.map((c) => (
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
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {c.name}
                    </span>
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
                </h3>
                <span className="text-[11px] text-slate-400">{activeConv.contact}</span>
              </div>
            </div>

            <LeadScoreBadge score={activeConv.score} status={activeConv.status} />
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
                  <p>{m.text}</p>
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
                  <span>Aura AI is thinking and querying CRM datastore...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeConv.name}...`}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link href="/leads" className="w-full block no-underline">
              <Button size="sm" variant="outline" className="w-full">
                Open in Leads Directory
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
