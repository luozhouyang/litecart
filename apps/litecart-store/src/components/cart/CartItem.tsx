import type { CartItemResponse } from "@litecart/types";
import { formatPrice, cn } from "@/lib/utils";
import { useRemoveFromCart, useUpdateCartItem } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface CartItemProps {
  item: CartItemResponse;
  currencyCode: string;
}

export function CartItem({ item, currencyCode }: CartItemProps) {
  const removeMutation = useRemoveFromCart();
  const updateMutation = useUpdateCartItem();

  const productTitle = item.variant?.product?.title ?? "Product";
  const variantTitle = item.variant?.title ?? "";
  const displayTitle = variantTitle ? `${productTitle} - ${variantTitle}` : productTitle;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeMutation.mutate({ itemId: item.id });
    } else {
      updateMutation.mutate({ itemId: item.id, quantity: newQuantity });
    }
  };

  return (
    <div className={cn("flex gap-4 py-2", removeMutation.isPending && "opacity-50")}>
      {/* Product Image Placeholder */}
      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
        <span className="text-xs text-muted-foreground">IMG</span>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-1">
        <Link
          to="/products/$handle"
          params={{ handle: item.variant?.product?.id ?? "" }}
          className="text-sm font-medium hover:text-primary transition-colors line-clamp-1"
        >
          {displayTitle}
        </Link>
        <span className="text-sm font-semibold text-primary">
          {formatPrice(item.unitPrice, currencyCode)}
        </span>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={updateMutation.isPending}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={updateMutation.isPending}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => removeMutation.mutate({ itemId: item.id })}
        disabled={removeMutation.isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
