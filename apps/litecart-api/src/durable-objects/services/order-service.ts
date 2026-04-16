/**
 * Order Service
 *
 * Handles order operations.
 * Extends RpcTarget for RPC calls from Workers.
 */

import { and, eq, isNull, sql, type SQL } from "drizzle-orm";
import { orderAddresses, orderItems, orders } from "../schema";
import { StoreDatabase } from "../types";
import { BaseService } from "./base-service";

export class OrderService extends BaseService {
  constructor(protected db: StoreDatabase) {
    super(db);
  }

  /**
   * Get order by ID with items
   */
  async getById(id: string) {
    const order = await this.db.query.orders.findFirst({
      where: (orders, { and, eq, isNull }) => and(eq(orders.id, id), isNull(orders.deletedAt)),
      with: {
        items: true,
        fulfillments: {
          with: {
            items: true,
          },
        },
        customer: true,
        transactions: true,
        shippingMethods: true,
      },
    });
    return order ?? null;
  }

  /**
   * List orders with filters
   */
  async list(params: { limit: number; offset: number; status?: string; customerId?: string }) {
    const conditions: SQL[] = [isNull(orders.deletedAt)];

    if (params.status) {
      conditions.push(
        eq(
          orders.status,
          params.status as
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "canceled"
            | "refunded",
        ),
      );
    }
    if (params.customerId) {
      conditions.push(eq(orders.customerId, params.customerId));
    }

    const whereClause = and(...conditions);

    const orderList = await this.db.query.orders.findMany({
      where: whereClause,
      limit: params.limit,
      offset: params.offset,
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      with: {
        customer: true,
        items: true,
      },
    });

    const allOrders = await this.db.query.orders.findMany({
      where: whereClause,
      columns: { id: true },
    });

    return {
      orders: orderList,
      count: allOrders.length,
    };
  }

  /**
   * Update order status
   */
  async updateStatus(
    id: string,
    status:
      | "pending"
      | "confirmed"
      | "processing"
      | "shipped"
      | "delivered"
      | "canceled"
      | "refunded",
  ) {
    await this.db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    return this.getById(id);
  }

  /**
   * Update order payment status
   */
  async updatePaymentStatus(
    id: string,
    paymentStatus: "not_paid" | "paid" | "partially_paid" | "partially_refunded" | "refunded",
  ) {
    await this.db
      .update(orders)
      .set({
        paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    return this.getById(id);
  }

  /**
   * Create a new order from cart data
   */
  async create(data: {
    email: string;
    regionId: string;
    currencyCode: string;
    customerId?: string;
    items: Array<{
      variantId: string;
      productId: string;
      title: string;
      variantTitle?: string;
      sku?: string;
      quantity: number;
      unitPrice: number;
    }>;
    shippingAddress: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      province?: string;
      postalCode: string;
      countryCode: string;
      phone?: string;
    };
    subtotal: number;
    shippingTotal: number;
    taxTotal: number;
    total: number;
  }) {
    // Get next display ID
    const maxDisplayIdResult = await this.db
      .select({ max: sql<number>`max(display_id)` })
      .from(orders);
    const displayId = (maxDisplayIdResult[0]?.max ?? 0) + 1;

    const orderId = "order_" + crypto.randomUUID();

    // Create order
    await this.db.insert(orders).values({
      id: orderId,
      displayId,
      email: data.email,
      regionId: data.regionId,
      currencyCode: data.currencyCode,
      customerId: data.customerId ?? null,
      status: "pending",
      fulfillmentStatus: "not_fulfilled",
      paymentStatus: "not_paid",
      subtotal: data.subtotal,
      shippingTotal: data.shippingTotal,
      taxTotal: data.taxTotal,
      total: data.total,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create shipping address
    const shippingAddressId = "oaddr_" + crypto.randomUUID();
    await this.db.insert(orderAddresses).values({
      id: shippingAddressId,
      orderId,
      firstName: data.shippingAddress.firstName,
      lastName: data.shippingAddress.lastName,
      address1: data.shippingAddress.address1,
      address2: data.shippingAddress.address2 ?? null,
      city: data.shippingAddress.city,
      province: data.shippingAddress.province ?? null,
      postalCode: data.shippingAddress.postalCode,
      countryCode: data.shippingAddress.countryCode,
      phone: data.shippingAddress.phone ?? null,
    });

    // Update order with shipping address reference
    await this.db.update(orders).set({ shippingAddressId }).where(eq(orders.id, orderId));

    // Create order items
    for (const item of data.items) {
      const itemId = "oi_" + crypto.randomUUID();
      const itemSubtotal = item.unitPrice * item.quantity;

      await this.db.insert(orderItems).values({
        id: itemId,
        orderId,
        variantId: item.variantId,
        productId: item.productId,
        title: item.title,
        variantTitle: item.variantTitle ?? null,
        sku: item.sku ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: itemSubtotal,
        total: itemSubtotal,
        createdAt: new Date(),
      });
    }

    return this.getById(orderId);
  }

  /**
   * Update order fulfillment status
   */
  async updateFulfillmentStatus(
    id: string,
    fulfillmentStatus:
      | "not_fulfilled"
      | "fulfilled"
      | "partially_fulfilled"
      | "returned"
      | "partially_returned",
  ) {
    await this.db
      .update(orders)
      .set({
        fulfillmentStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    return this.getById(id);
  }
}
