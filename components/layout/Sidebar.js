'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { section: 'OVERVIEW' },
  { href: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { href: '/leads', icon: '👥', label: 'Leads' },
  { href: '/pipeline', icon: '📊', label: 'Pipeline' },
  { href: '/chat', icon: '🤖', label: 'AI Consultant' },
  { section: 'SALES & BILLING' },
  { href: '/proposals', icon: '📄', label: 'Proposals' },
  { href: '/quotations', icon: '💰', label: 'Quotations' },
  { href: '/contracts', icon: '📝', label: 'Contracts' },
  { href: '/invoices', icon: '🧾', label: 'Invoices' },
  { href: '/meetings', icon: '📅', label: 'Meetings' },
  { section: 'AI TOOLS' },
  { href: '/estimator', icon: '🧮', label: 'Cost Estimator' },
  { href: '/audit', icon: '🔍', label: 'Website Audit' },
  { href: '/competitor', icon: '⚔️', label: 'Competitor Analysis' },
  { href: '/automation', icon: '⚡', label: 'Automation & Apify' },
  { section: 'SYSTEM' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
];

const pipelineColors = {
  '/dashboard': 'linear-gradient(135deg,#0052ff,#7c3aed)',
  '/leads': 'linear-gradient(135deg,#ef4444,#f59e0b)',
  '/pipeline': 'linear-gradient(135deg,#6366f1,#8b5cf6)',
  '/chat': 'linear-gradient(135deg,#06b6d4,#0052ff)',
  '/proposals': 'linear-gradient(135deg,#10b981,#06b6d4)',
  '/quotations': 'linear-gradient(135deg,#f59e0b,#ef4444)',
  '/contracts': 'linear-gradient(135deg,#8b5cf6,#ec4899)',
  '/invoices': 'linear-gradient(135deg,#3b82f6,#10b981)',
  '/meetings': 'linear-gradient(135deg,#06b6d4,#10b981)',
  '/estimator': 'linear-gradient(135deg,#f59e0b,#6366f1)',
  '/audit': 'linear-gradient(135deg,#f59e0b,#8b5cf6)',
  '/competitor': 'linear-gradient(135deg,#ef4444,#8b5cf6)',
  '/automation': 'linear-gradient(135deg,#0052ff,#10b981)',
  '/settings': 'linear-gradient(135deg,#64748b,#475569)',
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              ⚡
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                LeadAI <span style={{ color: 'var(--primary)' }}>Pro</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Sales Automation</div>
            </div>
          </Link>
        </div>

        {/* Nav Items */}
        {navItems.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} className="nav-section">
                {item.section}
              </div>
            );
          }
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: isActive ? pipelineColors[item.href] || 'var(--gradient-primary)' : 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  flexShrink: 0,
                  transition: 'var(--transition)',
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}

        {/* Footer Admin Profile */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}
            >
              A
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Executive Lead</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Administrator</div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
