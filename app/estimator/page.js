'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner } from '@/components/ui/index';
import Link from 'next/link';

const PROJECT_TYPES = [
  'Website',
  'Mobile App',
  'AI Solution',
  'CRM',
  'ERP',
  'Dashboard',
  'Marketplace',
  'SaaS',
  'Booking System',
  'Custom Software',
];

const BUSINESS_TYPES = [
  'AI Startup',
  'Ecommerce',
  'Healthcare',
  'Finance',
  'Real Estate',
  'Restaurant',
  'Hospital',
  'School',
  'Travel',
  'Agency',
  'Manufacturing',
  'Education',
];

const FEATURES_LIST = [
  'Payment Gateway',
  'Admin Dashboard',
  'User Authentication (JWT/OAuth)',
  'CMS & Blog Engine',
  'Booking & Scheduling',
  'Inventory Management',
  'Advanced Reports & Analytics',
  'AI Chatbot & Automation',
  'Multi-tenant Architecture',
  'Realtime Notifications & Sockets',
  'Third-Party API Integrations',
  'SEO & Performance Optimization',
];

export default function EstimatorPage() {
  const [projectType, setProjectType] = useState('AI Solution');
  const [businessType, setBusinessType] = useState('AI Startup');
  const [platform, setPlatform] = useState('Web');
  const [designTier, setDesignTier] = useState('Premium Custom');
  const [urgency, setUrgency] = useState('Standard (4-8 wks)');
  const [selectedFeatures, setSelectedFeatures] = useState([
    'Payment Gateway',
    'Admin Dashboard',
    'User Authentication (JWT/OAuth)',
    'AI Chatbot & Automation',
  ]);
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateEstimate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/estimator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType,
          businessType,
          platform,
          designTier,
          urgency,
          features: selectedFeatures,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEstimate(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectType, businessType, platform, designTier, urgency, selectedFeatures]);

  useEffect(() => {
    calculateEstimate();
  }, [calculateEstimate]);

  function toggleFeature(feat) {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  }

  return (
    <AppLayout title="AI Cost & Timeline Estimator" subtitle="Interactive scope, budget & engineering team calculator">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* Left Form Panel */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: 'var(--text-primary)' }}>
            1. Configure Project Parameters
          </h3>

          {/* Project Type */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="input-label">Project Type</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PROJECT_TYPES.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setProjectType(pt)}
                  className={`btn btn-sm ${projectType === pt ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)', fontSize: 12 }}
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          {/* Industry */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="input-label">Business Sector</label>
            <select
              className="input"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            >
              {BUSINESS_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>

          {/* Platform & Urgency */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="form-group">
              <label className="input-label">Target Platform</label>
              <select className="input" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option value="Web">Web Application (Next.js)</option>
                <option value="iOS & Android">Mobile (iOS & Android)</option>
                <option value="Web + Mobile App">Web + Native Mobile Apps</option>
                <option value="Cross-Platform (React Native)">Cross-Platform (React Native)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Timeline Urgency</label>
              <select className="input" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="Standard (4-8 wks)">Standard (4-8 weeks)</option>
                <option value="Urgent (2-4 wks)">Urgent (2-4 weeks)</option>
                <option value="Express (1-2 wks)">Express Sprint (1-2 weeks)</option>
              </select>
            </div>
          </div>

          {/* Design Tier */}
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="input-label">UX/UI Design Tier</label>
            <select className="input" value={designTier} onChange={(e) => setDesignTier(e.target.value)}>
              <option value="Clean Modern SaaS">Clean Modern SaaS (Standard components)</option>
              <option value="Premium Custom">Premium Custom (Custom design system)</option>
              <option value="Bespoke Enterprise 3D/Motion">Bespoke Enterprise (3D, Framer animations)</option>
            </select>
          </div>

          {/* Feature Checklist */}
          <div className="form-group">
            <label className="input-label" style={{ marginBottom: 8 }}>
              Select Key Features ({selectedFeatures.length} selected)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {FEATURES_LIST.map((feat) => {
                const isSelected = selectedFeatures.includes(feat);
                return (
                  <div
                    key={feat}
                    onClick={() => toggleFeature(feat)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(0, 82, 255, 0.1)' : 'var(--bg-elevated)',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      cursor: 'pointer',
                      fontSize: 12.5,
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'var(--transition)',
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>{isSelected ? '☑' : '☐'}</span>
                    {feat}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Output Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 24, background: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: 'var(--text-primary)' }}>
              2. Real-Time Engineering Estimate
            </h3>

            {loading || !estimate ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Spinner size={32} />
              </div>
            ) : (
              <div>
                {/* Budget Hero */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: 20,
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
                    Estimated Investment Range
                  </div>
                  <div style={{ fontSize: 34, fontWeight: 900, marginTop: 4 }}>
                    {estimate.estimatedBudgetFormatted}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                    Total Estimated Effort: ~{estimate.totalHours} Engineering Hours
                  </div>
                </div>

                {/* Key Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target Timeline</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                      ⏱️ {estimate.estimatedTimeline}
                    </div>
                  </div>
                  <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Recommended Team</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                      👨‍💻 {estimate.requiredDevelopers} Senior Devs
                    </div>
                  </div>
                </div>

                {/* Recommended Stack */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                    Recommended Stack
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {estimate.recommendedStack.map((tech) => (
                      <span key={tech} className="badge badge-primary">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Milestones Breakdown */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                    Project Delivery Phases
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {estimate.milestones.map((m) => (
                      <div
                        key={m.name}
                        style={{
                          padding: '10px 12px',
                          background: 'var(--bg-elevated)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: 12,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{m.name}</span>
                        <span className="badge badge-warning">{m.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link href="/chat" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                    🤖 Talk to AI Consultant
                  </Link>
                  <Link href="/leads" className="btn btn-secondary btn-lg" style={{ flex: 1 }}>
                    View Pipeline
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
