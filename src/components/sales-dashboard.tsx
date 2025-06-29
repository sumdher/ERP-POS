'use client';

import { useMemo } from 'react';
import { useOrders } from '@/context/order-context';
import { AppHeader } from './app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { menuCategories } from '@/lib/data';

export function SalesDashboard() {
  const { completedOrders } = useOrders();

  const { totalRevenue, totalOrders, avgOrderValue } = useMemo(() => {
    const totalOrders = completedOrders.length;
    if (totalOrders === 0) {
      return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    }
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalRevenue / totalOrders;
    return { totalRevenue, totalOrders, avgOrderValue };
  }, [completedOrders]);

  const revenueByCategory = useMemo(() => {
    const categoryRevenue: Record<string, number> = {};

    menuCategories.forEach(cat => categoryRevenue[cat.name] = 0);

    completedOrders.forEach(order => {
      order.items.forEach(item => {
        const category = menuCategories.find(c => c.id === item.categoryId);
        if (category) {
          categoryRevenue[category.name] += item.price * item.quantity;
        }
      });
    });

    return Object.entries(categoryRevenue).map(([name, revenue]) => ({ name, revenue }));
  }, [completedOrders]);

  return (
    <div className="flex flex-col h-screen bg-secondary/40">
      <AppHeader backHref="/" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-headline text-foreground mb-6">Sales Dashboard</h2>
        
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-headline">${totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-headline">{totalOrders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-headline">${avgOrderValue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
            {/* Revenue by Category Chart */}
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    {completedOrders.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueByCategory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    cursor={{fill: 'hsl(var(--muted))'}}
                                    contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                                />
                                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            No sales data yet.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Transactions Table */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Table</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {completedOrders.slice(0, 7).map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.tableId}</TableCell>
                                    <TableCell>${order.total.toFixed(2)}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{order.completedAt.toLocaleTimeString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {completedOrders.length === 0 && (
                         <div className="py-10 text-center text-muted-foreground">
                            No transactions yet.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
