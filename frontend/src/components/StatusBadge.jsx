import React from 'react';

export default function StatusBadge({ status, size = 'md' }) {
  if (!status) return null;

  const s = status.toLowerCase();

  let bgClass = 'bg-[#10b981] text-white';

  if (s.includes('stunting') || s.includes('pendek') || s.includes('buruk')) {
    bgClass = 'bg-[#b91c1c] text-white';
  } else if (s.includes('kurang') || s.includes('risiko') || s.includes('waspada')) {
    bgClass = 'bg-[#eab308] text-white';
  } else if (s.includes('gizi baik')) {
    bgClass = 'bg-[#0077b6] text-white';
  } else if (s.includes('normal')) {
    bgClass = 'bg-[#10b981] text-white';
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[10px] font-bold rounded-md' 
    : size === 'lg'
    ? 'px-3.5 py-1 text-xs font-bold rounded-full'
    : 'px-2.5 py-0.5 text-[11px] font-bold rounded-full';

  return (
    <span className={`inline-flex items-center justify-center font-bold tracking-tight shadow-2xs ${bgClass} ${sizeClasses}`}>
      {status}
    </span>
  );
}
