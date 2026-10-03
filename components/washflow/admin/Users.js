'use client';

import React from 'react';
import { useWashflow } from '@/lib/washflow/store';
import { ROLES } from '@/lib/washflow/constants';
import { PageHeader } from '../ui';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, Wrench, Receipt } from 'lucide-react';

const ICONS = { admin: ShieldCheck, operator: Wrench, kasir: Receipt };

export default function Users() {
  const { db } = useWashflow();
  return (
    <div>
      <PageHeader title="Akun Role Demo" desc="Daftar akun pengguna demo per peran" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {db.users.map((u) => {
          const Icon = ICONS[u.role] || ShieldCheck;
          return (
            <Card key={u.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{u.initial}</div>
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {ROLES[u.role]?.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
