'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Spinner } from '../ui/index';

const GREETING = `Hi 👋 I'm your **AI Business Consultant**.

Tell me about your project and I'll help you estimate the cost, timeline and recommend the best technology stack for your needs.

What's your name and email so I can get started? 😊`;

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

export default function ChatInterface({ fullPage = false }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING, id: 'init' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [collectedData, setCollectedData] = useState({});
  const [leadConverted, setLeadConverted] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Smart quick reply suggestions based on conversation stage
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== 'assistant') return;
    const content = lastMsg.content.toLowerCase();

    if (content.includes('business type') || content.includes('type of business')) {
      setQuickReplies(['Ecommerce', 'Restaurant', 'Real Estate', 'AI Startup', 'Healthcare', 'Agency']);
    } else if (content.includes('project type') || content.includes('looking to build')) {
      setQuickReplies(['Website', 'Mobile App', 'AI Solution', 'SaaS', 'CRM', 'Dashboard']);
    } else if (content.includes('budget')) {
      setQuickReplies(['$5k - $10k', '$10k - $25k', '$25k - $50k', '$50k+', 'Not sure yet']);
    } else if (content.includes('timeline') || content.includes('deadline')) {
      setQuickReplies(['1 month', '2-3 months', '3-6 months', 'Flexible', 'ASAP - urgent']);
    } else if (content.includes('technology') || content.includes('tech stack')) {
      setQuickReplies(['Next.js + Node.js', 'React + Python', 'No preference', 'Custom/Enterprise']);
    } else {
      setQuickReplies([]);
    }
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    setInput('');
    setQuickReplies([]);
    setMessages(prev => [...prev, { role: 'user', content: userText, id: Date.now() }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, sessionId, collectedData }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.message, id: Date.now() + 1 }]);
        setCollectedData(data.data.collectedData || {});
        if (data.data.isReadyToConvert && data.data.leadId) {
          setLeadConverted(true);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I ran into a technical issue. Please try again or contact us directly. 🙏", id: Date.now() + 1 }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection issue. Please try again in a moment.", id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, sessionId, collectedData]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const containerStyle = fullPage
    ? { height: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden' }
    : { height: '100%', display: 'flex', flexDirection: 'column' };

  return (
    <div style={containerStyle}>
      {/* Chat Header */}
      <div style={{ padding: '16px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-cyber)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, animation: 'pulse-glow 3s infinite' }}>🤖</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>AI Business Consultant</div>
          <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Online · Powered by GPT-4o
          </div>
        </div>
        {leadConverted && (
          <div style={{ marginLeft: 'auto', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: 11, color: '#10b981', fontWeight: 600 }}>
            ✓ Lead Saved to CRM
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🤖</div>
                <div className="chat-bubble chat-bubble-ai" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
              </div>
            )}
            {msg.role === 'user' && (
              <div className="chat-bubble chat-bubble-user">{msg.content}</div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
            <div className="chat-bubble chat-bubble-ai" style={{ padding: '14px 18px' }}>
              <div className="typing-dots"><span /><span /><span /></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      {quickReplies.length > 0 && (
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {quickReplies.map(r => (
            <button key={r} onClick={() => sendMessage(r)} className="btn btn-secondary btn-sm" style={{ fontSize: 12, borderRadius: 'var(--radius-full)' }}>
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="chat-input-area">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type your message..."
          rows={1}
          style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', maxHeight: 100, overflowY: 'auto' }}
          disabled={loading}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn btn-primary btn-icon" style={{ borderRadius: '50%', width: 40, height: 40, fontSize: 16, flexShrink: 0 }}>
          {loading ? <Spinner size={18} /> : '→'}
        </button>
      </div>
    </div>
  );
}
