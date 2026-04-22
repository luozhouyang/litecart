import { createFileRoute } from "@tanstack/react-router";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CategoryNav } from "@/components/categories/CategoryNav";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data, isLoading } = useProducts({ limit: 12 });

  return (
    <div className="flex flex-col gap-8 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-8 gap-4">
        <h1 className="text-3xl font-bold text-center">
          <span className="gradient-text">Discover Amazing Products</span>
        </h1>
        <p className="text-muted-foreground text-center max-w-md">
          Browse our curated collection of premium products
        </p>
      </section>

      {/* Category Navigation */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <CategoryNav />
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Featured Products</h2>
          {isLoading && <Skeleton className="h-4 w-20" />}
        </div>
        <ProductGrid products={data?.products ?? []} isLoading={isLoading} />
      </section>
    </div>
  );
}
