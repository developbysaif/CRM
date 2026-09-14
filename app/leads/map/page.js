'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner, LeadScoreBadge } from '@/components/ui/index';
import Link from 'next/link';

export default function LeadsMapPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [filterQuality, setFilterQuality] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/leads?limit=150');
        const data = await res.json();
        if (data.success) {
          setLeads(data.data.leads || []);
          if (data.data.leads?.length > 0) {
            setSelectedLead(data.data.leads[0]);
          }
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const filtered = leads.filter((l) => {
    if (filterQuality === 'all') return true;
    return l.leadStatus === filterQuality;
  });

  return (
    <AppLayout
      title="Geospatial Lead Discovery Map"
      subtitle="Visual representation of discovered business prospects color-coded by AI Lead Score"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            className="input"
            value={filterQuality}
            onChange={(e) => setFilterQuality(e.target.value)}
            style={{ width: 160, fontSize: 13 }}
          >
            <option value="all">All Lead Quality</option>
            <option value="Hot">🔥 Hot (80-100)</option>
            <option value="Warm">⚡ Warm (60-79)</option>
            <option value="Cold">❄️ Cold (0-59)</option>
          </select>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Showing <strong>{filtered.length}</strong> geolocated business prospects
          </span>
        </div>

        <Link href="/leads" className="btn btn-secondary btn-sm">
          📋 Directory Table View
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spinner size={36} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, height: 'calc(100vh - 200px)' }}>
          {/* Simulated Interactive Map Display / Grid Canvas */}
          <div
            className="card"
            style={{
              padding: 24,
              background: '#0f172a',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Map Header Overlay */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '6px 12px', borderRadius: 8, fontSize: 12, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                📍 Coordinates Coverage: Global & Metropolitan Regions
              </div>
              <div style={{ display: 'flex', gap: 8, background: 'rgba(15, 23, 42, 0.85)', padding: '6px 12px', borderRadius: 8, fontSize: 11 }}>
                <span style={{ color: '#ef4444' }}>● Hot</span>
                <span style={{ color: '#f59e0b' }}>● Warm</span>
                <span style={{ color: '#3b82f6' }}>● Cold</span>
              </div>
            </div>

            {/* Pins Grid Canvas */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: 12,
                padding: '40px 10px',
                overflowY: 'auto',
              }}
            >
              {filtered.map((l) => {
                const pinColor = l.leadStatus === 'Hot' ? '#ef4444' : l.leadStatus === 'Warm' ? '#f59e0b' : '#3b82f6';
                const isSelected = selectedLead?._id === l._id;

                return (
                  <button
                    key={l._id}
                    onClick={() => setSelectedLead(l)}
                    style={{
                      background: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                      border: isSelected ? `2px solid ${pinColor}` : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      textAlign: 'left',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ color: pinColor, fontSize: 14 }}>📍</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: pinColor }}>
                        {l.leadScore}/100
                      </span>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.companyName || l.company || l.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                      {l.city || 'Metropolitan'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', zIndex: 2 }}>
              Click any business pin to inspect Google rating, digital score, and direct CRM actions
            </div>
          </div>

          {/* Right Selected Lead Inspection Drawer */}
          {selectedLead ? (
            <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {selectedLead.companyName || selectedLead.company || selectedLead.name}
                  </h3>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                    {selectedLead.industry || 'Business'} · {selectedLead.city || 'N/A'}
                  </div>
                </div>

                <LeadScoreBadge score={selectedLead.leadScore} status={selectedLead.leadStatus} />
              </div>

              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, color: '#334155' }}>
                <strong style={{ color: '#2563eb' }}>Why Valuable: </strong>
                {selectedLead.whyValuable || selectedLead.aiSummary || 'Established business profile.'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div>
                  <span style={{ color: '#64748b' }}>Address: </span>
                  <strong>{selectedLead.address || selectedLead.city || 'N/A'}</strong>
                </div>

                {selectedLead.phone && (
                  <div>
                    <span style={{ color: '#64748b' }}>Phone: </span>
                    <strong style={{ color: '#2563eb' }}>{selectedLead.phone}</strong>
                  </div>
                )}

                {selectedLead.email && (
                  <div>
                    <span style={{ color: '#64748b' }}>Email: </span>
                    <strong>{selectedLead.email}</strong>
                  </div>
                )}

                <div>
                  <span style={{ color: '#64748b' }}>Website: </span>
                  {selectedLead.website ? (
                    <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                      {selectedLead.domain || 'Visit'} ↗
                    </a>
                  ) : (
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>NO WEBSITE</span>
                  )}
                </div>

                {selectedLead.rating && (
                  <div>
                    <span style={{ color: '#64748b' }}>Google Rating: </span>
                    <strong style={{ color: '#eab308' }}>★ {selectedLead.rating}</strong> ({selectedLead.reviewCount || 0} reviews)
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                {selectedLead.googleMapsUrl && (
                  <a
                    href={selectedLead.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ textAlign: 'center' }}
                  >
                    📍 Open in Google Maps ↗
                  </a>
                )}

                <Link
                  href={`/leads/${selectedLead._id}`}
                  className="btn btn-primary btn-sm"
                  style={{ textAlign: 'center' }}
                >
                  Open Full CRM Profile →
                </Link>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              Select a lead to view details
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
