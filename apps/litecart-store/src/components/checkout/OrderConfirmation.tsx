import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

interface OrderConfirmationProps {
  orderId: string;
  orderNumber?: string;
}

export function OrderConfirmation({ orderId, orderNumber }: OrderConfirmationProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 py-8">
      {/* Success Icon */}
      <div className="rounded-full bg-success/10 p-4">
        <CheckCircle className="h-12 w-12 text-success" />
      </div>

      {/* Success Message */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>

      {/* Order Details */}
      <div className="rounded-lg border p-4 w-full max-w-md">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-medium">{orderNumber ?? orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-success">Confirmed</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>

      {/* Note */}
      <p className="text-xs text-muted-foreground text-center max-w-md">
        A confirmation email will be sent to your email address with order details and tracking
        information once your order ships.
      </p>
    </div>
  );
}
