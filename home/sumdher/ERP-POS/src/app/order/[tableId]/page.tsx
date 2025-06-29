import { OrderInterface } from '@/components/order-interface';

// THIS IS THE FIX: Making this an async function as per Next.js best practices
// for server components that access route params. This resolves the warning.
export default async function OrderPage({ params }: { params: { tableId: string } }) {
  return <OrderInterface tableId={params.tableId} />;
}
