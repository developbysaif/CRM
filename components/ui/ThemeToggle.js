'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let saved = localStorage.getItem('crm_theme');
    if (!saved || saved === 'dark') {
      saved = 'light';
      localStorage.setItem('crm_theme', 'light');
    }
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (t) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  };

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('crm_theme', next);
    applyTheme(next);
  };

  if (!mounted) {
    return <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer flex items-center justify-center ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </button>
  );
}
