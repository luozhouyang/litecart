import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, ArrowRight } from "lucide-react";

// Define search params schema
const searchSchema = z.object({
  cart_id: z.string().optional(),
});

export const Route = createFileRoute("/payment/cancel")({
  validateSearch: searchSchema,
  component: PaymentCancelPage,
});

function PaymentCancelPage() {
  const { cart_id: cartId } = Route.useSearch();

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6 max-w-md mx-auto">
      {/* Cancel Icon */}
      <div className="rounded-full bg-orange-100 p-4">
        <XCircle className="h-12 w-12 text-orange-600" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center">Payment Cancelled</h1>

      {/* Description */}
      <p className="text-muted-foreground text-center">
        Your payment was cancelled. Your cart is still available if you'd like to try again.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        {cartId ? (
          <Link to="/checkout">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </Link>
        ) : (
          <Link to="/cart">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              View Cart
            </Button>
          </Link>
        )}
        <Link to="/products">
          <Button variant="outline" className="w-full">
            Continue Shopping
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
