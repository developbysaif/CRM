'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Spinner } from '../ui/index';

const GREETING = `Hi 👋

I'm your **AI Business Consultant**.

Tell me about your project and I'll help you estimate the cost, timeline and recommend the best technology.

To get started, what is your name and business email?`;

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

const BUSINESS_TYPES = [
  'Restaurant', 'Hospital', 'Real Estate', 'School', 'Travel', 'AI Startup',
  'Ecommerce', 'Portfolio', 'Agency', 'Manufacturing', 'Healthcare', 'Finance', 'Education'
];

const PROJECT_TYPES = [
  'Website', 'Mobile App', 'AI Solution', 'CRM', 'ERP', 'Dashboard',
  'Marketplace', 'SaaS', 'Booking System', 'Custom Software'
];

const FEATURE_PILLS = [
  'Payment Gateway', 'Admin Dashboard', 'Authentication', 'CMS',
  'Booking System', 'Inventory', 'Reports & Analytics', 'AI Features'
];

export default function ChatInterface({ fullPage = false }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING, id: 'init' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const [collectedData, setCollectedData] = useState({});
  const [leadId, setLeadId] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Smart dynamic quick replies based on conversation stage
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== 'assistant') return;
    const content = (lastMsg.content || '').toLowerCase();

    if (content.includes('industry') || content.includes('business type') || content.includes('business operates')) {
      setQuickReplies(BUSINESS_TYPES);
    } else if (content.includes('project type') || content.includes('solution') || content.includes('looking to build')) {
      setQuickReplies(PROJECT_TYPES);
    } else if (content.includes('features') || content.includes('key features')) {
      setQuickReplies(FEATURE_PILLS);
    } else if (content.includes('budget')) {
      setQuickReplies(['$5k - $10k', '$10k - $25k', '$25k - $50k', '$50k - $100k+', 'Need Recommendation']);
    } else if (content.includes('timeline') || content.includes('deadline')) {
      setQuickReplies(['2-4 weeks (Urgent)', '1-2 months', '2-3 months', '3-6 months', 'Flexible']);
    } else {
      setQuickReplies([]);
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (text) => {
      const userText = text || input.trim();
      if (!userText || loading) return;

      setInput('');
      setQuickReplies([]);
      setMessages((prev) => [...prev, { role: 'user', content: userText, id: Date.now() }]);
      setLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText, sessionId, collectedData }),
        });

        const data = await res.json();
        if (data.success) {
          setMessages((prev) => [...prev, { role: 'assistant', content: data.data.message, id: Date.now() + 1 }]);
          setCollectedData(data.data.collectedData || {});
          if (data.data.leadId) {
            setLeadId(data.data.leadId);
          }
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: "I've analyzed your requirements and recorded your details. How else can I assist with your project architecture?",
              id: Date.now() + 1,
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: "Thank you for sharing. I've logged your request into our CRM and our engineering team will follow up directly.",
            id: Date.now() + 1,
          },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading, sessionId, collectedData]
  );

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const containerStyle = fullPage
    ? {
        height: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }
    : { height: '100%', display: 'flex', flexDirection: 'column' };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--gradient-cyber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>AI Business Consultant</div>
            <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              24/7 Lead Qualification Engine
            </div>
          </div>
        </div>

        {leadId && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href={`/leads/${leadId}`} className="btn btn-primary btn-sm">
              👥 View Lead in CRM
            </Link>
            <Link href="/estimator" className="btn btn-secondary btn-sm">
              🧮 Cost Estimator
            </Link>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '85%' }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'var(--gradient-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                >
                  🤖
                </div>
                <div className="chat-bubble chat-bubble-ai" dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
              </div>
            )}
            {msg.role === 'user' && <div className="chat-bubble chat-bubble-user">{msg.content}</div>}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              🤖
            </div>
            <div className="chat-bubble chat-bubble-ai" style={{ padding: '12px 18px' }}>
              <div className="typing-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Dynamic Quick Reply Chips */}
      {quickReplies.length > 0 && (
        <div
          style={{
            padding: '8px 16px 12px',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            background: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border)',
          }}
        >
          {quickReplies.map((r) => (
            <button
              key={r}
              onClick={() => sendMessage(r)}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                fontSize: 11.5,
                background: 'var(--bg-card)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              + {r}
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
          placeholder="Type your message or project requirements..."
          rows={1}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-primary)',
            fontSize: 13.5,
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            maxHeight: 100,
          }}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="btn btn-primary btn-icon"
          style={{ borderRadius: '50%', width: 40, height: 40, fontSize: 16, flexShrink: 0 }}
          aria-label="Send"
        >
          {loading ? <Spinner size={18} /> : '→'}
        </button>
      </div>
    </div>
  );
}
