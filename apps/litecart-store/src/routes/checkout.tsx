import { createFileRoute } from "@tanstack/react-router";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { useStoreContext } from "@/lib/store-context";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cart } = useStoreContext();

  if (!cart?.items?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-muted-foreground">Your cart is empty</p>
        <Link to="/products" className="text-primary hover:underline">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-8 max-w-md mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-bold">Checkout</h1>

      {/* Checkout Form */}
      <CheckoutForm />
    </div>
  );
}
