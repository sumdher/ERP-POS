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
  console.log("--- [ERPNext] Starting createSalesInvoice ---");
  const { orderItems, totalAmount, paymentMethod } = orderDetails;

  const erpNextUrl = process.env.ERPNEXT_URL;
  const apiKey = process.env.ERPNEXT_API_KEY;
  const apiSecret = process.env.ERPNEXT_API_SECRET;

  if (!erpNextUrl || !apiKey || !apiSecret) {
    const errorMessage = "STOP: ERPNext connection details (URL, Key, or Secret) not found in .env.local. Please check the file and restart the server.";
    console.error(errorMessage);
    return { 
      success: false, 
      message: errorMessage
    };
  }

  console.log(`[ERPNext] Found credentials. Connecting to: ${erpNextUrl}`);

  // CRITICAL: For submitted invoices (docstatus: 1), ERPNext requires an 'item_code'
  // that exists in its Item database. 'item_name' is not sufficient.
  // The item.name from our POS must exactly match an Item Code in ERPNext.
  const itemsPayload = orderItems.map(item => ({
    item_code: item.name, // Using item_code as required by the API.
    qty: item.quantity,
    rate: item.price,
  }));

  const invoicePayload = {
    customer: 'Walk-in Customer',
    currency: 'USD',
    // This template must exist in ERPNext. 'In Advance' is a standard default.
    payment_terms_template: 'In Advance',
    set_posting_time: 1,
    docstatus: 1, // 1 = Submitted document
    items: itemsPayload,
    payments: [
      {
        mode_of_payment: paymentMethod,
        amount: totalAmount,
      },
    ],
  };

  console.log('[ERPNext] Sending this payload to ERPNext:');
  console.log(JSON.stringify(invoicePayload, null, 2));

  try {
    const response = await fetch(`${erpNextUrl}/api/resource/Sales Invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${apiKey}:${apiSecret}`,
      },
      body: JSON.stringify(invoicePayload),
      // Adding a timeout to prevent hanging requests
      signal: AbortSignal.timeout(15000) // 15 seconds
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[ERPNext] API Error Response:', JSON.stringify(result, null, 2));
      const detailedError = result?.exception || result?.message || `API Error: ${response.statusText}`;
      // Providing a more helpful error message to the user.
      const userMessage = detailedError.includes("payment_terms")
        ? "ERPNext error. This is likely caused by a missing 'Item Code'. Please ensure all items in this order exist as Item Codes in your ERPNext database."
        : `Failed to create invoice in ERPNext. Reason: ${detailedError}`;
      return { success: false, message: userMessage };
    }

    console.log('[ERPNext] SUCCESS: Created Sales Invoice:', result.data.name);
    return { success: true, message: `Successfully created Sales Invoice ${result.data.name}` };
  } catch (error) {
    console.error('[ERPNext] CRITICAL: Failed to connect or fetch from ERPNext API.', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown network error occurred.';
    return { success: false, message: `Failed to connect to ERPNext API. Is the server running and the URL correct? Error: ${errorMessage}` };
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
    console.log('[ERPNext] No credentials found for getSalesInvoices. Returning empty array. Please check your .env.local file.');
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
      // Adding a timeout
      signal: AbortSignal.timeout(15000) // 15 seconds
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
