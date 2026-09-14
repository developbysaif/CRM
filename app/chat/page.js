'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ChatInterface from '@/components/chat/ChatInterface';
import { Spinner } from '@/components/ui/index';
import { toast } from '@/components/ui/Toaster';
import Link from 'next/link';

export default function ChatPage() {
  const [mode, setMode] = useState('command'); // 'command' | 'visitor'

  // AI Command Center State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '👋 Welcome to the **LeadAI Command Center**!\n\nI am your automated sales employee. You can command me with tasks like:\n* *"Find 15 restaurants in London without websites"*\n* *"Show me all hot leads"*\n* *"Generate proposal for NovaCare Health"*\n* *"How many proposals are pending?"*',
    },
  ]);
  const [commandInput, setCommandInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendCommand(cmdText) {
    const text = cmdText || commandInput.trim();
    if (!text || loading) return;

    setCommandInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.data.response,
            actionData: data.data.data,
            action: data.data.action,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `⚠️ Error: ${data.message}` },
        ]);
      }
    } catch {
      toast.error('Network error communicating with AI Command Center');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout
      title="AI Sales Assistant & Command Center"
      subtitle="Issue natural language commands to discover leads, draft proposals, and query pipeline intelligence"
    >
      {/* Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
          <button
            onClick={() => setMode('command')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: mode === 'command' ? 700 : 500,
              background: mode === 'command' ? '#ffffff' : 'transparent',
              color: mode === 'command' ? '#2563eb' : '#64748b',
              border: 'none',
              cursor: 'pointer',
              boxShadow: mode === 'command' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            ⚡ Executive Command Center
          </button>
          <button
            onClick={() => setMode('visitor')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: mode === 'visitor' ? 700 : 500,
              background: mode === 'visitor' ? '#ffffff' : 'transparent',
              color: mode === 'visitor' ? '#2563eb' : '#64748b',
              border: 'none',
              cursor: 'pointer',
              boxShadow: mode === 'visitor' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            🤖 Inbound Lead Qualifier Chatbot
          </button>
        </div>

        {mode === 'command' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleSendCommand('Find 15 restaurants in London without websites')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11 }}
            >
              🍽️ Find London Restaurants
            </button>
            <button
              onClick={() => handleSendCommand('Show me all hot leads')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11 }}
            >
              🔥 Show Hot Leads
            </button>
            <button
              onClick={() => handleSendCommand('How many proposals are pending?')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11 }}
            >
              📊 Pending Proposals
            </button>
          </div>
        )}
      </div>

      {mode === 'command' ? (
        /* AI Command Center Layout */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 20, height: 'calc(100vh - 180px)' }}>
          {/* Main Chat Feed */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {/* Messages Scroll Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {messages.map((msg, idx) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      marginLeft: isAssistant ? 0 : 40,
                      marginRight: isAssistant ? 40 : 0,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isAssistant ? '#2563eb' : '#64748b',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {isAssistant ? '⚡' : '👤'}
                    </div>

                    <div
                      style={{
                        background: isAssistant ? '#f8fafc' : '#2563eb',
                        color: isAssistant ? '#0f172a' : '#ffffff',
                        padding: '12px 16px',
                        borderRadius: 8,
                        fontSize: 13,
                        lineHeight: 1.6,
                        border: isAssistant ? '1px solid #e2e8f0' : 'none',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {msg.content}

                      {/* Discovered Leads Preview Card */}
                      {msg.action === 'lead_discovery' && msg.actionData?.leads && (
                        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                          <Link href="/leads" className="btn btn-primary btn-sm" style={{ fontSize: 11 }}>
                            View All {msg.actionData.savedCount} Discovered Leads in Directory →
                          </Link>
                        </div>
                      )}

                      {/* Hot Leads Table */}
                      {msg.action === 'hot_leads' && Array.isArray(msg.actionData) && (
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {msg.actionData.map((l) => (
                            <div key={l._id} style={{ background: '#ffffff', padding: '6px 10px', borderRadius: 4, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Link href={`/leads/${l._id}`} style={{ fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                                {l.companyName || l.company || l.name}
                              </Link>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>
                                Score {l.leadScore}/100
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10 }}>
                  <Spinner size={18} />
                  <span style={{ fontSize: 13, color: '#64748b' }}>Executing CRM command...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendCommand();
              }}
              style={{ padding: '14px 18px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: 10 }}
            >
              <input
                className="input"
                style={{ flex: 1, fontSize: 13 }}
                placeholder="Ask me to find leads, generate proposals, or query pipeline stats..."
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
              />
              <button type="submit" disabled={loading || !commandInput.trim()} className="btn btn-primary btn-sm" style={{ padding: '0 18px' }}>
                Send
              </button>
            </form>
          </div>

          {/* Right Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: 18 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                💡 Sample Commands
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                {[
                  'Find 15 dental clinics in London',
                  'Find 10 restaurants in San Francisco without websites',
                  'Show me all hot leads',
                  'How many proposals are pending?',
                  'Generate proposal for NovaCare Health',
                ].map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendCommand(cmd)}
                    style={{
                      textAlign: 'left',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      padding: '6px 10px',
                      fontSize: 12,
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    👉 "{cmd}"
                  </button>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                ⚡ Safety & Approval Protocol
              </h4>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                When the AI Command Center drafts emails or proposals, it places them in your <strong>Approval Center</strong>. No messages or quotes are sent to real clients automatically.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Inbound Qualifier Mode */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, height: 'calc(100vh - 180px)' }}>
          <ChatInterface fullPage={true} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>
                🤖 Inbound Visitor Chatbot
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                This interactive chat widget engages visitors on your website 24/7, interviews them about requirements and budget, calculates an AI Lead Score, and saves qualified leads directly to your CRM.
              </p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
