import { createFileRoute } from "@tanstack/react-router";
import { CategoryForm } from "@/components/categories/CategoryForm";

export const Route = createFileRoute("/categories/new")({
  component: () => <CategoryForm mode="create" />,
});
