'use client';

import React from 'react';
import { useWashflow } from '@/lib/washflow/store';
import { getCategory, getPackage } from '@/lib/washflow/constants';
import { formatDateTime, formatTime } from '@/lib/washflow/format';
import { STATUS_META } from '@/lib/washflow/constants';
import { DirtBadge, Money } from './ui';
import { Separator } from '@/components/ui/separator';
import { Car, User, ClipboardCheck, Receipt } from 'lucide-react';

function Row({ label, children }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}

export default function OrderDetailBody({ order }) {
  const { getVehicle, getCustomer, getInspection } = useWashflow();
  if (!order) return null;
  const vehicle = getVehicle(order.vehicleId);
  const customer = getCustomer(order.customerId);
  const insp = getInspection(order.inspectionId);
  const cat = getCategory(order.categoryId);
  const pkg = getPackage(order.packageId);
  const snap = order.priceSnapshot || {};

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Car className="h-4 w-4 text-primary" /> Kendaraan</div>
          <Row label="Nomor Polisi">{vehicle?.plate}</Row>
          <Row label="Kategori">{cat?.name}</Row>
          <Row label="Merek / Model">{vehicle?.brand || '-'}</Row>
          <Row label="Warna">{vehicle?.color || '-'}</Row>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><User className="h-4 w-4 text-primary" /> Pelanggan</div>
          <Row label="Nama">{customer?.name || '-'}</Row>
          <Row label="WhatsApp">{customer?.whatsapp || '-'}</Row>
          <Row label="No. Order">{order.orderNo}</Row>
          <Row label="No. Antrean">#{order.queueNo}</Row>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><ClipboardCheck className="h-4 w-4 text-primary" /> Hasil Inspeksi Awal</div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Rekomendasi sistem:</span>
          <DirtBadge level={insp?.recommended} />
          <span className="text-muted-foreground">· Dipilih:</span>
          <DirtBadge level={order.dirtiness} />
        </div>
        {insp?.reason ? <p className="text-sm text-amber-700">Alasan ubah: {insp.reason}</p> : null}
        {insp?.indicators && Object.keys(insp.indicators).length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(insp.indicators).map(([k, v]) => (
              <span key={k} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">{k}: <b className="text-foreground">{v}</b></span>
            ))}
          </div>
        ) : null}
        {insp?.visualNotes ? <p className="mt-2 text-sm text-foreground">Catatan visual: {insp.visualNotes}</p> : null}
        {order.operatorNote ? <p className="mt-1 text-sm text-muted-foreground">Catatan operator: {order.operatorNote}</p> : null}
        {(order.photosBefore?.length || 0) > 0 ? (
          <div className="mt-3">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Foto kondisi awal</div>
            <div className="flex flex-wrap gap-2">
              {order.photosBefore.map((p, i) => (
                <img key={i} src={p} alt="before" className="h-20 w-28 rounded-md border object-cover" />
              ))}
            </div>
          </div>
        ) : null}
        {order.resultNote ? <p className="mt-2 text-sm text-emerald-700">Hasil cuci: {order.resultNote}</p> : null}
        {(order.photosAfter?.length || 0) > 0 ? (
          <div className="mt-2">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Foto sesudah</div>
            <div className="flex flex-wrap gap-2">
              {order.photosAfter.map((p, i) => (
                <img key={i} src={p} alt="after" className="h-20 w-28 rounded-md border object-cover" />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border bg-card p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Receipt className="h-4 w-4 text-primary" /> Rincian Harga</div>
        <Row label={`${pkg?.name} (${cat?.name} · kotor ${order.dirtiness})`}><Money value={snap.base} /></Row>
        {(snap.addonItems || []).map((a) => (<Row key={a.id} label={`+ ${a.name}`}><Money value={a.price} /></Row>))}
        <Separator className="my-2" />
        <Row label="Subtotal"><Money value={snap.subtotal} /></Row>
        {snap.discount > 0 ? <Row label="Diskon"><span className="text-emerald-600">- <Money value={snap.discount} /></span></Row> : null}
        <div className="flex justify-between pt-1 text-base font-bold"><span>Total</span><Money value={snap.total} /></div>
      </div>

      <div className="rounded-lg border bg-card p-3">
        <div className="mb-2 text-sm font-semibold">Riwayat Status</div>
        <ol className="space-y-1.5">
          {order.statusHistory.map((h, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />{STATUS_META[h.status]?.label || h.status}</span>
              <span className="text-xs text-muted-foreground">{formatDateTime(h.at)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
