'use client';

import React, { useMemo, useState } from 'react';
import { useWashflow } from '@/lib/washflow/store';
import {
  VEHICLE_CATEGORIES, SERVICE_PACKAGES, ADDONS, DIRTINESS,
  getChecklistFor, getCategory, getPackage,
} from '@/lib/washflow/constants';
import { computePrice, recommendDirtiness } from '@/lib/washflow/pricing';
import { DEMO_IMAGES } from '@/lib/washflow/seed';
import { rupiah } from '@/lib/washflow/format';
import { PageHeader, DirtBadge, Money } from '../ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Search, History, ImagePlus, X, ArrowLeft, ArrowRight, CheckCircle2, Camera } from 'lucide-react';

const STEPS = ['Data Kendaraan', 'Inspeksi Awal', 'Ringkasan & Order'];

function LevelToggle({ value, onChange }) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border">
      {DIRTINESS.map((d) => {
        const activeCls = {
          ringan: 'bg-emerald-500 text-white',
          sedang: 'bg-amber-500 text-white',
          berat: 'bg-red-500 text-white',
        }[d.id];
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onChange(d.id)}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${value === d.id ? activeCls : 'bg-background text-muted-foreground hover:bg-muted'}`}
          >{d.name}</button>
        );
      })}
    </div>
  );
}

export default function ReceiveVehicle({ navigate }) {
  const { db, findVehicleByPlate, vehicleHistory, getCustomer, createOrder } = useWashflow();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ plate: '', customerName: '', whatsapp: '', categoryId: '', brand: '', color: '', packageId: '', addonIds: [], operatorNote: '' });
  const [found, setFound] = useState(null);
  const [indicators, setIndicators] = useState({});
  const [chosen, setChosen] = useState('ringan');
  const [chosenTouched, setChosenTouched] = useState(false);
  const [reason, setReason] = useState('');
  const [visualNotes, setVisualNotes] = useState('');
  const [photos, setPhotos] = useState([]);
  const [approved, setApproved] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const checklist = useMemo(() => (form.categoryId ? getChecklistFor(form.categoryId) : []), [form.categoryId]);
  const recommended = useMemo(() => recommendDirtiness(Object.values(indicators)), [indicators]);
  const effectiveChosen = chosenTouched ? chosen : recommended;

  const handleSearch = () => {
    const v = findVehicleByPlate(form.plate);
    if (v) {
      const c = getCustomer(v.customerId);
      setFound({ vehicle: v, customer: c, history: vehicleHistory(v.id) });
      setForm((f) => ({ ...f, customerName: c?.name || '', whatsapp: c?.whatsapp || '', categoryId: v.categoryId, brand: v.brand || '', color: v.color || '' }));
      toast.success('Kendaraan ditemukan — data pelanggan dimuat');
    } else {
      setFound(null);
      toast.info('Kendaraan baru — silakan lengkapi data');
    }
  };

  const toggleAddon = (id) => set('addonIds', form.addonIds.includes(id) ? form.addonIds.filter((x) => x !== id) : [...form.addonIds, id]);

  const onPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setPhotos((p) => [...p, reader.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };
  const addPlaceholder = () => { setPhotos((p) => [...p, DEMO_IMAGES.dirty[p.length % DEMO_IMAGES.dirty.length]]); toast.success('Foto placeholder demo ditambahkan'); };

  const price = useMemo(() => computePrice(db, { categoryId: form.categoryId, packageId: form.packageId, dirtiness: effectiveChosen, addonIds: form.addonIds }, 0), [db, form, effectiveChosen]);

  const validStep0 = form.plate.trim() && form.categoryId && form.packageId;
  const needReason = effectiveChosen !== recommended;
  const validStep1 = !needReason || reason.trim();

  const next = () => {
    if (step === 0 && !validStep0) { toast.error('Lengkapi nomor polisi, kategori, dan paket layanan'); return; }
    if (step === 1 && !validStep1) { toast.error('Isi alasan karena tingkat kotor berbeda dari rekomendasi'); return; }
    setStep((s) => Math.min(s + 1, 2));
  };

  const submit = () => {
    if (!approved) { toast.error('Centang persetujuan estimasi harga pelanggan'); return; }
    const order = createOrder({
      ...form,
      operatorNote: form.operatorNote,
      inspection: { indicators, recommended, chosen: effectiveChosen, reason, visualNotes, photos },
    });
    toast.success(`Order dibuat — No. Antrean #${order.queueNo}`, { description: `${order.orderNo} · ${rupiah(order.priceSnapshot.total)}` });
    navigate('antrean');
  };

  return (
    <div className="pb-24">
      <PageHeader title="Terima Kendaraan" desc="Daftarkan kendaraan, lakukan inspeksi, lalu buat order" />

      {/* Stepper */}
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
              <span className={`hidden text-sm font-medium sm:block ${i === step ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 ? <div className={`h-0.5 flex-1 ${i < step ? 'bg-primary' : 'bg-border'}`} /> : null}
          </React.Fragment>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <Card><CardContent className="space-y-4 p-4 sm:p-5">
            <div>
              <Label className="mb-1.5 block">Nomor Polisi <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input value={form.plate} onChange={(e) => set('plate', e.target.value.toUpperCase())} placeholder="B 1234 ABC" className="uppercase" />
                <Button type="button" variant="secondary" onClick={handleSearch}><Search className="mr-1.5 h-4 w-4" /> Cari</Button>
              </div>
            </div>
            {found && (
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-cyan-800"><History className="h-4 w-4" /> Pelanggan Berulang</div>
                <p className="text-sm text-cyan-900">{found.customer?.name} · {found.vehicle.brand} ({found.vehicle.color}) · {found.history.length} kunjungan sebelumnya</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="mb-1.5 block">Nama Pelanggan</Label><Input value={form.customerName} onChange={(e) => set('customerName', e.target.value)} placeholder="Nama" /></div>
              <div><Label className="mb-1.5 block">Nomor WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="08xx" /></div>
              <div><Label className="mb-1.5 block">Merek / Model</Label><Input value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="opsional" /></div>
              <div><Label className="mb-1.5 block">Warna</Label><Input value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="opsional" /></div>
            </div>
            <div>
              <Label className="mb-1.5 block">Kategori Kendaraan <span className="text-red-500">*</span></Label>
              <div className="flex flex-wrap gap-2">
                {VEHICLE_CATEGORIES.map((c) => (
                  <button key={c.id} type="button" onClick={() => set('categoryId', c.id)} className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${form.categoryId === c.id ? 'border-primary bg-primary/10 text-primary' : 'bg-background hover:bg-muted'}`}>{c.name}</button>
                ))}
              </div>
            </div>
          </CardContent></Card>

          <div>
            <Label className="mb-2 block">Paket Layanan <span className="text-red-500">*</span></Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICE_PACKAGES.map((p) => {
                const prc = form.categoryId ? db.pricingMatrix[form.categoryId][p.id].ringan : null;
                return (
                  <Card key={p.id} onClick={() => set('packageId', p.id)} role="button" className={`cursor-pointer p-4 transition-all ${form.packageId === p.id ? 'border-primary ring-2 ring-primary/30' : 'hover:border-primary/40'}`}>
                    <div className="flex items-start justify-between">
                      <div><div className="font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">{p.desc}</div></div>
                      {form.packageId === p.id ? <CheckCircle2 className="h-5 w-5 text-primary" /> : null}
                    </div>
                    {prc != null ? <div className="mt-2 text-sm font-semibold text-primary">mulai {rupiah(prc)}</div> : null}
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Layanan Tambahan</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {ADDONS.map((a) => (
                <label key={a.id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted">
                  <Checkbox checked={form.addonIds.includes(a.id)} onCheckedChange={() => toggleAddon(a.id)} />
                  <span className="flex-1 text-sm font-medium">{a.name}</span>
                  <span className="text-sm text-muted-foreground">{rupiah(db.addonPrices[a.id])}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Card><CardContent className="space-y-3 p-4 sm:p-5">
            <div className="text-sm font-semibold">Checklist Inspeksi — {getCategory(form.categoryId)?.name}</div>
            {checklist.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 last:border-0">
                <span className="text-sm font-medium">{item.label}</span>
                <LevelToggle value={indicators[item.id]} onChange={(v) => setIndicators((p) => ({ ...p, [item.id]: v }))} />
              </div>
            ))}
          </CardContent></Card>

          <Card><CardContent className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><div className="text-sm font-semibold">Rekomendasi Tingkat Kotor</div><div className="text-xs text-muted-foreground">Dihitung otomatis dari checklist</div></div>
              <DirtBadge level={recommended} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Tingkat kotor final (boleh diubah)</Label>
              <LevelToggle value={effectiveChosen} onChange={(v) => { setChosen(v); setChosenTouched(true); }} />
            </div>
            {needReason && (
              <div><Label className="mb-1.5 block text-xs text-amber-700">Alasan mengubah rekomendasi <span className="text-red-500">*</span></Label><Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Mis. lumpur sudah mengering" /></div>
            )}
          </CardContent></Card>

          <Card><CardContent className="space-y-3 p-4 sm:p-5">
            <Label className="block text-sm font-semibold">Catatan Kondisi Visual</Label>
            <Textarea value={visualNotes} onChange={(e) => setVisualNotes(e.target.value)} placeholder="Baret, penyok, kaca retak, aksesori longgar, dll." rows={2} />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => document.getElementById('photo-input').click()}><ImagePlus className="mr-1.5 h-4 w-4" /> Upload Foto</Button>
              <Button type="button" variant="outline" onClick={addPlaceholder}><Camera className="mr-1.5 h-4 w-4" /> Foto Placeholder Demo</Button>
              <input id="photo-input" type="file" accept="image/*" multiple className="hidden" onChange={onPhotos} />
            </div>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative">
                    <img src={p} alt="preview" className="h-20 w-28 rounded-md border object-cover" />
                    <button type="button" onClick={() => setPhotos((arr) => arr.filter((_, idx) => idx !== i))} className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
            <div><Label className="mb-1.5 block text-xs">Catatan Operator</Label><Input value={form.operatorNote} onChange={(e) => set('operatorNote', e.target.value)} placeholder="opsional" /></div>
          </CardContent></Card>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Card><CardContent className="p-4 sm:p-5">
            <div className="mb-3 text-sm font-semibold">Ringkasan Harga</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Kategori</span><span className="font-medium">{getCategory(form.categoryId)?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Paket</span><span className="font-medium">{getPackage(form.packageId)?.name}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Tingkat kotor</span><DirtBadge level={effectiveChosen} /></div>
              <Separator className="my-2" />
              <div className="flex justify-between"><span className="text-muted-foreground">Harga paket</span><Money value={price.base} /></div>
              {price.addonItems.map((a) => (<div key={a.id} className="flex justify-between"><span className="text-muted-foreground">+ {a.name}</span><Money value={a.price} /></div>))}
              <Separator className="my-2" />
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><Money value={price.subtotal} /></div>
              <div className="flex justify-between pt-1 text-lg font-bold"><span>Total</span><Money value={price.total} /></div>
            </div>
          </CardContent></Card>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-4">
            <Checkbox checked={approved} onCheckedChange={setApproved} className="mt-0.5" />
            <span className="text-sm font-medium">Pelanggan menyetujui estimasi harga di atas</span>
          </label>
        </div>
      )}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 p-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-1">
          <div className="min-w-0">
            {step === 2 ? <div className="text-sm"><span className="text-muted-foreground">Total </span><span className="text-lg font-bold text-primary">{rupiah(price.total)}</span></div> : <span className="text-sm text-muted-foreground">Langkah {step + 1} dari 3</span>}
          </div>
          <div className="flex gap-2">
            {step > 0 ? <Button variant="outline" onClick={() => setStep((s) => s - 1)}><ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali</Button> : <Button variant="outline" onClick={() => navigate('dashboard')}>Batal</Button>}
            {step < 2 ? <Button onClick={next}>Lanjutkan <ArrowRight className="ml-1.5 h-4 w-4" /></Button> : <Button onClick={submit} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-1.5 h-4 w-4" /> Buat Order</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
