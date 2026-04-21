import { createFileRoute } from "@tanstack/react-router";
import { StoreDetail } from "@/components/stores/StoreDetail";

export const Route = createFileRoute("/stores/$storeId")({
  component: StoreDetail,
});
