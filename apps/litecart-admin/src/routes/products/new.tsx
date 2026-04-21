import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/products/ProductForm";

export const Route = createFileRoute("/products/new")({
  component: () => <ProductForm mode="create" />,
});
