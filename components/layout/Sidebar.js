'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { section: 'SALES ENGINE' },
  { href: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { href: '/discovery', icon: '🎯', label: 'Lead Discovery', badge: 'AI' },
  { href: '/leads', icon: '👥', label: 'Leads Directory' },
  { href: '/pipeline', icon: '📊', label: '14-Stage Pipeline' },
  { href: '/approvals', icon: '🛡️', label: 'Approval Center', badgeCount: true },
  { section: 'AUTOMATION & OUTREACH' },
  { href: '/chat', icon: '🤖', label: 'AI Sales Assistant' },
  { href: '/proposals', icon: '📄', label: 'Proposals' },
  { href: '/contracts', icon: '📝', label: 'Contracts' },
  { href: '/quotations', icon: '💰', label: 'Quotations' },
  { href: '/invoices', icon: '🧾', label: 'Invoices' },
  { href: '/automation', icon: '⚡', label: 'Campaigns & Crons' },
  { section: 'INTELLIGENCE' },
  { href: '/audit', icon: '🔍', label: 'Website Audit' },
  { href: '/competitor', icon: '⚔️', label: 'Competitor Intel' },
  { href: '/estimator', icon: '🧮', label: 'Cost Estimator' },
  { href: '/meetings', icon: '📅', label: 'Meetings' },
  { section: 'CONFIGURATION' },
  { href: '/settings', icon: '⚙️', label: 'Settings & APIs' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch('/api/approvals?status=approval_required');
        const data = await res.json();
        if (data.success) {
          setPendingApprovals(data.data?.counts?.all || 0);
        }
      } catch {}
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              }}
            >
              ⚡
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                LeadAI <span style={{ color: '#2563eb' }}>Pro</span>
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>AI Sales Automation</div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        {navItems.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} className="nav-section" style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', marginTop: 16, marginBottom: 4, padding: '0 12px' }}>
                {item.section}
              </div>
            );
          }
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#1e40af' : '#475569',
                background: isActive ? '#eff6ff' : 'transparent',
                marginBottom: 2,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10, background: '#dbeafe', color: '#1d4ed8' }}>
                  {item.badge}
                </span>
              )}

              {item.badgeCount && pendingApprovals > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#fee2e2', color: '#b91c1c' }}>
                  {pendingApprovals}
                </span>
              )}
            </Link>
          );
        })}

        {/* Footer Admin Profile */}
        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'white',
              }}
            >
              S
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Saif (CRM Owner)
              </div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Executive Admin</div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
