'use client';

import React, { useMemo, useState } from 'react';
import { useWashflow } from '@/lib/washflow/store';
import { VEHICLE_CATEGORIES, SERVICE_PACKAGES, STATUS_FLOW, STATUS_META, PAYMENT_METHODS, getCategory, getPackage } from '@/lib/washflow/constants';
import { dayKey, rupiah, formatDate } from '@/lib/washflow/format';
import { StatCard, PageHeader, StatusBadge, Money, EmptyState } from '../ui';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, Car, Tag, Percent } from 'lucide-react';

function daysAgoIso(n) { const d = new Date(); d.setDate(d.getDate() - n); return dayKey(d.toISOString()); }

export default function Reports() {
  const { db, getVehicle, getPayment } = useWashflow();
  const [from, setFrom] = useState(daysAgoIso(6));
  const [to, setTo] = useState(daysAgoIso(0));
  const [cat, setCat] = useState('all');
  const [pkg, setPkg] = useState('all');
  const [status, setStatus] = useState('all');
  const [method, setMethod] = useState('all');

  const filtered = useMemo(() => db.orders.filter((o) => {
    const k = dayKey(o.createdAt);
    if (k < from || k > to) return false;
    if (cat !== 'all' && o.categoryId !== cat) return false;
    if (pkg !== 'all' && o.packageId !== pkg) return false;
    if (status !== 'all' && o.status !== status) return false;
    if (method !== 'all') {
      const p = o.paymentId ? getPayment(o.paymentId) : null;
      if (!p || p.method !== method) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [db, from, to, cat, pkg, status, method, getPayment]);

  const summary = useMemo(() => {
    let omzet = 0; let diskon = 0; const pkgCount = {}; const methodCount = {};
    filtered.forEach((o) => {
      const p = o.paymentId ? getPayment(o.paymentId) : null;
      if (p) { omzet += p.total; diskon += p.discount; methodCount[p.method] = (methodCount[p.method] || 0) + 1; }
      pkgCount[o.packageId] = (pkgCount[o.packageId] || 0) + 1;
    });
    const topPkg = Object.keys(pkgCount).sort((a, b) => pkgCount[b] - pkgCount[a])[0];
    return { omzet, diskon, count: filtered.length, topPkg, pkgCount, methodCount };
  }, [filtered, getPayment]);

  const selectCls = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm';

  return (
    <div>
      <PageHeader title="Laporan" desc="Analisis transaksi dengan filter lengkap" />
      <Card className="mb-4"><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <div><Label className="mb-1 block text-xs">Dari</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div><Label className="mb-1 block text-xs">Sampai</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <div><Label className="mb-1 block text-xs">Kategori</Label><select className={selectCls} value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">Semua</option>{VEHICLE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><Label className="mb-1 block text-xs">Paket</Label><select className={selectCls} value={pkg} onChange={(e) => setPkg(e.target.value)}><option value="all">Semua</option>{SERVICE_PACKAGES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div><Label className="mb-1 block text-xs">Status</Label><select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Semua</option>{STATUS_FLOW.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}</select></div>
        <div><Label className="mb-1 block text-xs">Metode</Label><select className={selectCls} value={method} onChange={(e) => setMethod(e.target.value)}><option value="all">Semua</option>{PAYMENT_METHODS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
      </CardContent></Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={Wallet} label="Total Omzet" value={<Money value={summary.omzet} />} tone="green" />
        <StatCard icon={Car} label="Jumlah Kendaraan" value={summary.count} tone="indigo" />
        <StatCard icon={Tag} label="Layanan Terlaris" value={getPackage(summary.topPkg)?.name || '-'} tone="cyan" />
        <StatCard icon={Percent} label="Total Diskon" value={<Money value={summary.diskon} />} tone="orange" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1"><CardContent className="p-4">
          <div className="mb-2 text-sm font-semibold">Metode Pembayaran</div>
          {PAYMENT_METHODS.map((m) => (
            <div key={m.id} className="flex justify-between py-1 text-sm"><span className="text-muted-foreground">{m.name}</span><span className="font-medium">{summary.methodCount[m.id] || 0} transaksi</span></div>
          ))}
        </CardContent></Card>
        <Card className="lg:col-span-2"><CardContent className="p-0">
          {filtered.length === 0 ? <div className="p-6"><EmptyState title="Tidak ada data" desc="Sesuaikan filter untuk melihat transaksi." /></div> : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Kendaraan</TableHead><TableHead>Paket</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.map((o) => { const v = getVehicle(o.vehicleId); return (
                    <TableRow key={o.id}>
                      <TableCell>{formatDate(o.createdAt)}</TableCell>
                      <TableCell>{v?.plate}</TableCell>
                      <TableCell>{getPackage(o.packageId)?.name}</TableCell>
                      <TableCell><StatusBadge status={o.status} /></TableCell>
                      <TableCell className="text-right font-semibold"><Money value={o.priceSnapshot?.total} /></TableCell>
                    </TableRow>
                  ); })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent></Card>
      </div>
    </div>
  );
}
