import { createFileRoute } from "@tanstack/react-router";
import { OrderConfirmation } from "@/components/checkout/OrderConfirmation";

export const Route = createFileRoute("/order/$orderId")({
  component: OrderPage,
});

function OrderPage() {
  const { orderId } = Route.useParams();

  return (
    <div className="py-8">
      <OrderConfirmation orderId={orderId} />
    </div>
  );
}
