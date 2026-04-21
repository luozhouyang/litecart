import { createFileRoute } from "@tanstack/react-router";
import { CategoriesList } from "@/components/categories/CategoriesList";

export const Route = createFileRoute("/categories/")({
  component: CategoriesList,
});
