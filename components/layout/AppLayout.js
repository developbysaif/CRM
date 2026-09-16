'use client';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Toaster from '../ui/Toaster';
import ChatWidget from '../chat/ChatWidget';

export default function AppLayout({ children, title, subtitle }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('crm_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('crm_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="app-layout">
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar with state */}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        toggleCollapse={toggleCollapse}
      />

      {/* Main Content Area */}
      <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar
          title={title}
          subtitle={subtitle}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
          onOpenMobile={() => setIsMobileOpen(true)}
        />
        <main className="page-content">{children}</main>
      </div>

      <ChatWidget />
      <Toaster />
    </div>
  );
}

