'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { menuCategories, menuItems, type MenuItem, type OrderItem } from '@/lib/data';
import { AppHeader } from './app-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, MinusCircle, Trash2, Printer, CreditCard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PaymentDialog } from './payment-dialog';
import { cn } from '@/lib/utils';
import { saveKotToFile } from '@/lib/actions';
import { useOrders } from '@/context/order-context';

export function OrderInterface({ tableId }: { tableId: string }) {
  const { 
    getOrderByTableId, 
    addItemToOrder, 
    updateOrderItemQuantity,
    updateOrderStatus
  } = useOrders();
  const orderItems = getOrderByTableId(tableId);

  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const categoryMap = useMemo(() => {
    return menuCategories.reduce((acc, category) => {
      acc[category.id] = category.name;
      return acc;
    }, {} as Record<string, string>);
  }, []);

  const handleAddItem = (item: MenuItem) => {
    addItemToOrder(tableId, item);
  };

  const handleUpdateQuantity = (orderItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      updateOrderItemQuantity(tableId, orderItemId, 0);
      setSelectedItemIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderItemId);
        return newSet;
      });
    } else {
      updateOrderItemQuantity(tableId, orderItemId, newQuantity);
    }
  };

  const handleToggleSelectItem = (orderItemId: string) => {
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderItemId)) {
        newSet.delete(orderItemId);
      } else {
        newSet.add(orderItemId);
      }
      return newSet;
    });
  };

  const newItems = useMemo(() => orderItems.filter((item) => item.status === 'new'), [orderItems]);

  const handleToggleSelectAll = () => {
    if (newItems.length > 0 && selectedItemIds.size === newItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(newItems.map((item) => item.orderItemId)));
    }
  };

  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [orderItems]);

  const handleSendToKitchen = async () => {
    const itemsToSendIds = Array.from(selectedItemIds);
    const itemsToSend = orderItems.filter((item) => itemsToSendIds.includes(item.orderItemId));

    if (itemsToSend.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Items Selected',
        description: 'Please select items to send to the kitchen.',
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await saveKotToFile({ tableId, orderItems: itemsToSend });

      if (result.success) {
        toast({
          title: 'Order Sent!',
          description: `Selected items for table ${tableId} sent to the kitchen.`,
        });
        updateOrderStatus(tableId, itemsToSendIds, 'sent');
        setSelectedItemIds(new Set());
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to send order to the kitchen.',
        });
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
       toast({
        variant: 'destructive',
        title: 'Error Sending to Kitchen',
        description: errorMessage,
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const areAllNewItemsSelected = newItems.length > 0 && selectedItemIds.size === newItems.length;

  const categoryOrder = useMemo(() => menuCategories.map(c => c.id), []);

  const sortedOrderItems = useMemo(() => {
    return [...orderItems].sort((a, b) => {
      const categoryAIndex = categoryOrder.indexOf(a.categoryId);
      const categoryBIndex = categoryOrder.indexOf(b.categoryId);
      return categoryAIndex - categoryBIndex;
    });
  }, [orderItems, categoryOrder]);

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
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-2xl font-headline">Order for Table {tableId}</h2>
            {newItems.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={areAllNewItemsSelected}
                  onCheckedChange={handleToggleSelectAll}
                  aria-label="Select all new items"
                />
                <label htmlFor="select-all" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select New
                </label>
              </div>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              {orderItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-10">No items added yet.</p>
              ) : (
                <ul className="space-y-4">
                  {sortedOrderItems.map((item) => (
                    <li key={item.orderItemId} className={cn("flex items-start gap-3", item.status === 'sent' && "opacity-60")}>
                      <div className="flex-shrink-0 pt-1">
                        {item.status === 'new' ? (
                          <Checkbox
                            id={`select-${item.orderItemId}`}
                            checked={selectedItemIds.has(item.orderItemId)}
                            onCheckedChange={() => handleToggleSelectItem(item.orderItemId)}
                            aria-label={`Select ${item.name}`}
                          />
                        ) : (
                          <div className="w-4 h-4" /> // Placeholder for alignment
                        )}
                      </div>
                      <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-md object-cover aspect-square" data-ai-hint={item.hint} />
                      <div className="flex-1">
                        <p className="font-semibold leading-tight">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{categoryMap[item.categoryId]}</p>
                        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.orderItemId, item.quantity - 1)} disabled={item.status === 'sent'}>
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span className="w-6 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.orderItemId, item.quantity + 1)} disabled={item.status === 'sent'}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70 hover:text-destructive" onClick={() => handleUpdateQuantity(item.orderItemId, 0)} disabled={item.status === 'sent'}>
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
                <Button size="lg" variant="outline" onClick={handleSendToKitchen} disabled={isSending || selectedItemIds.size === 0}>
                  {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                  To Kitchen
                </Button>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setIsPaymentDialogOpen(true)} disabled={newItems.length > 0}>
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
