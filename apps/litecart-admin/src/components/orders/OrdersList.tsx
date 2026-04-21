import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye } from "lucide-react";
import { useOrders } from "@/hooks";
import type { OrderStatus, FulfillmentStatus, PaymentStatus } from "@litecart/types";
import { OrderStatusBadge } from "./OrderStatusBadge";

const statusFilters = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
] as OrderStatus[];
const fulfillmentFilters = [
  "not_fulfilled",
  "fulfilled",
  "partially_fulfilled",
  "returned",
  "partially_returned",
] as FulfillmentStatus[];
const paymentFilters = [
  "not_paid",
  "paid",
  "partially_paid",
  "refunded",
  "partially_refunded",
] as PaymentStatus[];

export function OrdersList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentStatus | "all">("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">("all");

  const { data, isLoading } = useOrders({
    q: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    fulfillmentStatus: fulfillmentFilter === "all" ? undefined : fulfillmentFilter,
    paymentStatus: paymentFilter === "all" ? undefined : paymentFilter,
    limit: 50,
    offset: 0,
    order: "created_at",
    direction: "desc",
  });

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusFilters.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={fulfillmentFilter}
              onValueChange={(value) => setFulfillmentFilter(value as FulfillmentStatus | "all")}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Fulfillment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {fulfillmentFilters.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={paymentFilter}
              onValueChange={(value) => setPaymentFilter(value as PaymentStatus | "all")}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {paymentFilters.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{isLoading ? "Loading..." : `${data?.count ?? 0} orders`}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No orders found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fulfillment</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        to="/orders/$orderId"
                        params={{ orderId: order.id }}
                        className="font-medium hover:underline"
                      >
                        #{order.displayId}
                      </Link>
                    </TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.fulfillmentStatus} />
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.paymentStatus} />
                    </TableCell>
                    <TableCell>{formatCurrency(order.total, order.currencyCode)}</TableCell>
                    <TableCell>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
