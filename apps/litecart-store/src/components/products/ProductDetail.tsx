import type { ProductResponse } from "@litecart/types";
import { formatPrice } from "@/lib/utils";
import { useAddToCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface ProductDetailProps {
  product: ProductResponse | null;
  isLoading?: boolean;
}

export function ProductDetail({ product, isLoading }: ProductDetailProps) {
  const addToCartMutation = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  // Get variants
  const variants = product.variants ?? [];
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  const selectedPrice = selectedVariant?.prices?.[0];
  const price = selectedPrice?.amount ?? 0;
  const currencyCode = selectedPrice?.currencyCode ?? "USD";

  const handleAddToCart = () => {
    if (selectedVariant?.id) {
      addToCartMutation.mutate({ variantId: selectedVariant.id, quantity });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Main Product Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square rounded-xl bg-muted overflow-hidden relative">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground">No image</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-4">
          {/* Title */}
          <h1 className="text-2xl font-bold">{product.title}</h1>

          {/* Subtitle */}
          {product.subtitle && <p className="text-muted-foreground">{product.subtitle}</p>}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold gradient-text">
              {formatPrice(price, currencyCode)}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Variant Selector */}
          {variants.length > 1 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Select Variant</label>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <Button
                    key={variant.id}
                    variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.title}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium w-8 text-center">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full md:w-auto"
            onClick={handleAddToCart}
            disabled={!selectedVariant?.id || addToCartMutation.isPending}
          >
            {addToCartMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Skeleton className="aspect-square rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-1/2" />
      </div>
    </div>
  );
}
