import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";

// Define search params schema
const searchSchema = z.object({
  session_id: z.string().optional(),
});

export const Route = createFileRoute("/payment/success")({
  validateSearch: searchSchema,
  component: PaymentSuccessPage,
});

function PaymentSuccessPage() {
  const { session_id: sessionId } = Route.useSearch();

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6 max-w-md mx-auto">
      {/* Success Icon */}
      <div className="rounded-full bg-green-100 p-4">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center">Payment Successful!</h1>

      {/* Description */}
      <p className="text-muted-foreground text-center">
        Your payment has been processed successfully. You will receive an email confirmation
        shortly.
      </p>

      {/* Session ID (for debugging) */}
      {sessionId && <p className="text-xs text-muted-foreground">Session: {sessionId}</p>}

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full">
        <Link to="/products">
          <Button className="w-full">
            Continue Shopping
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
