'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Kanban,
  ShieldCheck,
  CheckSquare,
  Zap,
  Bot,
  Calendar,
  FileText,
  FileCheck,
  FileSpreadsheet,
  Receipt,
  BarChart3,
  SearchCode,
  Swords,
  Calculator,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const navItems = [
  { section: 'CORE CRM' },
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/discovery', icon: Sparkles, label: 'Discovery', badge: 'AI' },
  { href: '/pipeline', icon: Kanban, label: 'Pipeline & Deals' },
  { href: '/approvals', icon: ShieldCheck, label: 'Approvals', badgeCount: true },
  
  { section: 'ENGAGEMENT' },
  { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/automation', icon: Zap, label: 'Automation & Crons' },
  { href: '/chat', icon: Bot, label: 'AI Sales Agent' },
  { href: '/meetings', icon: Calendar, label: 'Meetings' },

  { section: 'COMMERCIAL' },
  { href: '/proposals', icon: FileText, label: 'Proposals' },
  { href: '/contracts', icon: FileCheck, label: 'Contracts' },
  { href: '/quotations', icon: FileSpreadsheet, label: 'Quotations' },
  { href: '/invoices', icon: Receipt, label: 'Invoices' },

  { section: 'INTELLIGENCE' },
  { href: '/reports', icon: BarChart3, label: 'Reports & Analytics' },
  { href: '/audit', icon: SearchCode, label: 'Website Audit' },
  { href: '/competitor', icon: Swords, label: 'Competitor Intel' },
  { href: '/estimator', icon: Calculator, label: 'Cost Estimator' },

  { section: 'SYSTEM' },
  { href: '/settings', icon: Settings, label: 'Settings & APIs' },
];

export default function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile, toggleCollapse }) {
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
    const interval = setInterval(fetchCounts, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <nav className="sidebar-nav flex flex-col justify-between">
        <div>
          {/* Logo & Mobile Close */}
          <div className="sidebar-logo flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
            <Link
              href="/dashboard"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 no-underline overflow-hidden"
              title="LeadAI Pro"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden whitespace-nowrap">
                  <div className="text-sm font-black text-slate-900 tracking-tight">
                    LeadAI <span className="text-blue-600">Pro</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium leading-none">Enterprise Sales CRM</div>
                </div>
              )}
            </Link>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5">
            {navItems.map((item, i) => {
              if (item.section) {
                if (isCollapsed) {
                  return (
                    <div
                      key={i}
                      className="w-full my-2 border-t border-slate-100 dark:border-slate-800"
                      title={item.section}
                    />
                  );
                }
                return (
                  <div
                    key={i}
                    className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase px-2 pt-3 pb-1"
                  >
                    {item.section}
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`group relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 group-hover:text-slate-700'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="flex-1 truncate tracking-tight">{item.label}</span>
                  )}

                  {/* AI Badge */}
                  {!isCollapsed && item.badge && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200">
                      {item.badge}
                    </span>
                  )}

                  {/* Approval Alert Badge */}
                  {item.badgeCount && pendingApprovals > 0 && (
                    <span
                      className={`${
                        isCollapsed
                          ? 'absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white'
                          : 'text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {!isCollapsed && pendingApprovals}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Admin Card & Collapse Toggle */}
        <div className="pt-3 mt-4 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                S
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden truncate">
                  <div className="text-xs font-bold text-slate-800 truncate">Saif</div>
                  <div className="text-[10px] text-slate-400 truncate">Administrator</div>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}

