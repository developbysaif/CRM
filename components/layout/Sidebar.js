'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Contact, Building2, 
  GitPullRequest, CheckSquare, Calendar, MessageSquare, 
  Mail, Workflow, BarChart3, Users2, Settings, ShieldAlert,
  ChevronLeft, ChevronRight, Sparkles, LogOut
} from 'lucide-react';

const navigationGroups = [
  {
    title: 'CORE CRM',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/leads', label: 'Leads', icon: Users },
      { href: '/contacts', label: 'Contacts', icon: Contact },
      { href: '/companies', label: 'Companies', icon: Building2 },
      { href: '/pipeline', label: 'Deals & Pipeline', icon: GitPullRequest },
      { href: '/approvals', label: 'Approval Center', icon: ShieldAlert, badgeKey: 'approvals' },
    ],
  },
  {
    title: 'WORK & ENGAGEMENT',
    items: [
      { href: '/tasks', label: 'Tasks', icon: CheckSquare },
      { href: '/calendar', label: 'Calendar', icon: Calendar },
      { href: '/chat', label: 'Messages & AI', icon: MessageSquare },
      { href: '/automation', label: 'Automation & Crons', icon: Workflow },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { href: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
      { href: '/team', label: 'Team', icon: Users2 },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const pathname = usePathname();
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    async function loadApprovals() {
      try {
        const res = await fetch('/api/approvals?status=approval_required');
        if (res.ok) {
          const data = await res.json();
          setPendingApprovals(data.data?.counts?.all || 0);
        }
      } catch {}
    }
    loadApprovals();
    const interval = setInterval(loadApprovals, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      <aside
        className={`crm-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 no-underline overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight leading-none">
                  LeadAI<span className="text-blue-600">Pro</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                  Enterprise CRM
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const badgeValue = item.badgeKey === 'approvals' ? pendingApprovals : null;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative group no-underline ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                    
                    {/* Badge */}
                    {!isCollapsed && badgeValue > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-white text-blue-600' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                      }`}>
                        {badgeValue}
                      </span>
                    )}

                    {/* Collapsed Tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-medium whitespace-nowrap shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer User Profile Card */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 ${
            isCollapsed ? 'justify-center p-1.5' : ''
          }`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              AD
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Admin User
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  admin@leadai.pro
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
