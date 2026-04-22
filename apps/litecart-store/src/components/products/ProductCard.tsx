import type { ProductResponse } from "@litecart/types";
import { formatPrice, cn } from "@/lib/utils";
import { useAddToCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ProductCardProps {
  product: ProductResponse;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addToCartMutation = useAddToCart();

  // Get first variant and its price
  const firstVariant = product.variants?.[0];
  const firstPrice = firstVariant?.prices?.[0];
  const price = firstPrice?.amount ?? 0;
  const currencyCode = firstPrice?.currencyCode ?? "USD";

  const handleAddToCart = () => {
    if (firstVariant?.id) {
      addToCartMutation.mutate({ variantId: firstVariant.id, quantity: 1 });
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all hover:shadow-lg",
        "hover:border-primary/30",
        className,
      )}
    >
      {/* Product Image */}
      <Link to="/products/$handle" params={{ handle: product.handle }}>
        <div className="aspect-square bg-muted rounded-t-xl overflow-hidden relative">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-col gap-2 p-4">
        {/* Title */}
        <Link to="/products/$handle" params={{ handle: product.handle }}>
          <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Subtitle */}
        {product.subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-1">{product.subtitle}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg gradient-text">
            {formatPrice(price, currencyCode)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          size="sm"
          className="w-full mt-2"
          onClick={handleAddToCart}
          disabled={!firstVariant?.id || addToCartMutation.isPending}
        >
          {addToCartMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
