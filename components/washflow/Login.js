'use client';

import React from 'react';
import { useWashflow } from '@/lib/washflow/store';
import { ROLES } from '@/lib/washflow/constants';
import { DEMO_IMAGES } from '@/lib/washflow/seed';
import { formatDateFull } from '@/lib/washflow/format';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, ShieldCheck, Wrench, Receipt, ArrowRight } from 'lucide-react';

const ROLE_ICONS = { admin: ShieldCheck, operator: Wrench, kasir: Receipt };

export default function Login() {
  const { login } = useWashflow();
  const today = formatDateFull(new Date().toISOString());

  return (
    <div className="min-h-screen w-full bg-slate-950 lg:grid lg:grid-cols-2">
      {/* Hero */}
      <div className="relative hidden lg:block">
        <img src={DEMO_IMAGES.hero} alt="Car wash" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-indigo-800/70 to-cyan-700/60" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><Droplets className="h-6 w-6" /></div>
            <span className="text-lg font-bold">WashFlow Carwash</span>
          </div>
          <div>
            <h1 className="max-w-md text-4xl font-extrabold leading-tight">Sistem POS & Administrasi Carwash modern.</h1>
            <p className="mt-4 max-w-md text-indigo-100">Kelola penerimaan kendaraan, inspeksi, antrean cuci, pembayaran, hingga laporan omzet — dalam satu aplikasi.</p>
          </div>
          <p className="text-sm text-indigo-200">Demo interaktif · data tersimpan di perangkat Anda</p>
        </div>
      </div>

      {/* Role picker */}
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Droplets className="h-6 w-6" /></div>
            <span className="text-lg font-bold">WashFlow Carwash</span>
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Login Demo</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pilih peran untuk masuk — tanpa kata sandi. {today}.</p>
          </div>
          <div className="space-y-3">
            {Object.values(ROLES).map((r) => {
              const Icon = ROLE_ICONS[r.id];
              return (
                <Card
                  key={r.id}
                  onClick={() => login(r.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') login(r.id); }}
                  className="group flex cursor-pointer items-center gap-4 p-4 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">{r.label}</div>
                    <div className="truncate text-sm text-muted-foreground">{r.desc}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Card>
              );
            })}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">Akun demo: Budi (Admin) · Andi (Operator) · Sari (Kasir)</p>
        </div>
      </div>
    </div>
  );
}
