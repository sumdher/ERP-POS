'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { menuCategories, menuItems, type MenuItem } from '@/lib/data';
import { AppHeader } from './app-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, MinusCircle, Trash2, Printer, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PaymentDialog } from './payment-dialog';
import { cn } from '@/lib/utils';

export interface OrderItem extends MenuItem {
  quantity: number;
}

export function OrderInterface({ tableId }: { tableId: string }) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddItem = (item: MenuItem) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      setOrderItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
      );
    }
  };

  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [orderItems]);

  const handleSendToKitchen = () => {
    if (orderItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Empty Order',
        description: 'Please add items to the order before sending to the kitchen.',
      });
      return;
    }
    toast({
      title: 'Order Sent!',
      description: `Order for table ${tableId} has been sent to the kitchen.`,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader backHref="/" />
      <div className="flex-1 grid md:grid-cols-3 gap-0 overflow-hidden">
        {/* Menu Section */}
        <div className="md:col-span-2 flex flex-col overflow-hidden">
          <Tabs defaultValue={menuCategories[0].id} className="flex-1 flex flex-col p-4 overflow-hidden">
            <TabsList className="mb-4 bg-muted">
              {menuCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="text-sm md:text-base">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollArea className="flex-1">
              {menuCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-0">
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {menuItems
                      .filter((item) => item.categoryId === category.id)
                      .map((item) => (
                        <Card key={item.id} className="overflow-hidden flex flex-col group cursor-pointer" onClick={() => handleAddItem(item)}>
                          <CardHeader className="p-0 relative">
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={300}
                              height={200}
                              className="aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
                              data-ai-hint={item.hint}
                            />
                          </CardHeader>
                          <CardContent className="p-3 flex-1">
                            <h3 className="font-semibold font-headline text-lg">{item.name}</h3>
                          </CardContent>
                          <CardFooter className="p-3 pt-0 flex justify-between items-center">
                            <p className="text-muted-foreground font-semibold">${item.price.toFixed(2)}</p>
                            <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Add</Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </div>

        {/* Order Summary Section */}
        <aside className="md:col-span-1 bg-card border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-2xl font-headline">Order for Table {tableId}</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              {orderItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">No items added yet.</p>
              ) : (
                <ul className="space-y-4">
                  {orderItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-4">
                      <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-md object-cover aspect-square" data-ai-hint={item.hint} />
                      <div className="flex-1">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => handleUpdateQuantity(item.id, 0)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ScrollArea>
          {orderItems.length > 0 && (
            <div className="p-4 border-t mt-auto space-y-4 bg-card">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-bold text-xl">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button size="lg" variant="outline" onClick={handleSendToKitchen}>
                  <Printer className="mr-2 h-4 w-4" />
                  To Kitchen
                </Button>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setIsPaymentDialogOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Bill & Pay
                </Button>
              </div>
            </div>
          )}
        </aside>
      </div>
      <PaymentDialog 
        isOpen={isPaymentDialogOpen} 
        onOpenChange={setIsPaymentDialogOpen} 
        totalAmount={total}
        orderItems={orderItems}
        tableId={tableId}
      />
    </div>
  );
}
