import { createFileRoute } from "@tanstack/react-router";
import { OrderDetail } from "@/components/orders/OrderDetail";

export const Route = createFileRoute("/orders/$orderId")({
  component: OrderDetail,
});
