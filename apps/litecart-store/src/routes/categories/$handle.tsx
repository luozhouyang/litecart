import { createFileRoute, Link } from "@tanstack/react-router";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CategoryFilter } from "@/components/categories/CategoryFilter";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/categories/$handle")({
  component: CategoryPage,
});

function CategoryPage() {
  const { handle } = Route.useParams();
  const { data, isLoading } = useProducts({ categoryId: handle, limit: 24 });

  return (
    <div className="flex flex-col gap-6 py-8">
      {/* Header with Back Link */}
      <div className="flex flex-col gap-4">
        <Link
          to="/products"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Products</h1>
          <CategoryFilter selectedCategory={handle} onClear={() => window.history.back()} />
        </div>
      </div>

      {/* Products Grid */}
      <section>
        <p className="text-sm text-muted-foreground mb-4">
          {data?.count ?? 0} products in this category
        </p>
        <ProductGrid products={data?.products ?? []} isLoading={isLoading} />
      </section>
    </div>
  );
}
