'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data.results || []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const typeColors = {
    Lead: 'rgba(239, 68, 68, 0.15)',
    Proposal: 'rgba(16, 185, 129, 0.15)',
    Quotation: 'rgba(245, 158, 11, 0.15)',
    Contract: 'rgba(139, 92, 246, 0.15)',
    Invoice: 'rgba(59, 130, 246, 0.15)',
    Meeting: 'rgba(6, 182, 212, 0.15)',
  };

  const typeIcons = {
    Lead: '👤',
    Proposal: '📄',
    Quotation: '💰',
    Contract: '📝',
    Invoice: '🧾',
    Meeting: '📅',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 600, padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, proposals, contracts, invoices, meetings..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              background: 'transparent',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          />
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: 12 }}>
            ESC
          </button>
        </div>

        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 0' }}>
          {loading && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Searching CRM database...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matches found for &quot;{query}&quot;
            </div>
          )}

          {!loading && !query && (
            <div style={{ padding: '24px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
              Type a client name, company, invoice number, or industry to search across your platform.
            </div>
          )}

          {!loading &&
            results.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.url}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border)',
                  textDecoration: 'none',
                  transition: 'var(--transition)',
                }}
                className="nav-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: typeColors[item.type] || 'var(--bg-elevated)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                    }}
                  >
                    {typeIcons[item.type] || '📌'}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.subtitle}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="badge badge-primary" style={{ fontSize: 10 }}>{item.type}</span>
                  {item.badge && <span className="badge badge-warning" style={{ fontSize: 10 }}>{item.badge}</span>}
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
