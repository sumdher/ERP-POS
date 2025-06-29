'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Landmark, Wallet, Loader2 } from 'lucide-react';
import type { OrderItem } from '@/lib/data';
import { useOrders } from '@/context/order-context';

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  totalAmount: number;
  orderItems: OrderItem[];
  tableId: string;
}

export function PaymentDialog({ isOpen, onOpenChange, totalAmount, orderItems, tableId }: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { completeOrder } = useOrders();

  const handlePayment = async (method: string) => {
    setIsProcessing(true);
    
    // Simulate API call to ERPNext and payment gateway
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsProcessing(false);
    onOpenChange(false);

    toast({
      title: 'Payment Successful!',
      description: `Paid $${totalAmount.toFixed(2)} for table ${tableId} via ${method}. Sales data synced with ERPNext.`,
    });
    
    completeOrder(tableId, orderItems, totalAmount, method);
    
    // Redirect to home page
    router.push('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Billing for Table {tableId}</DialogTitle>
          <DialogDescription>
            Review the total and select a payment method.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
            <div className="text-center py-6 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-5xl font-bold font-headline text-primary tracking-tight">
                    ${totalAmount.toFixed(2)}
                </p>
            </div>
        </div>

        <div>
            <h4 className="mb-4 text-center text-sm font-medium text-muted-foreground">Select Payment Method</h4>
            <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" size="lg" className="h-20 flex-col gap-2" disabled={isProcessing} onClick={() => handlePayment('Cash')}>
                    <Landmark className="h-6 w-6" />
                    Cash
                </Button>
                <Button variant="outline" size="lg" className="h-20 flex-col gap-2" disabled={isProcessing} onClick={() => handlePayment('Card')}>
                    <CreditCard className="h-6 w-6" />
                    Card
                </Button>
                <Button variant="outline" size="lg" className="h-20 flex-col gap-2" disabled={isProcessing} onClick={() => handlePayment('Wallet')}>
                    <Wallet className="h-6 w-6" />
                    Wallet
                </Button>
            </div>
        </div>

        {isProcessing && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2 text-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="font-semibold">Processing...</span>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
