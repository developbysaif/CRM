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
} from 'lucide-react';

const mockDemoResults = {
  Restaurant: {
    name: 'The Crown Tavern & Kitchen',
    location: 'London, UK',
    rating: 4.8,
    reviews: 64,
    score: 88,
    status: 'Hot',
    websiteStatus: 'Missing Website',
    whyValuable: 'High 4.8★ customer rating with zero official web footprint. Prime candidate for modern reservations site.',
    subject: 'Modern digital menu and reservations platform for The Crown Tavern',
  },
  Dental: {
    name: 'Harley Street Smile Clinic',
    location: 'London, UK',
    rating: 4.9,
    reviews: 142,
    score: 92,
    status: 'Hot',
    websiteStatus: 'Outdated / Slow Mobile',
    whyValuable: 'High-ticket cosmetic dentistry with 2.8s mobile load time. Missing online booking engine.',
    subject: 'Accelerating patient bookings for Harley Street Smile Clinic',
  },
  SaaS: {
    name: 'CloudSync Infrastructure',
    location: 'San Francisco, CA',
    rating: 4.6,
    reviews: 38,
    score: 79,
    status: 'Warm',
    websiteStatus: 'Poor SEO Structure',
    whyValuable: 'Growing B2B cloud tool with organic search visibility deficit against competitors.',
    subject: 'SEO architecture & conversion rate optimization for CloudSync',
  },
};

export default function HomePage() {
  const [selectedIndustry, setSelectedIndustry] = useState('Restaurant');
  const [isScanning, setIsScanning] = useState(false);
  const activeLead = mockDemoResults[selectedIndustry] || mockDemoResults.Restaurant;

  const handleSimulateScan = (industry) => {
    setIsScanning(true);
    setSelectedIndustry(industry);
    setTimeout(() => {
      setIsScanning(false);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080f25] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Notice Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white text-center py-2.5 px-4 text-xs font-medium flex items-center justify-center gap-2 border-b border-white/10">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-pulse" />
        <span>LeadAI Pro 2.0: Real Google Places Discovery • Zero Synthetic Data • Approval Center Gating</span>
        <Link href="/discovery" className="underline font-bold text-cyan-300 hover:text-white ml-1">
          Explore Discovery →
        </Link>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/85 dark:bg-[#080f25]/85 border-b border-slate-200 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                LeadAI<span className="text-blue-600 dark:text-cyan-400">Pro</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                  Enterprise
                </span>
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Link href="#features" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
              Features
            </Link>
            <Link href="/discovery" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Search className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              AI Discovery
            </Link>
            <Link href="/pipeline" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-blue-400" />
              14-Stage Pipeline
            </Link>
            <Link href="/approvals" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Approval Center
            </Link>
            <Link href="/chat" className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              AI Command
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <ThemeToggle />

            <Link
              href="/login"
              className="px-3.5 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        {/* Animated Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span>The Autonomous AI Sales Employee for Digital Agencies</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12] mb-6">
          Put Your Lead Generation,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-cyan-300 dark:to-indigo-400">
            Client Outreach & Proposals
          </span>{' '}
          On Autonomous Autopilot
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-9">
          Discovers real local businesses from Google Places, scores digital footprints 0–100, crafts personalized outreach, and drafts executive proposals — with 100% human approval gating.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mb-12">
          <Link
            href="/dashboard"
            className="px-7 py-3.5 text-sm sm:text-base font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/discovery"
            className="px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            <span>Discover Local Leads</span>
          </Link>
          <Link
            href="/approvals"
            className="px-6 py-3.5 text-sm sm:text-base font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Approval Center</span>
          </Link>
        </div>

        {/* Social Proof Badges */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-6 border-t border-slate-200/80 dark:border-white/10 mb-14">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Zero Synthetic Data Guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Human Approval Gated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>5-Key Multi De-Duplication</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>14-Stage Visual Pipeline</span>
          </div>
        </div>

        {/* 3D Showcase Window Mockup */}
        <div className="rounded-3xl p-3 bg-gradient-to-b from-slate-200 via-slate-100 to-transparent dark:from-blue-500/20 dark:via-indigo-500/10 dark:to-transparent border border-slate-200 dark:border-white/15 shadow-2xl">
          {/* Browser Window Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-900 rounded-t-2xl border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 px-4 py-1 rounded-md border border-slate-200 dark:border-slate-800">
              app.leadaipro.com/dashboard
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

      {/* Live Interactive Discovery Simulator */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-200 dark:border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold mb-3">
            <Search className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            Interactive Discovery Simulator
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            See How The AI Sales Employee Operates
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Select an industry below to see how LeadAI Pro mines real business signals and drafts gated outreach.
          </p>
        </div>

        {/* Simulator Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Industry:</span>
              <div className="flex gap-2">
                {['Restaurant', 'Dental', 'SaaS'].map((ind) => (
                  <button
                    key={ind}
                    onClick={() => handleSimulateScan(ind)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedIndustry === ind
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>Target Region:</span>
              <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                London, UK
              </span>
            </div>
          </div>

          <div className={`transition-all duration-300 ${isScanning ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lead Information */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                      {activeLead.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{activeLead.location} • {selectedIndustry} Sector</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    {activeLead.status} Lead
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-center">
                    <div className="text-[11px] text-slate-500">Google Reviews</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {activeLead.rating} ({activeLead.reviews})
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-center">
                    <div className="text-[11px] text-slate-500">Website Status</div>
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1.5">{activeLead.websiteStatus}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 text-center">
                    <div className="text-[11px] text-slate-500">Lead Score</div>
                    <div className="text-sm font-black text-blue-600 dark:text-cyan-400 mt-1">{activeLead.score}/100</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                  <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                    AI Value Rationale
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{activeLead.whyValuable}</p>
                </div>
              </div>

              {/* Outreach Preview */}
              <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-purple-600" />
                      Generated Outreach
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-500/30">
                      Gated in Queue
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 mb-2.5">
                    <span className="text-slate-500 font-medium">Subject: </span>
                    <span className="font-semibold text-slate-900 dark:text-white">{activeLead.subject}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    &ldquo;Hi there, we noticed {activeLead.name} holds an impressive {activeLead.rating}-star reputation on Google, yet diners cannot reserve directly online...&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/10 mt-4">
                  <Link
                    href="/approvals"
                    className="w-full py-2.5 px-4 text-xs font-bold text-center text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Approve in Queue →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Autonomous Workflow Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200 dark:border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold mb-3">
            <Layers className="w-3.5 h-3.5" />
            Autonomous Execution Flow
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            The 4-Step Automated Sales Pipeline
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
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200 dark:border-white/10">
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

      {/* 6 Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200 dark:border-white/10">
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
                className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
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

      {/* Bottom Conversion CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
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
              className="px-8 py-3.5 text-sm font-bold text-blue-600 bg-white hover:bg-slate-100 rounded-xl shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
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

      {/* Clean Footer */}
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
