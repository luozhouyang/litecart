import { createFileRoute } from "@tanstack/react-router";
import { CollectionForm } from "@/components/collections/CollectionForm";

export const Route = createFileRoute("/collections/new")({
  component: CollectionForm,
});
