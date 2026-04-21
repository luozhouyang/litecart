import { createFileRoute } from "@tanstack/react-router";
import { OrdersList } from "@/components/orders/OrdersList";

export const Route = createFileRoute("/orders/")({
  component: OrdersList,
});
