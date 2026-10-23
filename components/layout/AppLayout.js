'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const ROUTE_TITLES = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/contacts': 'Contacts',
  '/companies': 'Companies',
  '/pipeline': 'Pipeline',
  '/approvals': 'Approval Center',
  '/tasks': 'Tasks',
  '/calendar': 'Calendar',
  '/chat': 'Messages & AI',
  '/automation': 'Automation & Crons',
  '/reports': 'Reports & Analytics',
  '/team': 'Team',
  '/settings': 'Settings',
};

export default function AppLayout({ children, title, subtitle }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('crm_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  // Sync document title per route
  useEffect(() => {
    let activeTitle = title;
    if (!activeTitle) {
      if (pathname) {
        if (pathname.startsWith('/leads/')) {
          activeTitle = 'Lead Details';
        } else {
          activeTitle = ROUTE_TITLES[pathname] || 'Enterprise CRM';
        }
      }
    }
    if (activeTitle) {
      document.title = `${activeTitle} · LeadAI Pro`;
    }
  }, [title, pathname]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('crm_sidebar_collapsed', String(next));
  };

  return (
    <div className="crm-layout">
      {/* Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`crm-main ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar onToggleMobile={() => setIsMobileOpen(!isMobileOpen)} />
        
        {/* Page Content */}
        <main className="crm-content">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
