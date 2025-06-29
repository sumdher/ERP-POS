import Link from 'next/link';
import type { Table } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TableCardProps {
  table: Table;
}

const statusStyles: { [key in Table['status']]: string } = {
  available: 'bg-secondary text-secondary-foreground border-transparent',
  occupied: 'bg-primary/20 text-primary-foreground border-primary/30',
  billing: 'bg-accent/80 text-accent-foreground border-transparent',
};

const statusText: { [key in Table['status']]: string } = {
  available: 'Available',
  occupied: 'Occupied',
  billing: 'Billing',
};

export function TableCard({ table }: TableCardProps) {
  return (
    <Link href={`/order/${table.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-32 flex flex-col justify-between hover:border-primary/50">
        <CardContent className="p-4 flex flex-col justify-between items-center h-full">
          <div className="text-3xl font-bold font-headline text-foreground">{table.id}</div>
          <Badge className={cn('text-xs capitalize', statusStyles[table.status])}>
            {statusText[table.status]}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
