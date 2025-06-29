'use server';

import fs from 'fs/promises';
import path from 'path';
import type { OrderItem } from '@/lib/data';

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
  content += `Qty | Item\n`;
  content += `--------------------------------\n`;

  for (const item of orderItems) {
    const qty = item.quantity.toString().padEnd(3);
    content += ` ${qty} | ${item.name}\n`;
  }

  content += `--------------------------------\n`;

  try {
    // Ensure the directory exists
    await fs.mkdir(KOT_DIR, { recursive: true });
    // Write the file
    await fs.writeFile(filePath, content, 'utf-8');

    console.log(`KOT saved to ${filePath}`);
    return { success: true, message: 'KOT saved successfully.' };
  } catch (error) {
    console.error('Failed to save KOT file:', error);
    return { success: false, message: 'Failed to save KOT file.' };
  }
}
