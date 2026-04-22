import { useCategories } from "@/hooks/useCategories";
import { Link } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  className?: string;
  activeCategory?: string;
}

export function CategoryNav({ className, activeCategory }: CategoryNavProps) {
  const { data, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className={cn("flex gap-2 overflow-x-auto py-2", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-lg" />
        ))}
      </div>
    );
  }

  const categories = data?.categories ?? [];

  if (categories.length === 0) {
    return null;
  }

  return (
    <nav className={cn("flex gap-2 overflow-x-auto py-2 scrollbar-hide", className)}>
      {/* All Products Link */}
      <Link
        to="/products"
        className={cn(
          "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
          !activeCategory
            ? "gradient-primary text-white"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        )}
      >
        All
      </Link>

      {/* Category Links */}
      {categories.map((category) => (
        <Link
          key={category.id}
          to="/categories/$handle"
          params={{ handle: category.handle }}
          className={cn(
            "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
            activeCategory === category.handle
              ? "gradient-primary text-white"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          )}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
