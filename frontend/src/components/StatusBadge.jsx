import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HeartHandshake } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  if (!status) return null;

  const s = status.toLowerCase();

  let badgeStyle = {
    container: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    icon: CheckCircle2,
    iconColor: 'text-[#00a86b]',
  };

  if (s.includes('stunting') || s.includes('sangat pendek') || s.includes('buruk')) {
    badgeStyle = {
      container: 'bg-rose-50 text-rose-800 border-rose-200/80',
      icon: AlertOctagon,
      iconColor: 'text-rose-600',
    };
  } else if (s.includes('pendek') || s.includes('kurang') || s.includes('risiko') || s.includes('waspada')) {
    badgeStyle = {
      container: 'bg-amber-50 text-amber-800 border-amber-200/80',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
    };
  } else if (s.includes('gizi baik')) {
    badgeStyle = {
      container: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      icon: CheckCircle2,
      iconColor: 'text-[#00a86b]',
    };
  } else if (s.includes('normal')) {
    badgeStyle = {
      container: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      icon: CheckCircle2,
      iconColor: 'text-[#00a86b]',
    };
  }

  const Icon = badgeStyle.icon;

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1 rounded-md'
      : size === 'lg'
      ? 'px-3.5 py-1 text-xs sm:text-sm gap-1.5 rounded-full'
      : 'px-2.5 py-1 text-xs gap-1.5 rounded-full';

  const iconSizes =
    size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center font-semibold tracking-tight border ${badgeStyle.container} ${sizeClasses}`}
    >
      <Icon className={`${iconSizes} ${badgeStyle.iconColor} shrink-0`} />
      <span>{status}</span>
    </span>
  );
}
