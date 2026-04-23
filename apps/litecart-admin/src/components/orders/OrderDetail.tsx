import { useParams, Link } from "@tanstack/react-router";
import {
  useOrder,
  useUpdateOrder,
  useFulfillOrder,
  useOrderFulfillments,
  useMarkFulfillmentShipped,
  useMarkFulfillmentDelivered,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Truck, CheckCircle, Package, ExternalLink } from "lucide-react";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { OrderStatus, FulfillmentRecordStatus } from "@litecart/types";

interface Fulfillment {
  id: string;
  orderId: string;
  status: FulfillmentRecordStatus;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date | null;
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrderDetail() {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const { data, isLoading } = useOrder(orderId);
  const { data: fulfillmentsData } = useOrderFulfillments(orderId);
  const updateOrder = useUpdateOrder(orderId);
  const fulfillOrder = useFulfillOrder(orderId);
  const markShipped = useMarkFulfillmentShipped();
  const markDelivered = useMarkFulfillmentDelivered();

  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  const order = data?.order;
  const fulfillments = (fulfillmentsData?.fulfillments ?? []) as Fulfillment[];

  // Initialize status from order data
  if (order && !status) {
    setStatus(order.status);
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setStatus(newStatus);
    await updateOrder.mutateAsync({ status: newStatus });
  };

  const handleFulfill = async () => {
    await fulfillOrder.mutateAsync({
      trackingNumber: trackingNumber || undefined,
      trackingUrl: trackingUrl || undefined,
    });
    setFulfillDialogOpen(false);
    setTrackingNumber("");
    setTrackingUrl("");
  };

  const handleMarkShipped = async (fulfillmentId: string) => {
    await markShipped.mutateAsync({ fulfillmentId });
  };

  const handleMarkDelivered = async (fulfillmentId: string) => {
    await markDelivered.mutateAsync(fulfillmentId);
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order #{order.displayId}</h1>
        </div>
        <div className="flex gap-2">
          {order.fulfillmentStatus !== "fulfilled" && order.fulfillmentStatus !== "returned" && (
            <Button onClick={() => setFulfillDialogOpen(true)}>
              <Truck className="mr-2 h-4 w-4" />
              Fulfill
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Select
                value={status || order.status}
                onValueChange={(v) => handleStatusChange(v as OrderStatus)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fulfillment</span>
              <OrderStatusBadge status={order.fulfillmentStatus} />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment</span>
              <OrderStatusBadge status={order.paymentStatus} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{order.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Order Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Order Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal, order.currencyCode)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCurrency(order.shippingTotal, order.currencyCode)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(order.taxTotal, order.currencyCode)}</span>
            </div>
            {order.discountTotal && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">
                  -{formatCurrency(order.discountTotal, order.currencyCode)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total, order.currencyCode)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items ({order.items?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {order.items && order.items.length > 0 ? (
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <span className="font-medium">{item.title}</span>
                    {item.variantTitle && (
                      <span className="text-muted-foreground ml-2">- {item.variantTitle}</span>
                    )}
                    <span className="text-muted-foreground ml-4">Qty: {item.quantity}</span>
                  </div>
                  <div className="text-right">
                    <span>{formatCurrency(item.total, order.currencyCode)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No items</p>
          )}
        </CardContent>
      </Card>

      {/* Fulfillments */}
      {fulfillments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Fulfillments ({fulfillments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fulfillments.map((fulfillment) => (
                <div key={fulfillment.id} className="p-4 border rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Fulfillment #{fulfillment.id}</span>
                    <OrderStatusBadge status={fulfillment.status} />
                  </div>

                  {fulfillment.trackingNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Tracking:</span>
                      <span>{fulfillment.trackingNumber}</span>
                      {fulfillment.trackingUrl && (
                        <a
                          href={fulfillment.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {fulfillment.status === "not_fulfilled" && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkShipped(fulfillment.id)}
                        disabled={markShipped.isPending}
                      >
                        <Truck className="mr-1 h-3 w-3" />
                        Mark Shipped
                      </Button>
                    )}
                    {fulfillment.status === "shipped" && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkDelivered(fulfillment.id)}
                        disabled={markDelivered.isPending}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fulfill Dialog */}
      <Dialog open={fulfillDialogOpen} onOpenChange={setFulfillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fulfill Order</DialogTitle>
            <DialogDescription>
              Mark this order as fulfilled. You can optionally add tracking information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tracking">Tracking Number (optional)</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
            <div>
              <Label htmlFor="trackingUrl">Tracking URL (optional)</Label>
              <Input
                id="trackingUrl"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://tracking.example.com/..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFulfillDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFulfill} disabled={fulfillOrder.isPending}>
              <CheckCircle className="mr-2 h-4 w-4" />
              {fulfillOrder.isPending ? "Fulfilling..." : "Fulfill Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
