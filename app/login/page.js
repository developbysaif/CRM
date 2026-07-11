'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner } from '@/components/ui/index';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const url = tab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = tab === 'login' ? { email: form.email, password: form.password } : form;
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        router.push('/dashboard');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: 'var(--shadow-glow)' }}>⚡</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>LeadAI Pro</span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>AI Lead Generation & Sales Automation</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', marginBottom: 28, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 4 }}>
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px 0', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'var(--transition)', background: tab === t ? 'var(--gradient-primary)' : 'transparent', color: tab === t ? 'white' : 'var(--text-secondary)' }}>
                {t === 'login' ? '🔐 Login' : '✨ Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'register' && (
              <>
                <div className="form-group">
                  <label className="input-label">Full Name</label>
                  <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="John Smith" required />
                </div>
                <div className="form-group">
                  <label className="input-label">Role</label>
                  <select className="input" name="role" value={form.role} onChange={handleChange}>
                    <option value="admin">Admin</option>
                    <option value="sales">Sales</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </>
            )}
            <div className="form-group">
              <label className="input-label">Email Address</label>
              <input className="input" name="email" type="email" value={form.email} onChange={handleChange} placeholder="admin@company.com" required />
            </div>
            <div className="form-group">
              <label className="input-label">Password</label>
              <input className="input" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>

            {error && <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: 13 }}>{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 4 }}>
              {loading ? <Spinner size={18} /> : tab === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: '14px', background: 'rgba(99,102,241,0.07)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              💡 No account? Register above to create your admin account.<br/>MongoDB must be running locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
