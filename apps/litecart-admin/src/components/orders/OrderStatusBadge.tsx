import { cva } from "class-variance-authority";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus, FulfillmentStatus, PaymentStatus, FulfillmentRecordStatus } from "@litecart/types";

const badgeVariants = cva("", {
  variants: {
    variant: {
      pending: "bg-yellow-500",
      confirmed: "bg-blue-500",
      processing: "bg-blue-600",
      shipped: "bg-purple-500",
      delivered: "bg-green-600",
      canceled: "bg-red-500",
      refunded: "bg-gray-500",
      not_fulfilled: "bg-gray-400",
      fulfilled: "bg-green-500",
      partially_fulfilled: "bg-yellow-600",
      returned: "bg-red-600",
      partially_returned: "bg-orange-500",
      not_paid: "bg-gray-400",
      paid: "bg-green-500",
      partially_paid: "bg-yellow-500",
    },
  },
});

type StatusType = OrderStatus | FulfillmentStatus | PaymentStatus | FulfillmentRecordStatus;

interface OrderStatusBadgeProps {
  status: StatusType;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <Badge className={`${badgeVariants({ variant: status as never })} text-white`}>
      {formatStatus(status)}
    </Badge>
  );
}
