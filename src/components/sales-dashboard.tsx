'use client';

import { useState, useEffect, useMemo } from 'react';
import { AppHeader } from './app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getSalesDataFromERP } from '@/lib/actions';
import type { SalesInvoice } from '@/lib/erpnext';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

export function SalesDashboard() {
  const [salesData, setSalesData] = useState<SalesInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSalesData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSalesDataFromERP();
        setSalesData(data);
      } catch (err) {
        console.error("Failed to fetch sales data:", err);
        setError("Could not load sales data from ERPNext. Please ensure the server is running and credentials are correct.");
      } finally {
        setIsLoading(false);
      }
    }
    loadSalesData();
  }, []);

  const { totalRevenue, totalOrders, avgOrderValue } = useMemo(() => {
    const totalOrders = salesData.length;
    if (totalOrders === 0) {
      return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    }
    const totalRevenue = salesData.reduce((sum, order) => sum + order.grand_total, 0);
    const avgOrderValue = totalRevenue / totalOrders;
    return { totalRevenue, totalOrders, avgOrderValue };
  }, [salesData]);

  const KpiCard = ({ title, value, isLoading }: { title: string, value: string, isLoading: boolean }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4" />
        ) : (
          <p className="text-3xl font-bold font-headline">{value}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-screen bg-secondary/40">
      <AppHeader backHref="/" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-headline text-foreground mb-6">Sales Dashboard</h2>
        
        {error && (
            <Alert variant="destructive" className="mb-6">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <KpiCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} isLoading={isLoading} />
          <KpiCard title="Completed Orders" value={totalOrders.toString()} isLoading={isLoading} />
          <KpiCard title="Average Order Value" value={`$${avgOrderValue.toFixed(2)}`} isLoading={isLoading} />
        </div>

        <div className="grid gap-8">
            {/* Recent Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions (Live from ERPNext)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : salesData.length > 0 ? (
                                salesData.map(order => (
                                    <TableRow key={order.name}>
                                        <TableCell className="font-medium">{order.name}</TableCell>
                                        <TableCell>{order.customer}</TableCell>
                                        <TableCell>${order.grand_total.toFixed(2)}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{new Date(order.posting_date).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No transactions found in ERPNext.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
