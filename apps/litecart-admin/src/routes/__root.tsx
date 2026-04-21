import { createRootRouteWithContext } from "@tanstack/react-router";
import { Shell } from "@/components/layout/Shell";
import { QueryClient } from "@tanstack/react-query";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Shell />,
});
