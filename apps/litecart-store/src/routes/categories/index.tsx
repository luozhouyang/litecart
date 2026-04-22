import { createFileRoute } from "@tanstack/react-router";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/categories/")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data, isLoading } = useCategories();

  return (
    <div className="flex flex-col gap-6 py-8">
      {/* Header */}
      <h1 className="text-2xl font-bold">Categories</h1>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(data?.categories ?? []).map((category) => (
            <Link
              key={category.id}
              to="/categories/$handle"
              params={{ handle: category.handle }}
              className="flex items-center justify-center p-6 rounded-xl border bg-card hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <span className="font-semibold text-lg">{category.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
