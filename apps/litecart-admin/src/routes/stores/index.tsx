import { createFileRoute } from "@tanstack/react-router";
import { StoresList } from "@/components/stores/StoresList";

export const Route = createFileRoute("/stores/")({
  component: StoresList,
});
