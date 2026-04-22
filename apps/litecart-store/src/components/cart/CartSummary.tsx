import type { CartResponse } from "@litecart/types";
import { formatPrice } from "@/lib/utils";

interface CartSummaryProps {
  cart: CartResponse;
}

export function CartSummary({ cart }: CartSummaryProps) {
  const subtotal = cart.subtotal ?? 0;
  const shipping = cart.shipping_total ?? 0;
  const tax = cart.tax_total ?? 0;
  const total = cart.total ?? subtotal + shipping + tax;

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatPrice(subtotal, cart.currencyCode)}</span>
      </div>
      {shipping > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">{formatPrice(shipping, cart.currencyCode)}</span>
        </div>
      )}
      {tax > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-medium">{formatPrice(tax, cart.currencyCode)}</span>
        </div>
      )}
      <div className="flex justify-between pt-2 border-t font-semibold text-base">
        <span>Total</span>
        <span className="gradient-text">{formatPrice(total, cart.currencyCode)}</span>
      </div>
    </div>
  );
}
