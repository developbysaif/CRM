'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlobalSearchModal from '../ui/GlobalSearchModal';
import ThemeToggle from '../ui/ThemeToggle';
import {
  Search,
  Bell,
  Plus,
  HelpCircle,
  Menu,
  User,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  ChevronDown,
  X,
  ExternalLink,
} from 'lucide-react';

export default function Topbar({ title, subtitle, onOpenMobile }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

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

    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
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
      <div className="topbar-inner flex items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Toggle & Page Titles */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Pill */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all text-xs select-none"
            title="Search CRM (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium">Search CRM...</span>
            <kbd className="text-[10px] font-semibold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500">
              Ctrl K
            </kbd>
          </button>

          {/* Quick Action Trigger */}
          <Link
            href="/leads"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </Link>

          {/* AI Sales Agent Shortcut */}
          <Link
            href="/chat"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Aura AI</span>
          </Link>

          {/* Help & Documentation Modal Trigger */}
          <button
            onClick={() => setHelpOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Help & CRM Documentation"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-scaleIn">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Notifications {unread > 0 && <span className="text-blue-600">({unread})</span>}
                  </div>
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No new notifications
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((n) => (
                      <Link
                        key={n._id}
                        href={n.link || '#'}
                        onClick={() => setShowNotif(false)}
                        className={`block px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all ${
                          n.isRead ? 'opacity-70' : 'bg-blue-50/40 dark:bg-blue-900/10'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="text-base shrink-0">{notifIcons[n.type] || '🔔'}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {n.title}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                              {n.message}
                            </div>
                            <div className="text-[9px] text-slate-400 mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
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

          {/* User Avatar & Dropdown */}
          <div className="relative pl-1 border-l border-slate-200 dark:border-slate-800" ref={userRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                S
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 top-11 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 animate-scaleIn">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Saif</div>
                  <div className="text-[10px] text-slate-400">admin@leadaipro.com</div>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account & APIs</span>
                </Link>

                <Link
                  href="/approvals"
                  onClick={() => setUserDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  <span>Approval Center</span>
                </Link>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-all text-left"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setHelpOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                💡
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">LeadAI Pro Help & Support</h3>
                <p className="text-xs text-slate-500">Autonomous CRM & Outreach Platform</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
              <p>
                <strong>Zero Synthetic Fallbacks:</strong> All leads come strictly from Google Places or Apify mining.
              </p>
              <p>
                <strong>Human-in-the-Loop Gating:</strong> All outbound pitches, proposals, and contracts require approval in the <strong>Approval Center</strong>.
              </p>
              <p>
                <strong>Keyboard Shortcuts:</strong> Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-[10px]">Ctrl + K</kbd> anywhere to search leads, deals, and commands.
              </p>
            </div>
            <button
              onClick={() => setHelpOpen(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
            >
              Got it, continue
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
