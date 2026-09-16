'use client';
import React from 'react';
import Link from 'next/link';

export { default as GlobalSearchModal } from './GlobalSearchModal';
export { default as Modal } from './Modal';

// ==================== BUTTON ====================
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all select-none gap-2 outline-none';
  const sizeMap = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    icon: 'p-2 rounded-lg',
  };
  const variantMap = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm shadow-blue-500/20 border border-blue-600',
    secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200/80',
    ghost: 'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900',
    outline: 'bg-transparent border border-slate-300 hover:bg-slate-50 text-slate-700',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    success: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${sizeMap[size] || sizeMap.md} ${variantMap[variant] || variantMap.primary} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

// ==================== BADGE ====================
export function Badge({ children, variant = 'neutral', size = 'sm', className = '' }) {
  const variantMap = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border px-2.5 py-0.5 text-xs ${variantMap[variant] || variantMap.neutral} ${className}`}
    >
      {children}
    </span>
  );
}

// ==================== PRIORITY BADGE ====================
export function PriorityBadge({ priority = 'Medium' }) {
  const map = {
    Urgent: 'bg-red-100 text-red-700 border-red-300 font-bold',
    High: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
    Medium: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
    Low: 'bg-slate-100 text-slate-600 border-slate-200 font-medium',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border uppercase tracking-wider ${map[priority] || map.Medium}`}>
      {priority}
    </span>
  );
}

// ==================== CARD PRIMITIVES ====================
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-sm transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-5 pb-3 border-b border-slate-100 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-base font-bold text-slate-900 tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

// ==================== LEAD SCORE BADGE ====================
export function LeadScoreBadge({ score = 50 }) {
  const isHigh = score >= 75;
  const isMid = score >= 50 && score < 75;

  const colorClass = isHigh
    ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
    : isMid
    ? 'text-amber-700 bg-amber-50 border-amber-300'
    : 'text-blue-700 bg-blue-50 border-blue-300';

  return (
    <div
      className={`inline-flex items-center justify-center w-8 h-8 rounded-xl font-extrabold text-xs border shadow-xs ${colorClass}`}
      title={`AI Digital Footprint Score: ${score}/100`}
    >
      {score}
    </div>
  );
}

// ==================== LEAD STATUS BADGE ====================
export function LeadStatusBadge({ status }) {
  const map = {
    Hot: 'bg-red-50 text-red-700 border-red-200',
    Warm: 'bg-amber-50 text-amber-700 border-amber-200',
    Cold: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${map[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status === 'Hot' ? '🔥' : status === 'Warm' ? '⚡' : '❄️'} {status}
    </span>
  );
}

// ==================== PIPELINE BADGE ====================
export function PipelineBadge({ status = 'New Lead' }) {
  const colors = {
    'New Lead': 'bg-slate-100 text-slate-700 border-slate-200',
    Qualified: 'bg-sky-50 text-sky-700 border-sky-200',
    Contacted: 'bg-blue-50 text-blue-700 border-blue-200',
    Replied: 'bg-purple-50 text-purple-700 border-purple-200',
    Interested: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    Meeting: 'bg-teal-50 text-teal-700 border-teal-200',
    'Proposal Sent': 'bg-amber-50 text-amber-700 border-amber-200',
    Negotiation: 'bg-orange-50 text-orange-700 border-orange-200',
    'Closed Won': 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    'Contract Sent': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Contract Signed': 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    'Payment Pending': 'bg-yellow-50 text-yellow-800 border-yellow-200',
    Paid: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    Completed: 'bg-teal-100 text-teal-800 border-teal-300 font-bold',
    'Closed Lost': 'bg-red-50 text-red-700 border-red-200',
    'Do Not Contact': 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide whitespace-nowrap ${colors[status] || colors['New Lead']}`}
    >
      {status}
    </span>
  );
}

// ==================== SPINNER & SKELETON ====================
export function Spinner({ size = 24 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin shrink-0"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-7 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-slate-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

// ==================== EMPTY STATE ====================
export function EmptyState({ icon = '📭', title = 'No records found', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {description && <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ==================== STAT CARD ====================
export function StatCard({
  icon,
  label,
  value,
  change,
  period = 'vs last month',
  trend = 'up',
  badgeColor = 'blue',
  className = '',
}) {
  const isUp = trend === 'up';
  const isDown = trend === 'down';

  const badgeStyles = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className={`p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${badgeStyles[badgeColor] || badgeStyles.blue}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900 tracking-tight mb-1">
        {value}
      </div>
      {(change !== undefined || period) && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          {change !== undefined && (
            <span
              className={`font-semibold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] ${
                isUp ? 'text-emerald-700 bg-emerald-50' : isDown ? 'text-red-700 bg-red-50' : 'text-slate-600 bg-slate-100'
              }`}
            >
              {isUp ? '↑' : isDown ? '↓' : '•'} {Math.abs(change)}%
            </span>
          )}
          {period && <span className="text-slate-400">{period}</span>}
        </div>
      )}
    </div>
  );
}

// ==================== PAGINATION ====================
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 sm:px-6 rounded-b-2xl">
      <div className="text-xs text-slate-600">
        Page <span className="font-bold text-slate-900">{currentPage}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
