import { createFileRoute } from "@tanstack/react-router";
import { ProductsList } from "@/components/products/ProductsList";

export const Route = createFileRoute("/products/")({
  component: ProductsList,
});
