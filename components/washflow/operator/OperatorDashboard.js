'use client';

import React, { useMemo } from 'react';
import { useWashflow } from '@/lib/washflow/store';
import { STATUS_FLOW, STATUS_META, getCategory, getPackage } from '@/lib/washflow/constants';
import { isToday, waitingSince } from '@/lib/washflow/format';
import { StatCard, PageHeader, StatusBadge, DirtBadge, Money, EmptyState } from '../ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Car, Clock, Droplets, CheckCircle2, ListChecks } from 'lucide-react';

export default function OperatorDashboard({ navigate }) {
  const { db } = useWashflow();
  const active = useMemo(() => db.orders.filter((o) => o.status !== 'dibayar'), [db]);
  const todayCount = useMemo(() => db.orders.filter((o) => isToday(o.createdAt)).length, [db]);
  const counts = useMemo(() => {
    const c = {};
    STATUS_FLOW.forEach((s) => { c[s] = 0; });
    db.orders.forEach((o) => { if (o.status !== 'dibayar') c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [db]);
  const inProcess = counts.dicuci + counts.finishing;

  return (
    <div>
      <PageHeader
        title="Dashboard Antrean"
        desc="Pantau kendaraan yang sedang diproses hari ini"
        action={<Button size="lg" onClick={() => navigate('terima')}><Plus className="mr-2 h-5 w-5" /> Terima Kendaraan</Button>}
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Car} label="Kendaraan Hari Ini" value={todayCount} tone="indigo" />
        <StatCard icon={Clock} label="Menunggu" value={counts.menunggu} tone="slate" />
        <StatCard icon={Droplets} label="Sedang Diproses" value={inProcess} tone="cyan" />
        <StatCard icon={CheckCircle2} label="Selesai / Siap Bayar" value={counts.selesai + counts.menunggu_pembayaran} tone="emerald" />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-base font-semibold">Antrean Aktif</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('antrean')}>Lihat Board <ListChecks className="ml-1.5 h-4 w-4" /></Button>
      </div>
      <div className="mt-3 space-y-3">
        {active.length === 0 ? (
          <EmptyState icon={Car} title="Belum ada antrean aktif" desc="Mulai dengan menerima kendaraan baru." action={<Button onClick={() => navigate('terima')}><Plus className="mr-2 h-4 w-4" /> Terima Kendaraan</Button>} />
        ) : active.slice(0, 6).map((o) => {
          const v = db.vehicles.find((x) => x.id === o.vehicleId);
          return (
            <Card key={o.id} className="transition-colors hover:border-primary/40">
              <CardContent className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">#{o.queueNo}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="font-bold">{v?.plate}</span><DirtBadge level={o.dirtiness} /></div>
                  <div className="truncate text-xs text-muted-foreground">{getCategory(o.categoryId)?.name} · {getPackage(o.packageId)?.name} · menunggu {waitingSince(o.statusHistory[o.statusHistory.length - 1]?.at)}</div>
                </div>
                <Money value={o.priceSnapshot?.total} className="font-semibold" />
                <StatusBadge status={o.status} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
