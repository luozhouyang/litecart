import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  className?: string;
  selectedCategory?: string;
  onClear?: () => void;
}

export function CategoryFilter({ className, selectedCategory, onClear }: CategoryFilterProps) {
  const { data, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Skeleton className="h-5 w-16" />
      </div>
    );
  }

  const categories = data?.categories ?? [];
  const selectedCategoryName = categories.find((c) => c.handle === selectedCategory)?.name;

  if (!selectedCategory || !selectedCategoryName) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">Filter:</span>
      <div className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-1">
        <span className="text-sm font-medium">{selectedCategoryName}</span>
        {onClear && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 ml-1 hover:bg-transparent"
            onClick={onClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
