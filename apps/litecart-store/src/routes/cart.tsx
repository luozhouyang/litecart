import { createFileRoute } from "@tanstack/react-router";
import { useStoreContext } from "@/lib/store-context";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CartEmpty } from "@/components/cart/CartEmpty";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { cart } = useStoreContext();

  if (!cart?.items?.length) {
    return (
      <div className="flex flex-col gap-6 py-8">
        <h1 className="text-2xl font-bold">Shopping Cart</h1>
        <CartEmpty />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      {/* Header */}
      <h1 className="text-2xl font-bold">Shopping Cart</h1>

      {/* Cart Items */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} currencyCode={cart.currencyCode} />
          ))}
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border p-4">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <CartSummary cart={cart} />
          </div>
          <Link to="/checkout">
            <Button size="lg" className="w-full">
              Proceed to Checkout
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
