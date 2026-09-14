'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from '@/components/ui/ThemeToggle';
import {
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  TrendingUp,
  Cpu,
  FileText,
  Mail,
  CheckCircle2,
  Zap,
  Star,
  Layers,
  ChevronRight,
  Flame,
  Building2,
  Lock,
  ArrowUpRight,
  Activity,
  Check,
  Send,
  Eye,
  Sliders,
  Scale,
  RefreshCw,
  Globe,
  Database,
  BarChart3,
  Calendar,
} from 'lucide-react';

const demoCases = {
  restaurant: {
    sector: 'Restaurant & Hospitality',
    name: 'The Crown Tavern & Kitchen',
    location: 'Covent Garden, London',
    rating: 4.8,
    reviews: 64,
    score: 88,
    badge: 'Hot Lead',
    websiteStatus: 'Missing Website',
    signals: ['4.8★ Google Rating', '64 Diner Reviews', 'No Direct Booking', 'High Commercial Density'],
    whyValuable: 'High 4.8★ customer rating with zero official web footprint. Prime candidate for custom reservations site & online menus.',
    subject: 'Modern digital menu and reservations platform for The Crown Tavern',
    body: 'Hi there, we noticed The Crown Tavern holds an impressive 4.8-star reputation across 64 diners on Google, yet diners cannot reserve directly online. We built a prototype reservations experience for your location...',
    deliverables: ['Custom Mobile-First Website', 'Table Reservation Engine', 'Local SEO & Google Maps Sync'],
  },
  dental: {
    sector: 'Cosmetic Healthcare',
    name: 'Harley Street Smile Clinic',
    location: 'Westminster, London',
    rating: 4.9,
    reviews: 142,
    score: 94,
    badge: 'Hot Lead',
    websiteStatus: 'Outdated & Slow Mobile',
    signals: ['4.9★ Google Rating', '142 Patient Reviews', '3.4s Mobile Load', 'High-Ticket Treatments'],
    whyValuable: 'High-ticket cosmetic dentistry with 3.4s mobile load time. Missing instant online consultation scheduler.',
    subject: 'Accelerating patient consultation bookings for Harley Street Smile Clinic',
    body: 'Hello, your patient reviews on Google are stellar (4.9★ across 142 patients). However, mobile visitors currently experience a 3.4s load delay before booking a consultation. Here is our audit breakdown...',
    deliverables: ['Core Web Vitals Optimization', 'Self-Service Booking Widget', 'Automated SMS Reminders'],
  },
  saas: {
    sector: 'Enterprise B2B Cloud',
    name: 'CloudSync Infrastructure',
    location: 'Financial District, San Francisco',
    rating: 4.6,
    reviews: 38,
    score: 79,
    badge: 'Warm Lead',
    websiteStatus: 'Organic SEO Deficit',
    signals: ['4.6★ G2/Google Reviews', '38 Reviews', 'Domain Rank 24', 'Competitor Keyword Gap'],
    whyValuable: 'Growing B2B cloud tool with organic search visibility deficit against competitors in their category.',
    subject: 'Organic SEO architecture & conversion rate audit for CloudSync',
    body: 'Hi CloudSync team, our automated competitor audit identified that 3 of your direct category rivals are outranking you for 42 high-intent cloud keywords. We prepared a technical gap analysis...',
    deliverables: ['Keyword Architecture Refactor', 'Landing Page A/B Strategy', 'Executive Comparison Deck'],
  },
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('restaurant');
  const [approvedState, setApprovedState] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const activeDemo = demoCases[activeTab] || demoCases.restaurant;

  const handleTabChange = (key) => {
    setIsSwitching(true);
    setActiveTab(key);
    setApprovedState(false);
    setTimeout(() => setIsSwitching(false), 200);
  };

  const handleSimulateApprove = () => {
    setApprovedState(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060b1e] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Decorative Grid & Glows */}
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern opacity-40 pointer-events-none -z-10" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/15 to-purple-600/20 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-48 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute top-[1800px] -right-48 w-[700px] h-[700px] bg-purple-600/10 blur-[160px] pointer-events-none -z-10" />

      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 text-white text-center py-2.5 px-4 text-xs font-medium border-b border-white/10 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
        <span>LeadAI Pro 2.0: Real Google Places Discovery • Zero Synthetic Data • Human Approval Gating</span>
        <Link href="/discovery" className="underline font-bold text-cyan-300 hover:text-white ml-1">
          Launch Discovery →
        </Link>
      </div>

      {/* Floating Modern Header */}
      <header className="sticky top-4 z-50 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 rounded-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 px-4 sm:px-6 flex items-center justify-between transition-all">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                LeadAI<span className="text-blue-600 dark:text-cyan-400">Pro</span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  Enterprise
                </span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Link href="#simulator" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
              Interactive Demo
            </Link>
            <Link href="/discovery" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Discovery
            </Link>
            <Link href="/pipeline" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-blue-400" />
              14-Stage Board
            </Link>
            <Link href="/approvals" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Approvals
            </Link>
            <Link href="#features" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
              Features
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="shimmer-btn px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center relative">
        {/* Glowing Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>The Autonomous AI Sales Employee for High-Growth Agencies</span>
        </div>

        {/* Epic Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12] mb-6">
          Turn Real Business Footprints Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400">
            Closed Contract Revenue
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Discovers real businesses from Google Places registries, scores digital footprints 0–100, crafts personalized outreach, and drafts executive proposals — protected by human approval gating.
        </p>

        {/* Hero CTA Row */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-14">
          <Link
            href="/dashboard"
            className="shimmer-btn px-7 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Executive Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/discovery"
            className="px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Discover Local Leads</span>
          </Link>
          <Link
            href="/approvals"
            className="px-6 py-3.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Approval Center</span>
          </Link>
        </div>

        {/* 4 Pillars Social Proof Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-16 text-left">
          {[
            { icon: CheckCircle2, title: 'Zero Synthetic Leads', desc: 'Real Google Places registries only' },
            { icon: ShieldCheck, title: '100% Gated Outreach', desc: 'Zero auto-send risk with approvals' },
            { icon: Database, title: '5-Key De-Duplication', desc: 'Email, phone, domain, placeId, name' },
            { icon: Layers, title: '14-Stage Visual Deal Flow', desc: 'From discovery to paid contract' },
          ].map((pill, i) => {
            const Icon = pill.icon;
            return (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-sm flex items-start gap-2.5 shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{pill.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{pill.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3D Showcase Window Mockup */}
        <div className="rounded-3xl p-3 bg-gradient-to-b from-slate-200 via-slate-100 to-transparent dark:from-blue-500/20 dark:via-indigo-500/10 dark:to-transparent border border-slate-200 dark:border-white/15 shadow-2xl">
          {/* macOS Style Window Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-900 rounded-t-2xl border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 px-4 py-1 rounded-md border border-slate-200 dark:border-slate-800">
              app.leadaipro.com/pipeline
            </div>
            <div className="w-12" />
          </div>

          <div className="relative overflow-hidden rounded-b-2xl aspect-[16/9] bg-slate-950">
            <Image
              src="/images/crm_hero_showcase.jpg"
              alt="LeadAI Pro Live Executive CRM Interface"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Interactive AI Sales Employee Showcase (Tabbed Bento) */}
      <section id="simulator" className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-200 dark:border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold mb-3">
            <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            Live Autonomous Employee Simulator
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Experience The Sales Workflow In Real-Time
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Choose an industry sector to see how LeadAI Pro mines verified business intelligence, assigns 0–100 scores, and queues drafts in the Human Approval Center.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex justify-center mb-8">
          <div className="p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex gap-1.5">
            {[
              { key: 'restaurant', label: '🍽️ Restaurant & Dining', tag: 'London' },
              { key: 'dental', label: '🦷 Cosmetic Clinic', tag: 'London' },
              { key: 'saas', label: '☁️ Enterprise Cloud', tag: 'San Francisco' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className="hidden sm:inline-block text-[10px] opacity-75 font-normal px-1.5 py-0.5 rounded bg-black/15">
                  {tab.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Showcase Container */}
        <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-start transition-opacity duration-200 ${isSwitching ? 'opacity-40' : 'opacity-100'}`}>
            {/* Left Column: Lead Footprint Intelligence (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                    {activeDemo.sector}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    {activeDemo.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{activeDemo.location}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    {activeDemo.badge}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">Status: Gated</div>
                </div>
              </div>

              {/* 3 Metric Signals */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/5 text-center">
                  <div className="text-[11px] text-slate-500">Google Reputation</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {activeDemo.rating} ({activeDemo.reviews})
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/5 text-center">
                  <div className="text-[11px] text-slate-500">Website Audit</div>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1.5">{activeDemo.websiteStatus}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-white/5 text-center">
                  <div className="text-[11px] text-slate-500">Footprint Score</div>
                  <div className="text-sm font-black text-blue-600 dark:text-cyan-400 mt-1">{activeDemo.score}/100</div>
                </div>
              </div>

              {/* AI Value Justification */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                  Why This Lead Is Valuable
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{activeDemo.whyValuable}</p>
              </div>

              {/* Recommended Solution Scope */}
              <div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Recommended Scope:</div>
                <div className="flex flex-wrap gap-2">
                  {activeDemo.deliverables.map((d, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-500" />
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Generated Outreach & Approval Queue Simulator (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-purple-600" />
                    Cold Outreach Draft
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-500/30">
                    Awaiting Approval
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mb-3">
                  <span className="text-slate-400 font-medium">Subject: </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{activeDemo.subject}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono text-[11px]">
                  {activeDemo.body}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 space-y-2">
                {approvedState ? (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-bounce" style={{ animationIterationCount: 2 }}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>✓ Authorized! Dispatched via Resend</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulateApprove}
                    className="w-full py-2.5 px-4 text-xs font-bold text-center text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Simulate Human [Approve & Send]</span>
                  </button>
                )}

                <div className="text-[10px] text-center text-slate-500 dark:text-slate-400">
                  Protected by LeadAI Pro Approval Center gating protocol.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Pipeline Journey (Connected Horizontal Timeline) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200 dark:border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold mb-3">
            <Sliders className="w-3.5 h-3.5" />
            Autonomous Pipeline Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            How The Autonomous Engine Works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            From initial business discovery to signed agreements and automated follow-ups.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Multi-Key Discovery',
              icon: Search,
              color: 'bg-blue-600 text-white',
              badge: 'Google Places & Apify',
              desc: 'Discovers verified businesses by region and category. Deduplicates automatically across 5 keys.',
            },
            {
              step: '02',
              title: '0–100 Footprint Scoring',
              icon: Cpu,
              color: 'bg-cyan-600 text-white',
              badge: 'Digital Signals Engine',
              desc: 'Identifies missing websites (+25), poor mobile experience (+10), weak SEO (+10), and review counts (+5).',
            },
            {
              step: '03',
              title: 'Approval Center Gating',
              icon: ShieldCheck,
              color: 'bg-amber-600 text-white',
              badge: 'Zero Auto-Send Risk',
              desc: 'Every cold email, WhatsApp pitch, and proposal enters the Approval Center for human review before dispatch.',
            },
            {
              step: '04',
              title: 'Contracts & Killswitches',
              icon: CheckCircle2,
              color: 'bg-purple-600 text-white',
              badge: 'Closed Won Automation',
              desc: 'Moving to Closed Won synthesizes Master Services Agreement. Client replies cancel all follow-ups.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card-hover p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-400 dark:text-slate-600">
                      {item.step}
                    </span>
                    <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-1">
                    {item.badge}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 14-Stage Visual Pipeline Showcase */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200 dark:border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-bold mb-4">
              <Layers className="w-3.5 h-3.5" />
              14-Stage Kanban Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-5">
              Track Every Deal From First Ping To Paid Contract
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
              Unlike ordinary CRMs with basic 4-stage pipelines, LeadAI Pro provides an end-to-end 14-stage journey engineered specifically for high-ticket digital agencies.
            </p>

            <div className="space-y-3.5 mb-8">
              {[
                { title: 'Inbound Reply Triggers', desc: 'Replies auto-classified (11 intents) advancing to Interested & drafting proposals.' },
                { title: 'Closed Won Contract Automation', desc: 'Moving to Closed Won synthesizes Master Services Agreement and fires Owner Alert.' },
                { title: 'Auto-Killswitch Protection', desc: 'Client response instantly halts all 5-step automated follow-up sequences.' },
                { title: 'Suppression List Compliance', desc: 'Unsubscribe links auto-block any future outbound communications.' },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-4.5 h-4.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold">{feat.title}</strong>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/pipeline"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>View 14-Stage Board</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Pipeline Visual Frame */}
          <div className="rounded-3xl p-3 bg-gradient-to-tr from-cyan-500/20 via-purple-500/10 to-transparent border border-slate-200 dark:border-white/15 shadow-xl">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-slate-950">
              <Image
                src="/images/crm_analytics_preview.jpg"
                alt="LeadAI Pro Pipeline Architecture Preview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Feature Bento Grid */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200 dark:border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Engineered For Digital Agency Revenue
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Everything your sales team needs to discover, qualify, propose, and close high-ticket clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: 'AI Sales Employee',
              color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10',
              desc: 'Autonomous assistant asking discovery questions, scoring leads, and executing safe CRM commands.',
            },
            {
              icon: Search,
              title: 'Google Places & Apify Mining',
              color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
              desc: 'Live mining of real businesses without fake mock data. Filter by radius, reviews, and missing websites.',
            },
            {
              icon: TrendingUp,
              title: '0–100 Footprint Scoring',
              color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
              desc: 'Weighted scoring formula evaluating mobile responsiveness, SEO presence, reviews, and buying signals.',
            },
            {
              icon: ShieldCheck,
              title: 'Approval Center Gating',
              color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
              desc: 'Full human control. Review AI reasoning, customize pitch messages, and approve single or bulk outreach.',
            },
            {
              icon: Mail,
              title: 'Multi-Channel Personalization',
              color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10',
              desc: 'Generates targeted cold emails, LinkedIn connection notes, WhatsApp icebreakers, and 5-step follow-ups.',
            },
            {
              icon: FileText,
              title: 'Automated Proposals & MSAs',
              color: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10',
              desc: 'Instant proposal drafting on client interest and Master Services Agreement creation on Closed Won.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="card-hover rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Table Section (Old Way vs LeadAI Pro) */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-200 dark:border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Legacy Manual Outreach vs. LeadAI Pro
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Why high-growth agencies choose autonomous sales automation.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900">
          <div className="grid grid-cols-3 p-4 bg-slate-100 dark:bg-slate-800/60 font-bold text-xs text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
            <div>Sales Dimension</div>
            <div className="text-slate-500">Old Manual Way</div>
            <div className="text-blue-600 dark:text-cyan-400">LeadAI Pro Autonomous</div>
          </div>
          {[
            { dim: 'Lead Discovery', old: 'Manual Google search & copy-paste', neu: 'Google Places API & Apify live mining' },
            { dim: 'Data Authenticity', old: 'Purchased outdated broker lists', neu: '100% Real-time verified registries' },
            { dim: 'Personalization', old: 'Generic cold email copy-paste', neu: 'Trained on target site SEO & reviews' },
            { dim: 'Safety Control', old: 'Unchecked auto-spammers', neu: 'Human Approval Center gating' },
            { dim: 'Proposals & MSAs', old: '3-4 hours per Word document', neu: 'Instant DRAFT auto-synthesis' },
          ].map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 p-4 text-xs ${i % 2 === 1 ? 'bg-slate-50 dark:bg-slate-950/40' : ''} border-b border-slate-100 dark:border-slate-800/60 last:border-b-0`}
            >
              <div className="font-semibold text-slate-900 dark:text-white">{row.dim}</div>
              <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="text-red-500 font-bold">✕</span> {row.old}
              </div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {row.neu}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* High-Impact Bottom Conversion Banner */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-2xl relative overflow-hidden">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
            Transform Your B2B Sales Operation Today
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Put autonomous discovery, scoring, and proposal drafting on autopilot with 100% human approval safety.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/dashboard"
              className="shimmer-btn px-8 py-3.5 text-sm font-bold text-blue-600 bg-white hover:bg-slate-100 rounded-xl shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/chat"
              className="px-7 py-3.5 text-sm font-semibold text-white bg-white/15 hover:bg-white/20 rounded-xl border border-white/25 transition-all"
            >
              Test Chatbot Qualifier
            </Link>
          </div>
        </div>
      </section>

      {/* Clean Modern Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Zap className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-slate-200">LeadAI Pro</span> — Autonomous AI Sales Employee & CRM
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
            <span>Zero Synthetic Data Guaranteed</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
