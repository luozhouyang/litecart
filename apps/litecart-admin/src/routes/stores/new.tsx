import { createFileRoute } from "@tanstack/react-router";
import { StoreForm } from "@/components/stores/StoreForm";

export const Route = createFileRoute("/stores/new")({
  component: () => <StoreForm mode="create" />,
});
