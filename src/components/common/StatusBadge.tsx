import React from 'react';
import { TokenStatus } from '../../types';

interface StatusBadgeProps {
  status: TokenStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const getStyle = () => {
    switch (status) {
      case 'In Consultation':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold';
      case 'Confirmed':
        return 'bg-sky-50 text-sky-800 border border-sky-300 font-bold';
      case 'Waiting':
        return 'bg-amber-50 text-amber-800 border border-amber-300 font-bold';
      case 'Completed':
        return 'bg-slate-100 text-slate-800 border border-slate-300 font-bold';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border border-rose-300 font-bold';
      case 'On Hold':
        return 'bg-purple-50 text-purple-800 border border-purple-300 font-bold';
      case 'Skipped':
        return 'bg-slate-50 text-slate-600 border border-slate-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-[10px] rounded-md';
      case 'lg':
        return 'px-3 py-1 text-xs rounded-md';
      default:
        return 'px-2.5 py-0.5 text-[11px] rounded-md';
    }
  };

  return (
    <span
      className={`clinic-status inline-flex items-center justify-center tracking-wider uppercase transition-all duration-150 ${getStyle()} ${getSize()} ${className}`}
    >
      {status === 'In Consultation' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
      )}
      {status}
    </span>
  );
};
