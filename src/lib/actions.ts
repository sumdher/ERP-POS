'use server';

import fs from 'fs/promises';
import path from 'path';
import { menuCategories, type OrderItem } from '@/lib/data';
import { createSalesInvoice } from './erpnext';

const KOT_DIR = path.join(process.cwd(), 'kots');

interface KotData {
  tableId: string;
  orderItems: OrderItem[];
}

export async function saveKotToFile(data: KotData) {
  const { tableId, orderItems } = data;

  if (orderItems.length === 0) {
    return { success: false, message: 'Order is empty.' };
  }
  
  const categoryMap = menuCategories.reduce((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {} as Record<string, string>);

  const itemsByCategory = orderItems.reduce((acc, item) => {
    const categoryName = categoryMap[item.categoryId] || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, OrderItem[]>);


  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-');
  const fileName = `kot-table-${tableId}-${timestamp}.txt`;
  const filePath = path.join(KOT_DIR, fileName);

  let content = `================================\n`;
  content += `      KITCHEN ORDER TICKET\n`;
  content += `================================\n\n`;
  content += `Table: ${tableId}\n`;
  content += `Date: ${now.toLocaleString()}\n\n`;
  
  content += `--------------------------------\n`;

  for (const categoryName in itemsByCategory) {
    content += `\n-- ${categoryName.toUpperCase()} --\n`;
    for (const item of itemsByCategory[categoryName]) {
        const qty = item.quantity.toString().padEnd(3);
        content += ` ${qty} | ${item.name}\n`;
    }
  }

  content += `\n--------------------------------\n`;

  try {
    await fs.mkdir(KOT_DIR, { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');

    console.log(`KOT saved to ${filePath}`);
    return { success: true, message: 'KOT saved successfully.' };
  } catch (error) {
    console.error('Failed to save KOT file:', error);
    return { success: false, message: 'Failed to save KOT file.' };
  }
}

export async function processPaymentAndCreateInvoice(orderDetails: {
  orderItems: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
}) {
  console.log('Processing payment and creating invoice...');
  const result = await createSalesInvoice(orderDetails);
  return result;
}
