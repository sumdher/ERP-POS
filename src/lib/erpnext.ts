// IMPORTANT: This file contains server-side logic only.
// Do not import it into client-side components.
import type { OrderItem } from './data';

export interface SalesInvoice {
  name: string;
  customer: string;
  posting_date: string;
  grand_total: number;
}

/**
 * Creates a Sales Invoice in ERPNext.
 * 
 * @param orderDetails - The details of the order to be invoiced.
 * @returns An object indicating success or failure.
 */
export async function createSalesInvoice(orderDetails: {
  orderItems: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
}) {
  const { orderItems, totalAmount, paymentMethod } = orderDetails;

  const erpNextUrl = process.env.ERPNEXT_URL;
  const apiKey = process.env.ERPNEXT_API_KEY;
  const apiSecret = process.env.ERPNEXT_API_SECRET;

  if (!erpNextUrl || !apiKey || !apiSecret) {
    console.error('ERPNext environment variables are not set.');
    // In a real scenario, you might want to proceed without syncing
    // or return a more specific error. For this prototype, we'll
    // simulate success if credentials are not provided.
    console.log('Simulating successful ERPNext sync as no credentials were provided.');
    return { success: true, message: 'Simulated successful sync to ERPNext.' };
  }

  // NOTE: For a real integration, the `item.name` here should exactly match
  // the `Item Code` in your ERPNext instance.
  const itemsPayload = orderItems.map(item => ({
    item_code: item.name,
    qty: item.quantity,
    rate: item.price,
  }));

  const invoicePayload = {
    // Default to 'Walk-in Customer' for POS sales
    // This customer must exist in ERPNext
    customer: 'Walk-in Customer',
    currency: 'USD',
    set_posting_time: 1, // Use current date and time
    docstatus: 1, // 1 = Submitted document
    items: itemsPayload,
    payments: [
      {
        mode_of_payment: paymentMethod,
        amount: totalAmount,
      },
    ],
  };

  try {
    const response = await fetch(`${erpNextUrl}/api/resource/Sales Invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${apiKey}:${apiSecret}`,
      },
      body: JSON.stringify(invoicePayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('ERPNext API Error:', result);
      return { success: false, message: result?.exception || `API Error: ${response.statusText}` };
    }

    console.log('Successfully created Sales Invoice:', result.data.name);
    return { success: true, message: `Successfully created Sales Invoice ${result.data.name}` };
  } catch (error) {
    console.error('Failed to connect to ERPNext:', error);
    return { success: false, message: 'Failed to connect to ERPNext API.' };
  }
}


/**
 * Fetches recent Sales Invoices from ERPNext.
 * 
 * @returns An array of sales invoices.
 */
export async function getSalesInvoices(): Promise<SalesInvoice[]> {
  const erpNextUrl = process.env.ERPNEXT_URL;
  const apiKey = process.env.ERPNEXT_API_KEY;
  const apiSecret = process.env.ERPNEXT_API_SECRET;
  
  if (!erpNextUrl || !apiKey || !apiSecret) {
    console.log('Simulating ERPNext fetch as no credentials were provided.');
    return [];
  }
  
  const fields = `["name", "customer", "posting_date", "grand_total"]`;
  const orderBy = `posting_date desc`;
  const url = `${erpNextUrl}/api/resource/Sales Invoice?fields=${fields}&order_by=${orderBy}&limit=20`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `token ${apiKey}:${apiSecret}`,
      },
    });

    if (!response.ok) {
      const errorResult = await response.json();
      console.error('ERPNext API Error fetching invoices:', errorResult);
      throw new Error(errorResult?.exception || `API Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data as SalesInvoice[];
  } catch (error) {
    console.error('Failed to connect to ERPNext to get sales invoices:', error);
    // Return empty array on failure so the dashboard can still render.
    return [];
  }
}
