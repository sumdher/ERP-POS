import Link from 'next/link';
import { Utensils, ChevronLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  backHref?: string;
  className?: string;
  showDashboardButton?: boolean;
}

export function AppHeader({ backHref, className, showDashboardButton = false }: AppHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between p-4 border-b bg-card", className)}>
      <div className="flex items-center gap-3">
        {backHref ? (
          <Button variant="outline" size="icon" asChild>
            <Link href={backHref}>
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
        ) : (
          <Utensils className="h-8 w-8 text-primary" />
        )}
        <h1 className="text-xl md:text-2xl font-headline text-foreground">
          Restaurant ERP<span className="text-primary font-bold">+</span>POS
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {showDashboardButton && (
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
