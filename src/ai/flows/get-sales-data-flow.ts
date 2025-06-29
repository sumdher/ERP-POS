'use server';
/**
 * @fileOverview A flow for fetching sales data from ERPNext.
 *
 * - getSalesData - A function that fetches recent sales invoices.
 * - SalesDataResponse - The return type for the getSalesData function.
 */
import { ai } from '@/ai/genkit';
import { getSalesInvoices, type SalesInvoice } from '@/lib/erpnext';
import { z } from 'genkit';

const SalesDataResponseSchema = z.array(z.object({
    name: z.string(),
    customer: z.string(),
    posting_date: z.string(),
    grand_total: z.number(),
}));

export type SalesDataResponse = z.infer<typeof SalesDataResponseSchema>;

const fetchSalesDataTool = ai.defineTool(
    {
        name: 'fetchSalesDataFromERP',
        description: 'Fetches the list of recent sales invoices from the ERP system.',
        output: { schema: SalesDataResponseSchema },
    },
    async () => {
        console.log('Fetching sales data from ERPNext...');
        const invoices = await getSalesInvoices();
        // The tool's output must match the schema.
        return invoices.map(inv => ({
            name: inv.name,
            customer: inv.customer,
            posting_date: inv.posting_date,
            grand_total: inv.grand_total,
        }));
    }
);


const getSalesDataFlow = ai.defineFlow(
    {
        name: 'getSalesDataFlow',
        output: { schema: SalesDataResponseSchema },
    },
    async () => {
        const salesInvoices = await fetchSalesDataTool();
        return salesInvoices;
    }
);


export async function getSalesData(): Promise<SalesDataResponse> {
    return getSalesDataFlow();
}
