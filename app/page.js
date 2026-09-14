'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ChatWidget from '@/components/chat/ChatWidget';
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
  Globe,
  Star,
  Users,
  Layers,
  ChevronRight,
  Lock,
  Play,
  Flame,
  Clock,
  Send,
  Building2,
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
  const [simulatedCity, setSimulatedCity] = useState('London, UK');
  const [isScanning, setIsScanning] = useState(false);
  const activeLead = mockDemoResults[selectedIndustry] || mockDemoResults.Restaurant;

  const handleSimulateScan = (industry) => {
    setIsScanning(true);
    setSelectedIndustry(industry);
    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#080f25] text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-purple-600/20 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-40 w-[600px] h-[600px] bg-cyan-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[1600px] -right-40 w-[700px] h-[700px] bg-purple-600/10 blur-[150px] pointer-events-none -z-10" />

      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border-b border-white/10 text-center py-2 px-4 text-xs font-medium text-blue-200 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span>LeadAI Pro 2.0 Live: Real Google Places Discovery + Zero Synthetic Data Guarantee + Approval Center</span>
        <Link href="/discovery" className="underline font-semibold hover:text-white ml-1">
          Explore Discovery →
        </Link>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#080f25]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                LeadAI<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Pro</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Enterprise
                </span>
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-cyan-400 transition-colors">
              Platform Features
            </Link>
            <Link href="/discovery" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              AI Discovery
            </Link>
            <Link href="/pipeline" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              14-Stage Pipeline
            </Link>
            <Link href="/approvals" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Approval Center
            </Link>
            <Link href="/chat" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              AI Command
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-blue-500/20 ring-1 ring-white/20 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-lg shadow-blue-500/5 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>The Autonomous AI Sales Employee for Digital Agencies</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.08] mb-6">
          Put Your Lead Generation,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
            Client Outreach & Proposals
          </span>{' '}
          On Autonomous Autopilot
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
          Discovers real local businesses, scores their digital footprint from 0–100, crafts hyper-personalized outreach, generates executive proposals, and drafts contracts on Closed Won — all protected by human approval gating.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 rounded-2xl shadow-2xl shadow-blue-500/30 ring-1 ring-white/30 transition-all flex items-center justify-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Executive Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/discovery"
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-200 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2.5 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <Search className="w-5 h-5 text-cyan-400" />
            <span>Discover Local Leads</span>
          </Link>
          <Link
            href="/approvals"
            className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-200 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/30 transition-all flex items-center justify-center gap-2.5 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Approval Center</span>
          </Link>
        </div>

        {/* Social Proof Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-400 mb-16 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Synthetic Data Policy</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Human Approval Gating</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>5-Key Multi De-Duplication</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>5-Step Automated Follow-Ups</span>
          </div>
        </div>

        {/* 3D Showcase Image with Floating Glass Badges */}
        <div className="relative max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-blue-500/30 via-indigo-500/10 to-transparent ring-1 ring-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-slate-950">
            <Image
              src="/images/crm_hero_showcase.jpg"
              alt="LeadAI Pro Live Executive CRM Interface"
              fill
              priority
              className="object-cover"
            />
            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080f25] via-transparent to-transparent opacity-60" />

            {/* Floating Glass Badge 1 - Lead Discovered */}
            <div className="absolute top-6 left-6 max-w-xs p-3.5 rounded-2xl glass-card-dark text-left ring-1 ring-white/20 shadow-2xl animate-float hidden sm:block">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/40">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Hot Lead Discovered</div>
                  <div className="text-[10px] text-slate-400">Score 88/100 • London, UK</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                <strong>The Crown Tavern</strong> has 64 Google reviews but zero website. Pitch queued in Approval Center.
              </p>
            </div>

            {/* Floating Glass Badge 2 - Proposal Generated */}
            <div className="absolute bottom-8 right-6 max-w-xs p-3.5 rounded-2xl glass-card-dark text-left ring-1 ring-white/20 shadow-2xl animate-float-delayed hidden sm:block">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center ring-1 ring-blue-500/40">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Proposal Synthesized</div>
                  <div className="text-[10px] text-slate-400">Value: $5,500 • DRAFT</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Client replied: Interested</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                  Needs Approval
                </span>
              </div>
            </div>

            {/* Floating Glass Badge 3 - AI Sales Avatar */}
            <div className="absolute bottom-8 left-6 p-3 rounded-2xl glass-card-dark text-left ring-1 ring-white/20 shadow-2xl hidden md:flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-cyan-400/50">
                <Image
                  src="/images/crm_ai_agent_avatar.jpg"
                  alt="Aura AI Sales Assistant"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Aura AI Sales Agent</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[11px] text-cyan-300">187 Lead Scans / Hour • 24/7 Active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive AI Discovery Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold mb-3">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            Interactive Discovery Simulator
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            See How The AI Sales Employee Discovers & Qualifies
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Select a target sector below to simulate how LeadAI Pro mines real business footprints and generates gated outreach.
          </p>
        </div>

        {/* Interactive Selector */}
        <div className="max-w-4xl mx-auto bg-slate-900/80 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Industry:</span>
              <div className="flex gap-2">
                {['Restaurant', 'Dental', 'SaaS'].map((ind) => (
                  <button
                    key={ind}
                    onClick={() => handleSimulateScan(ind)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedIndustry === ind
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-white/30'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Target Region:</span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-200">
                {simulatedCity}
              </span>
            </div>
          </div>

          {/* Result Card Preview */}
          <div className={`transition-all duration-300 ${isScanning ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lead Summary */}
              <div className="lg:col-span-2 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      {activeLead.name}
                    </h3>
                    <p className="text-xs text-slate-400">{activeLead.location} • {selectedIndustry} Sector</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      {activeLead.status} Lead
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-center">
                    <div className="text-xs text-slate-400">Google Reviews</div>
                    <div className="text-sm font-bold text-white flex items-center justify-center gap-1 mt-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {activeLead.rating} ({activeLead.reviews})
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-center">
                    <div className="text-xs text-slate-400">Website Status</div>
                    <div className="text-xs font-bold text-amber-400 mt-1">{activeLead.websiteStatus}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-center">
                    <div className="text-xs text-slate-400">Lead Score</div>
                    <div className="text-sm font-black text-cyan-400 mt-0.5">{activeLead.score}/100</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="text-[11px] font-bold text-blue-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    AI Value Rationale
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{activeLead.whyValuable}</p>
                </div>
              </div>

              {/* Draft Outreach Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-purple-400" />
                      Generated Outreach
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Gated in Approval Center
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 mb-2">
                    <span className="text-slate-400 font-medium">Subject: </span>
                    <span className="font-semibold text-white">{activeLead.subject}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    &ldquo;Hi there, we noticed {activeLead.name} holds an impressive {activeLead.rating}-star reputation across {activeLead.reviews} diners on Google, yet diners cannot reserve directly online...&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-2">
                  <Link
                    href="/approvals"
                    className="w-full py-2 px-3 text-xs font-bold text-center text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Approve in Queue →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Autonomous Pipeline Architecture */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3">
            <Layers className="w-3.5 h-3.5" />
            Autonomous Execution Flow
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            How The AI Sales Employee Operates
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            From discovering public commercial registries to signing contracts and receiving payments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Multi-Key Discovery',
              icon: Search,
              color: 'from-blue-600 to-cyan-600',
              badge: 'Google Places & Apify',
              desc: 'Discovers verified businesses by region and category. Deduplicates automatically across 5 keys.',
            },
            {
              step: '02',
              title: '0–100 Footprint Scoring',
              icon: Cpu,
              color: 'from-cyan-600 to-emerald-600',
              badge: 'Digital Signals Engine',
              desc: 'Identifies missing websites (+25), poor mobile experience (+10), weak SEO (+10), and high review counts (+5).',
            },
            {
              step: '03',
              title: 'Approval Center Gating',
              icon: ShieldCheck,
              color: 'from-amber-600 to-orange-600',
              badge: 'Zero Auto-Send Risk',
              desc: 'Every cold email, WhatsApp pitch, and proposal enters the Approval Center for human verification before dispatch.',
            },
            {
              step: '04',
              title: 'Contracts & Killswitches',
              icon: CheckCircle2,
              color: 'from-purple-600 to-indigo-600',
              badge: 'Closed Won Automation',
              desc: 'Moving a deal to Closed Won generates a legal MSA and owner alert. Client replies instantly cancel all follow-ups.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-3xl p-6 bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 shadow-xl group"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-black text-white/20 group-hover:text-blue-400/40 transition-colors">
                    {item.step}
                  </span>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                  {item.badge}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Visual Pipeline Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-4">
              <Layers className="w-3.5 h-3.5" />
              14-Stage Kanban Pipeline
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-6">
              Track Every Prospect From First Ping To Paid Contract
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Unlike ordinary CRMs with basic 4-stage pipelines, LeadAI Pro provides an end-to-end 14-stage journey engineered specifically for high-ticket agency sales.
            </p>

            <div className="space-y-3.5">
              {[
                { title: 'Inbound Reply Triggers', desc: 'Replies auto-classified (11 intents) advancing to Interested & drafting proposals.' },
                { title: 'Closed Won Contract Automation', desc: 'Moving to Closed Won synthesizes Master Services Agreement and fires Owner Alert.' },
                { title: 'Auto-Killswitch Protection', desc: 'Client response instantly halts all 5-step automated follow-up sequences.' },
                { title: 'Suppression List Compliance', desc: 'Unsubscribe links auto-block any future outbound communications.' },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-sm text-white font-semibold">{feat.title}</strong>
                    <p className="text-xs text-slate-400">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <Link
                href="/pipeline"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                <span>View Live Pipeline</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 3D Pipeline Visual */}
          <div className="relative rounded-3xl p-2 bg-gradient-to-tr from-cyan-500/30 via-purple-500/10 to-transparent ring-1 ring-white/20 shadow-2xl">
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

      {/* Core Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Engineered For Digital Agency Revenue
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Everything your sales team needs to discover, qualify, propose, and close high-ticket clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: 'AI Sales Employee',
              color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
              desc: 'Autonomous assistant asking discovery questions, scoring leads, and handling natural language CRM commands.',
            },
            {
              icon: Search,
              title: 'Google Places & Apify Mining',
              color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
              desc: 'Live mining of real businesses without fake mock data. Filter by radius, reviews, and missing websites.',
            },
            {
              icon: TrendingUp,
              title: '0–100 Footprint Scoring',
              color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              desc: 'Weighted scoring formula evaluating mobile responsiveness, SEO presence, reviews, and buying readiness.',
            },
            {
              icon: ShieldCheck,
              title: 'Approval Center Gating',
              color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              desc: 'Full human control. Review AI reasoning, customize pitch messages, and approve single or bulk outreach.',
            },
            {
              icon: Mail,
              title: 'Multi-Channel Personalization',
              color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
              desc: 'Generates targeted cold emails, LinkedIn connection notes, WhatsApp icebreakers, and 5-step follow-ups.',
            },
            {
              icon: FileText,
              title: 'Automated Proposals & MSAs',
              color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
              desc: 'Instant proposal drafting on client interest and Master Services Agreement creation when marked Closed Won.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl p-6 bg-slate-900/60 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 shadow-lg backdrop-blur-md"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.color} border flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Conversion CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-white/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Transform Your B2B Sales Operation Today
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Stop manually hunting leads and writing proposals. Let your autonomous AI Sales Employee handle pipeline discovery with complete human approval oversight.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-2xl shadow-xl shadow-blue-600/30 ring-1 ring-white/30 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/chat"
              className="px-8 py-4 text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/10 transition-all"
            >
              Test Chatbot Qualifier
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-400">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-slate-200">LeadAI Pro</span> — Autonomous AI Sales Employee & CRM
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
            <span>Zero Synthetic Data Guaranteed</span>
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}
