'use client';

import React, { useMemo, useState } from 'react';
import { useWashflow } from '@/lib/washflow/store';
import { PAYMENT_METHODS, DISCOUNT_LIMIT_NOMINAL, DISCOUNT_LIMIT_PERCENT, getCategory } from '@/lib/washflow/constants';
import { rupiah } from '@/lib/washflow/format';
import { PageHeader, StatusBadge, Money, EmptyState } from '../ui';
import OrderDetailBody from '../OrderDetail';
import Receipt from './Receipt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Receipt as ReceiptIcon, CreditCard, Printer, Share2, AlertTriangle, CheckCircle2, Wallet } from 'lucide-react';

export default function PaymentScreen() {
  const { db, createPayment, getVehicle, getCustomer } = useWashflow();
  const [payId, setPayId] = useState(null);
  const [method, setMethod] = useState('tunai');
  const [discType, setDiscType] = useState('nominal');
  const [discValue, setDiscValue] = useState('');
  const [receipt, setReceipt] = useState(null); // { order, payment }

  const readyOrders = useMemo(() => db.orders
    .filter((o) => o.status === 'selesai' || o.status === 'menunggu_pembayaran')
    .sort((a, b) => a.queueNo - b.queueNo), [db]);

  const payOrder = db.orders.find((o) => o.id === payId);
  const subtotal = payOrder?.priceSnapshot?.subtotal || 0;
  const discNominal = useMemo(() => {
    const v = Number(discValue) || 0;
    if (discType === 'percent') return Math.round(subtotal * Math.min(v, 100) / 100);
    return v;
  }, [discValue, discType, subtotal]);
  const overLimit = discType === 'percent' ? (Number(discValue) || 0) > DISCOUNT_LIMIT_PERCENT : discNominal > DISCOUNT_LIMIT_NOMINAL;
  const total = Math.max(0, subtotal - discNominal);

  const openPay = (o) => { setPayId(o.id); setMethod('tunai'); setDiscType('nominal'); setDiscValue(''); };

  const confirm = () => {
    if (overLimit) return;
    const pay = createPayment(payId, { method, discount: discNominal, discountType: discType });
    const updatedOrder = { ...payOrder, discount: discNominal, priceSnapshot: { ...payOrder.priceSnapshot, discount: discNominal, total } };
    setPayId(null);
    setReceipt({ order: updatedOrder, payment: pay });
    toast.success('Pembayaran berhasil — status: Dibayar/Diambil');
  };

  const shareWa = () => {
    const o = receipt.order; const p = receipt.payment;
    const v = getVehicle(o.vehicleId); const c = getCustomer(o.customerId);
    const num = (c?.whatsapp || '').replace(/\D/g, '').replace(/^0/, '62');
    const msg = `*${db.outlet.name}*%0AInvoice: ${p.invoiceNo}%0AKendaraan: ${v?.plate} (${getCategory(o.categoryId)?.name})%0ATotal: ${rupiah(p.total)}%0AMetode: ${p.method.toUpperCase()}%0A%0ATerima kasih! 🚗✨`;
    window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
  };

  return (
    <div>
      <PageHeader title="Daftar Pembayaran" desc="Order yang siap untuk dibayar" />
      {readyOrders.length === 0 ? (
        <EmptyState icon={ReceiptIcon} title="Belum ada yang siap bayar" desc="Order akan muncul setelah operator menandai Selesai." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {readyOrders.map((o) => {
            const v = getVehicle(o.vehicleId); const c = getCustomer(o.customerId);
            return (
              <Card key={o.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between"><span className="text-lg font-bold">{v?.plate}</span><StatusBadge status={o.status} /></div>
                  <div className="text-xs text-muted-foreground">{c?.name} · {getCategory(o.categoryId)?.name} · #{o.queueNo}</div>
                  <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Total</span><Money value={o.priceSnapshot?.total} className="text-lg font-bold text-primary" /></div>
                  <Button className="w-full" onClick={() => openPay(o)}><CreditCard className="mr-1.5 h-4 w-4" /> Proses Pembayaran</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Payment dialog */}
      <Dialog open={!!payId} onOpenChange={(v) => !v && setPayId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Pembayaran — {payOrder?.orderNo}</DialogTitle></DialogHeader>
          {payOrder && <OrderDetailBody order={payOrder} />}
          <div className="rounded-lg border bg-muted/40 p-4">
            <Label className="mb-2 block text-sm font-semibold">Metode Pembayaran</Label>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button key={m.id} onClick={() => setMethod(m.id)} className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${method === m.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>{m.name}</button>
              ))}
            </div>
            <Label className="mb-2 block text-sm font-semibold">Diskon <span className="font-normal text-muted-foreground">(maks {rupiah(DISCOUNT_LIMIT_NOMINAL)} atau {DISCOUNT_LIMIT_PERCENT}%)</span></Label>
            <div className="flex gap-2">
              <div className="inline-flex overflow-hidden rounded-lg border">
                <button onClick={() => setDiscType('nominal')} className={`px-3 py-2 text-sm font-semibold ${discType === 'nominal' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>Rp</button>
                <button onClick={() => setDiscType('percent')} className={`px-3 py-2 text-sm font-semibold ${discType === 'percent' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>%</button>
              </div>
              <Input type="number" value={discValue} onChange={(e) => setDiscValue(e.target.value)} placeholder="0" className="flex-1" />
            </div>
            {overLimit && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm font-medium text-red-700"><AlertTriangle className="h-4 w-4 shrink-0" /> Perlu persetujuan Admin.</div>
            )}
            <div className="mt-4 space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><Money value={subtotal} /></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Diskon</span><span className="text-emerald-600">- {rupiah(discNominal)}</span></div>
              <div className="flex justify-between text-lg font-bold"><span>Total Bayar</span><Money value={total} /></div>
            </div>
            <Button className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700" disabled={overLimit} onClick={confirm}><CheckCircle2 className="mr-1.5 h-4 w-4" /> Konfirmasi Pembayaran</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt dialog */}
      <Dialog open={!!receipt} onOpenChange={(v) => !v && setReceipt(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader className="no-print"><DialogTitle>Struk Pembayaran</DialogTitle></DialogHeader>
          {receipt && <Receipt order={receipt.order} payment={receipt.payment} />}
          <div className="no-print mt-3 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => window.print()}><Printer className="mr-1.5 h-4 w-4" /> Cetak Struk</Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={shareWa}><Share2 className="mr-1.5 h-4 w-4" /> Bagikan WhatsApp</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
