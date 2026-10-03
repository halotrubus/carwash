'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { rupiah } from '@/lib/washflow/format';
import { STATUS_META, DIRTINESS } from '@/lib/washflow/constants';

const TONES = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  violet: 'bg-violet-100 text-violet-700 border-violet-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  red: 'bg-red-100 text-red-700 border-red-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export function StatusBadge({ status, className = '' }) {
  const meta = STATUS_META[status] || { label: status, color: 'slate' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONES[meta.color]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </span>
  );
}

export function DirtBadge({ level, className = '' }) {
  const meta = DIRTINESS.find((d) => d.id === level) || DIRTINESS[0];
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${TONES[meta.color]} ${className}`}>
      {meta.name}
    </span>
  );
}

export function Money({ value, className = '' }) {
  return <span className={`tabular-nums ${className}`}>{rupiah(value)}</span>;
}

export function StatCard({ icon: Icon, label, value, sub, tone = 'indigo' }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-4 sm:p-5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-muted-foreground">{label}</div>
          <div className="truncate text-xl font-bold text-foreground sm:text-2xl">{value}</div>
          {sub ? <div className="truncate text-xs text-muted-foreground">{sub}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function PageHeader({ title, desc, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {desc ? <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      {Icon ? <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted"><Icon className="h-6 w-6 text-muted-foreground" /></div> : null}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {desc ? <p className="mt-1 max-w-sm text-sm text-muted-foreground">{desc}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export { TONES };
