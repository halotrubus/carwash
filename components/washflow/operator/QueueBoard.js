'use client';

import React, { useMemo, useState } from 'react';
import { useWashflow } from '@/lib/washflow/store';
import { STATUS_FLOW, STATUS_META, getCategory, getPackage } from '@/lib/washflow/constants';
import { DEMO_IMAGES } from '@/lib/washflow/seed';
import { waitingSince } from '@/lib/washflow/format';
import { PageHeader, StatusBadge, DirtBadge, Money, EmptyState } from '../ui';
import OrderDetailBody from '../OrderDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Car, ArrowRight, Camera, Save } from 'lucide-react';

const FILTERS = [['all', 'Semua'], ...STATUS_FLOW.filter((s) => s !== 'dibayar').map((s) => [s, STATUS_META[s].label])];

export default function QueueBoard() {
  const { db, advanceOrder, addOrderResult } = useWashflow();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [resultNote, setResultNote] = useState('');
  const [afterPhotos, setAfterPhotos] = useState([]);

  const orders = useMemo(() => {
    let list = db.orders.filter((o) => o.status !== 'dibayar');
    if (filter !== 'all') list = list.filter((o) => o.status === filter);
    if (query.trim()) {
      const q = query.trim().toUpperCase();
      list = list.filter((o) => db.vehicles.find((v) => v.id === o.vehicleId)?.plate.toUpperCase().includes(q));
    }
    return list.sort((a, b) => a.queueNo - b.queueNo);
  }, [db, filter, query]);

  const openOrder = db.orders.find((o) => o.id === openId);

  const openDetail = (o) => { setOpenId(o.id); setResultNote(o.resultNote || ''); setAfterPhotos(o.photosAfter || []); };
  const doAdvance = (o) => {
    const meta = STATUS_META[o.status];
    advanceOrder(o.id);
    toast.success(`Status diperbarui: ${STATUS_META[meta.next]?.label}`);
  };
  const saveResult = () => {
    addOrderResult(openId, { resultNote, photosAfter: afterPhotos });
    toast.success('Catatan hasil & foto tersimpan');
  };

  return (
    <div>
      <PageHeader title="Board Antrean" desc="Kelola status pencucian kendaraan" />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nomor polisi..." className="pl-9" />
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${filter === id ? 'border-primary bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'}`}>{label}</button>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={Car} title="Tidak ada kendaraan" desc="Tidak ada order pada filter ini." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((o) => {
            const v = db.vehicles.find((x) => x.id === o.vehicleId);
            const meta = STATUS_META[o.status];
            const canAdvance = meta.next && o.status !== 'menunggu_pembayaran';
            return (
              <Card key={o.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">#{o.queueNo}</div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2"><span className="text-lg font-bold">{v?.plate}</span><DirtBadge level={o.dirtiness} /></div>
                    <div className="text-xs text-muted-foreground">{getCategory(o.categoryId)?.name} · {getPackage(o.packageId)?.name}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Menunggu {waitingSince(o.statusHistory[o.statusHistory.length - 1]?.at)}</span>
                    <Money value={o.priceSnapshot?.total} className="font-semibold" />
                  </div>
                  <div className="mt-auto flex gap-2 pt-1">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openDetail(o)}>Detail</Button>
                    {canAdvance ? <Button size="sm" className="flex-1" onClick={() => doAdvance(o)}>{meta.nextLabel} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button> : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!openId} onOpenChange={(v) => !v && setOpenId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Detail Order {openOrder?.orderNo}</DialogTitle></DialogHeader>
          {openOrder && <OrderDetailBody order={openOrder} />}
          {openOrder && ['finishing', 'selesai', 'menunggu_pembayaran'].includes(openOrder.status) && (
            <div className="rounded-lg border bg-muted/40 p-3">
              <div className="mb-2 text-sm font-semibold">Hasil Cuci & Foto Sesudah</div>
              <Textarea value={resultNote} onChange={(e) => setResultNote(e.target.value)} placeholder="Catatan hasil cuci..." rows={2} className="mb-2 bg-background" />
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setAfterPhotos((p) => [...p, DEMO_IMAGES.hero])}><Camera className="mr-1.5 h-4 w-4" /> Tambah Foto Demo</Button>
                {afterPhotos.map((p, i) => <img key={i} src={p} alt="after" className="h-12 w-16 rounded border object-cover" />)}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            {openOrder && ['finishing', 'selesai', 'menunggu_pembayaran'].includes(openOrder.status) ? <Button variant="secondary" onClick={saveResult}><Save className="mr-1.5 h-4 w-4" /> Simpan Hasil</Button> : null}
            {openOrder && STATUS_META[openOrder.status]?.next && openOrder.status !== 'menunggu_pembayaran' ? <Button onClick={() => { doAdvance(openOrder); setOpenId(null); }}>{STATUS_META[openOrder.status].nextLabel}</Button> : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
