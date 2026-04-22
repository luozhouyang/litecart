import { createFileRoute } from "@tanstack/react-router";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CategoryNav } from "@/components/categories/CategoryNav";

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
});

function ProductsPage() {
  const { data, isLoading } = useProducts({ limit: 24 });

  return (
    <div className="flex flex-col gap-6 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">All Products</h1>
        <CategoryNav />
      </div>

      {/* Products Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">{data?.count ?? 0} products</p>
        </div>
        <ProductGrid products={data?.products ?? []} isLoading={isLoading} />
      </section>
    </div>
  );
}
