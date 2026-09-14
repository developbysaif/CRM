'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import GlobalSearchModal from '../ui/GlobalSearchModal';
import ThemeToggle from '../ui/ThemeToggle';

export default function Topbar({ title, subtitle }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data?.notifications || []);
        setUnread(data.data?.unreadCount || 0);
      }
    } catch {}
  }

  async function markAllRead() {
    try {
      await fetch('/api/notifications', { method: 'PUT' });
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  }

  const notifIcons = {
    new_lead: '👤',
    meeting: '📅',
    proposal_accepted: '📄',
    contract_signed: '✍️',
    invoice_paid: '💰',
    follow_up: '🔔',
    system: 'ℹ️',
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Global Search trigger */}
          <div
            onClick={() => setSearchOpen(true)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
            <div
              className="search-global"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                userSelect: 'none',
              }}
            >
              <span>Search CRM...</span>
              <kbd style={{ fontSize: 10, background: 'var(--bg-elevated)', padding: '2px 5px', borderRadius: 4, border: '1px solid var(--border)' }}>Ctrl K</kbd>
            </div>
          </div>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => setShowNotif(!showNotif)}
              style={{ position: 'relative', fontSize: 18 }}
              aria-label="Notifications"
            >
              🔔
              {unread > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    background: '#ef4444',
                    color: 'white',
                    fontSize: 9,
                    fontWeight: 700,
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-base)',
                  }}
                >
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {showNotif && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 44,
                  width: 360,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>
                    Notifications {unread > 0 && <span style={{ color: '#ef4444', fontSize: 13 }}>({unread})</span>}
                  </span>
                  <button className="btn btn-ghost btn-sm" onClick={markAllRead} style={{ fontSize: 11, padding: '4px 8px' }}>
                    Mark all read
                  </button>
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No new notifications</div>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <Link
                        key={n._id}
                        href={n.link || '#'}
                        onClick={() => setShowNotif(false)}
                        style={{
                          display: 'flex',
                          gap: 12,
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border)',
                          textDecoration: 'none',
                          background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                          transition: 'var(--transition)',
                        }}
                      >
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{notifIcons[n.type] || '🔔'}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Quick AI Consultant Action */}
          <Link href="/chat" className="btn btn-primary btn-sm">
            🤖 AI Consultant
          </Link>
        </div>
      </div>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
