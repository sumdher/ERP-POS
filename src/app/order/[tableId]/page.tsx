import { OrderInterface } from '@/components/order-interface';

export default function OrderPage({ params }: { params: { tableId: string } }) {
  return <OrderInterface tableId={params.tableId} />;
}
