'use client';

import React, { useState } from 'react';
import { useWashflow } from '@/lib/washflow/store';
import { VEHICLE_CATEGORIES, SERVICE_PACKAGES, DIRTINESS, ADDONS } from '@/lib/washflow/constants';
import { rupiah } from '@/lib/washflow/format';
import { PageHeader } from '../ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MasterPricing() {
  const { db, updatePriceCell, updateAddonPrice } = useWashflow();
  const [cat, setCat] = useState(VEHICLE_CATEGORIES[1].id);

  return (
    <div>
      <PageHeader title="Master Harga & Layanan" desc="Ubah matriks harga Ringan / Sedang / Berat dan harga layanan tambahan" action={<Button variant="outline" onClick={() => toast.success('Perubahan harga tersimpan otomatis')}><Save className="mr-1.5 h-4 w-4" /> Tersimpan Otomatis</Button>} />

      <div className="mb-4 flex flex-wrap gap-2">
        {VEHICLE_CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${cat === c.id ? 'border-primary bg-primary/10 text-primary' : 'bg-background hover:bg-muted'}`}>{c.name}</button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Matriks Harga — {VEHICLE_CATEGORIES.find((c) => c.id === cat)?.name}</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[520px] text-sm">
            <thead><tr className="border-b bg-muted/40 text-left"><th className="p-3 font-semibold">Paket</th>{DIRTINESS.map((d) => <th key={d.id} className="p-3 font-semibold">{d.name}</th>)}</tr></thead>
            <tbody>
              {SERVICE_PACKAGES.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{p.name}</td>
                  {DIRTINESS.map((d) => (
                    <td key={d.id} className="p-2">
                      <Input type="number" value={db.pricingMatrix[cat][p.id][d.id]} onChange={(e) => updatePriceCell(cat, p.id, d.id, e.target.value)} className="w-28" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader><CardTitle className="text-base">Harga Layanan Tambahan</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ADDONS.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <span className="text-sm font-medium">{a.name}</span>
              <Input type="number" value={db.addonPrices[a.id]} onChange={(e) => updateAddonPrice(a.id, e.target.value)} className="w-28" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
