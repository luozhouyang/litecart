import { createFileRoute } from "@tanstack/react-router";
import { CollectionsList } from "@/components/collections/CollectionsList";

export const Route = createFileRoute("/collections/")({
  component: CollectionsList,
});
