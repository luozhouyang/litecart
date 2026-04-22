import { useState } from "react";
import { useCheckout } from "@/hooks/useCart";
import { useStoreContext } from "@/lib/store-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

interface CheckoutFormProps {
  onSuccess?: (orderId: string) => void;
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { cart, createCart } = useStoreContext();
  const checkoutMutation = useCheckout();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  // Ensure we have a cart
  if (!cart) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-muted-foreground">No cart found</p>
        <Button onClick={() => createCart().then(() => navigate({ to: "/products" }))}>
          Start Shopping
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    checkoutMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          onSuccess?.(data.order.id);
          void navigate({ to: "/order/$orderId", params: { orderId: data.order.id } });
        },
      },
    );
  };

  const total = cart.total ?? cart.subtotal ?? 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">We'll send order confirmation to this email</p>
      </div>

      {/* Order Summary */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items ({cart.items?.length ?? 0})</span>
            <span>{formatPrice(cart.subtotal ?? 0, cart.currencyCode)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t font-semibold">
            <span>Total</span>
            <span className="gradient-text">{formatPrice(total, cart.currencyCode)}</span>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={checkoutMutation.isPending || !email}
      >
        {checkoutMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          `Place Order - ${formatPrice(total, cart.currencyCode)}`
        )}
      </Button>

      {/* Back to cart */}
      <Link to="/cart" className="text-sm text-muted-foreground hover:text-foreground text-center">
        ← Back to Cart
      </Link>
    </form>
  );
}
