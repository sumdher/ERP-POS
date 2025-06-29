import { OrderInterface } from '@/components/order-interface';

export default async function OrderPage({ params }: { params: { tableId: string } }) {
  return <OrderInterface tableId={params.tableId} />;
}
