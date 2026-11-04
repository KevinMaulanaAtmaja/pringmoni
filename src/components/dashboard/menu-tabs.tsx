'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MenuManagement } from '@/components/dashboard/menu-management';
import { VoucherManagement } from '@/components/dashboard/voucher-management';
import { UtensilsCrossed, Ticket } from 'lucide-react';

/**
 * Halaman Menu memuat dua tab: pengelolaan menu dan pengelolaan voucher.
 * TabsList diletakkan sejajar dengan header (di atas tombol Tambah) agar tidak
 * memakan ruang vertikal tersendiri. Voucher bukan item sidebar terpisah.
 */
export function MenuTabs() {
  const [tab, setTab] = useState('menu');

  const tabs = (
    <TabsList className="rounded-xl bg-muted p-1">
      <TabsTrigger value="menu" className="gap-1.5 rounded-lg px-4 data-active:bg-background">
        <UtensilsCrossed className="size-4" />
        Menu
      </TabsTrigger>
      <TabsTrigger value="voucher" className="gap-1.5 rounded-lg px-4 data-active:bg-background">
        <Ticket className="size-4" />
        Voucher
      </TabsTrigger>
    </TabsList>
  );

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full gap-0">
      {tab === 'menu' ? <MenuManagement tabs={tabs} /> : <VoucherManagement tabs={tabs} />}
    </Tabs>
  );
}
