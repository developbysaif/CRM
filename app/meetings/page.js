'use client';
import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Spinner, EmptyState } from '@/components/ui/index';
import { formatDate } from '@/lib/utils';
import { toast } from '@/components/ui/Toaster';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'Discovery Call', startTime: '', endTime: '', meetingLink: '', notes: '', leadId: '' });

  useEffect(() => { fetchMeetings(); }, []);

  async function fetchMeetings() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/meetings', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setMeetings(data.data);
    } catch { }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Meeting scheduled!');
        setShowForm(false);
        setForm({ title: '', type: 'Discovery Call', startTime: '', endTime: '', meetingLink: '', notes: '', leadId: '' });
        fetchMeetings();
      } else { toast.error(data.message); }
    } catch { toast.error('Failed to schedule meeting'); }
  }

  const statusColors = { Scheduled: '#6366f1', Confirmed: '#06b6d4', 'In Progress': '#f59e0b', Completed: '#10b981', Cancelled: '#ef4444', 'No Show': '#64748b' };
  const now = new Date();
  const upcoming = meetings.filter(m => new Date(m.startTime) >= now);
  const past = meetings.filter(m => new Date(m.startTime) < now);

  return (
    <AppLayout title="Meetings" subtitle="Calendar & meeting management">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="stat-card" style={{ padding: '12px 20px', minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#6366f1' }}>{upcoming.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Upcoming</div>
          </div>
          <div className="stat-card" style={{ padding: '12px 20px', minWidth: 120, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>{past.filter(m => m.status === 'Completed').length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Completed</div>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">📅 Schedule Meeting</button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📅 Schedule New Meeting</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Meeting Title *</label>
              <input className="input" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Discovery Call with Client" />
            </div>
            <div className="form-group">
              <label className="input-label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                {['Discovery Call', 'Demo', 'Proposal Review', 'Negotiation', 'Follow-up', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="input-label">Meeting Link</label>
              <input className="input" value={form.meetingLink} onChange={e => setForm(p => ({ ...p, meetingLink: e.target.value }))} placeholder="https://meet.google.com/..." />
            </div>
            <div className="form-group">
              <label className="input-label">Start Time *</label>
              <input className="input" type="datetime-local" required value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="input-label">End Time *</label>
              <input className="input" type="datetime-local" required value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Notes</label>
              <textarea className="input" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Meeting agenda or notes..." style={{ resize: 'vertical', minHeight: 80 }} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">Schedule Meeting</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
        : meetings.length === 0 ? <EmptyState icon="📅" title="No meetings scheduled" description="Schedule your first meeting to get started" />
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {upcoming.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>📅 Upcoming ({upcoming.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {upcoming.map(m => <MeetingCard key={m._id} meeting={m} statusColors={statusColors} />)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>⏰ Past ({past.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {past.slice(0, 5).map(m => <MeetingCard key={m._id} meeting={m} statusColors={statusColors} past />)}
                </div>
              </div>
            )}
          </div>
        )}
    </AppLayout>
  );
}

function MeetingCard({ meeting: m, statusColors, past }) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'flex-start', gap: 16, opacity: past ? 0.7 : 1 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: past ? 'var(--bg-elevated)' : 'var(--gradient-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'white', lineHeight: 1 }}>{new Date(m.startTime).getDate()}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{new Date(m.startTime).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{m.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date(m.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} — {new Date(m.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              {m.leadId && <span> · {m.leadId.name || 'Client'}</span>}
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: `${statusColors[m.status]}20`, color: statusColors[m.status] }}>{m.status}</span>
        </div>
        {m.meetingLink && (
          <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: 10, fontSize: 11 }}>🔗 Join Meeting</a>
        )}
      </div>
    </div>
  );
}
