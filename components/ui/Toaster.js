'use client';
import { useEffect, useState } from 'react';

let toastQueue = [];
let listeners = [];

function notify(listeners) {
  listeners.forEach((fn) => fn([...toastQueue]));
}

export const toast = {
  success: (msg) => addToast(msg, 'success'),
  error: (msg) => addToast(msg, 'error'),
  info: (msg) => addToast(msg, 'info'),
  warning: (msg) => addToast(msg, 'warning'),
};

function addToast(message, type) {
  const id = Date.now() + Math.random();
  toastQueue = [...toastQueue, { id, message, type }];
  notify(listeners);
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id);
    notify(listeners);
  }, 4000);
}

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};
const colors = {
  success: '#10b981',
  error: '#ef4444',
  info: '#6366f1',
  warning: '#f59e0b',
};

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const fn = (t) => setToasts(t);
    listeners.push(fn);
    return () => { listeners = listeners.filter((l) => l !== fn); };
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--bg-card)', border: `1px solid ${colors[t.type]}40`,
          borderLeft: `3px solid ${colors[t.type]}`,
          borderRadius: 'var(--radius-md)', padding: '12px 20px',
          color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeSlideUp 0.3s ease-out',
          minWidth: 280, maxWidth: 420,
        }}>
          <span style={{ color: colors[t.type], fontSize: 16, fontWeight: 700 }}>{icons[t.type]}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
