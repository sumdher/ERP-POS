'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { OrderItem, MenuItem } from '@/lib/data';

interface OrderContextType {
  orders: Record<string, OrderItem[]>;
  getOrderByTableId: (tableId: string) => OrderItem[];
  addItemToOrder: (tableId: string, item: MenuItem) => void;
  updateOrderItemQuantity: (tableId: string, orderItemId: string, newQuantity: number) => void;
  updateOrderStatus: (tableId: string, itemIds: string[], status: 'sent') => void;
  clearOrder: (tableId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Record<string, OrderItem[]>>({});

  const getOrderByTableId = useCallback((tableId: string) => {
    return orders[tableId] || [];
  }, [orders]);

  const addItemToOrder = (tableId: string, item: MenuItem) => {
    setOrders((prevOrders) => {
      const currentOrder = prevOrders[tableId] ? [...prevOrders[tableId]] : [];
      const existingItem = currentOrder.find((i) => i.id === item.id && i.status === 'new');
      
      let updatedOrder;
      if (existingItem) {
        updatedOrder = currentOrder.map((i) =>
          i.orderItemId === existingItem.orderItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        const newOrderItem: OrderItem = {
          ...item,
          orderItemId: `order_${Date.now()}_${Math.random()}`,
          quantity: 1,
          status: 'new',
        };
        updatedOrder = [...currentOrder, newOrderItem];
      }
      return { ...prevOrders, [tableId]: updatedOrder };
    });
  };

  const updateOrderItemQuantity = (tableId: string, orderItemId: string, newQuantity: number) => {
    setOrders((prevOrders) => {
        const currentOrder = prevOrders[tableId] ? [...prevOrders[tableId]] : [];
        if (newQuantity <= 0) {
            const updatedOrder = currentOrder.filter((i) => i.orderItemId !== orderItemId);
            return { ...prevOrders, [tableId]: updatedOrder };
        } else {
            const updatedOrder = currentOrder.map((i) =>
            i.orderItemId === orderItemId ? { ...i, quantity: newQuantity } : i
            );
            return { ...prevOrders, [tableId]: updatedOrder };
        }
    });
  };

  const updateOrderStatus = (tableId: string, itemIds: string[], status: 'sent') => {
      setOrders(prevOrders => {
          const currentOrder = prevOrders[tableId] ? [...prevOrders[tableId]] : [];
          const updatedOrder = currentOrder.map(item => 
              itemIds.includes(item.orderItemId) ? { ...item, status } : item
          );
          return { ...prevOrders, [tableId]: updatedOrder };
      });
  };
  
  const clearOrder = (tableId: string) => {
      setOrders(prevOrders => {
          const newOrders = {...prevOrders};
          delete newOrders[tableId];
          return newOrders;
      });
  };

  return (
    <OrderContext.Provider value={{ orders, getOrderByTableId, addItemToOrder, updateOrderItemQuantity, updateOrderStatus, clearOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
