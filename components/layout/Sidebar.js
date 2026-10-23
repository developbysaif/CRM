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
import { useAuth } from '@/components/providers/AuthProvider';
import { getInitials } from '@/components/ui/index';

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
  const { user } = useAuth();
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

  const userName = user?.name || 'Admin User';
  const userEmail = user?.email || 'admin@leadai.pro';
  const userInitials = getInitials(userName);

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 no-underline group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-black text-slate-900 dark:text-white tracking-tight text-base leading-none">
                  LeadAI <span className="text-blue-600">Pro</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                  Enterprise CRM
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const badgeCount = item.badgeKey === 'approvals' ? pendingApprovals : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onCloseMobile?.()}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all relative no-underline ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}

                    {/* Pending Approvals Badge */}
                    {badgeCount > 0 && !isCollapsed && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                        {badgeCount}
                      </span>
                    )}

                    {badgeCount > 0 && isCollapsed && (
                      <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500" />
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
              {userInitials}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {userEmail}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
