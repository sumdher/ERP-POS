'use client';

import { tables } from '@/lib/data';
import { AppHeader } from './app-header';
import { TableCard } from './table-card';

export function TableManagement() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-headline text-foreground mb-6">Table Layout</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      </main>
    </div>
  );
}
