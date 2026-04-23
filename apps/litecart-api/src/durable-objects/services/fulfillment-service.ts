/**
 * Fulfillment Service
 *
 * Handles fulfillment and return operations.
 * Extends RpcTarget for RPC calls from Workers.
 */

import { eq, sql } from "drizzle-orm";
import {
  orderFulfillments,
  fulfillmentItems,
  orderReturns,
  returnItems,
  orderItems,
  orders,
} from "../schema";
import { StoreDatabase } from "../types";
import { BaseService, toPlainObject } from "./base-service";

export interface CreateFulfillmentData {
  orderId: string;
  items: Array<{
    orderItemId: string;
    quantity: number;
  }>;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface FulfillmentEntity {
  id: string;
  orderId: string;
  status: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  items?: Array<{
    id: string;
    fulfillmentId: string;
    orderItemId: string;
    quantity: number;
  }>;
}

export interface ReturnEntity {
  id: string;
  orderId: string;
  fulfillmentId: string | null;
  status: string;
  reason: string | null;
  receivedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  items?: Array<{
    id: string;
    returnId: string;
    orderItemId: string;
    quantity: number;
  }>;
}

export class FulfillmentService extends BaseService {
  constructor(protected db: StoreDatabase) {
    super(db);
  }

  /**
   * Get fulfillment by ID
   */
  async getFulfillmentById(id: string): Promise<FulfillmentEntity | null> {
    const fulfillment = await this.db.query.orderFulfillments.findFirst({
      where: (orderFulfillments, { eq }) => eq(orderFulfillments.id, id),
      with: {
        items: true,
      },
    });
    return toPlainObject(fulfillment) as FulfillmentEntity | null;
  }

  /**
   * Get fulfillments for an order
   */
  async getFulfillmentsByOrderId(orderId: string): Promise<FulfillmentEntity[]> {
    const fulfillments = await this.db.query.orderFulfillments.findMany({
      where: (orderFulfillments, { eq }) => eq(orderFulfillments.orderId, orderId),
      with: {
        items: true,
      },
      orderBy: (orderFulfillments, { desc }) => [desc(orderFulfillments.createdAt)],
    });
    return toPlainObject(fulfillments) as FulfillmentEntity[];
  }

  /**
   * Create a new fulfillment
   */
  async createFulfillment(data: CreateFulfillmentData): Promise<FulfillmentEntity> {
    const fulfillmentId = "ful_" + crypto.randomUUID();

    // Create fulfillment record
    await this.db.insert(orderFulfillments).values({
      id: fulfillmentId,
      orderId: data.orderId,
      status: "not_fulfilled",
      trackingNumber: data.trackingNumber ?? null,
      trackingUrl: data.trackingUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create fulfillment items
    for (const item of data.items) {
      const itemId = "fitem_" + crypto.randomUUID();
      await this.db.insert(fulfillmentItems).values({
        id: itemId,
        fulfillmentId,
        orderItemId: item.orderItemId,
        quantity: item.quantity,
      });

      // Update order item fulfilled quantity
      await this.db
        .update(orderItems)
        .set({
          fulfilledQuantity: sql`${orderItems.fulfilledQuantity} + ${item.quantity}`,
        })
        .where(eq(orderItems.id, item.orderItemId));
    }

    // Check if all items are fulfilled
    await this.updateOrderFulfillmentStatus(data.orderId);

    return this.getFulfillmentById(fulfillmentId) as Promise<FulfillmentEntity>;
  }

  /**
   * Update fulfillment with tracking info
   */
  async updateFulfillment(
    id: string,
    data: { trackingNumber?: string; trackingUrl?: string },
  ): Promise<FulfillmentEntity | null> {
    await this.db
      .update(orderFulfillments)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(orderFulfillments.id, id));

    return this.getFulfillmentById(id);
  }

  /**
   * Mark fulfillment as shipped
   */
  async markAsShipped(
    fulfillmentId: string,
    trackingNumber?: string,
    trackingUrl?: string,
  ): Promise<FulfillmentEntity | null> {
    const updateData: Record<string, unknown> = {
      status: "shipped",
      shippedAt: new Date(),
      updatedAt: new Date(),
    };

    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (trackingUrl) updateData.trackingUrl = trackingUrl;

    await this.db
      .update(orderFulfillments)
      .set(updateData)
      .where(eq(orderFulfillments.id, fulfillmentId));

    // Get the fulfillment to find the order
    const fulfillment = await this.getFulfillmentById(fulfillmentId);
    if (fulfillment) {
      // Update order status to shipped if all fulfillments are shipped
      await this.updateOrderStatusAfterShipment(fulfillment.orderId);
    }

    return this.getFulfillmentById(fulfillmentId);
  }

  /**
   * Mark fulfillment as delivered
   */
  async markAsDelivered(fulfillmentId: string): Promise<FulfillmentEntity | null> {
    await this.db
      .update(orderFulfillments)
      .set({
        status: "delivered",
        deliveredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orderFulfillments.id, fulfillmentId));

    // Get the fulfillment to find the order
    const fulfillment = await this.getFulfillmentById(fulfillmentId);
    if (fulfillment) {
      // Update order status to delivered if all fulfillments are delivered
      await this.updateOrderStatusAfterDelivery(fulfillment.orderId);
    }

    return this.getFulfillmentById(fulfillmentId);
  }

  /**
   * Cancel a fulfillment
   */
  async cancelFulfillment(fulfillmentId: string): Promise<FulfillmentEntity | null> {
    const fulfillment = await this.getFulfillmentById(fulfillmentId);
    if (!fulfillment) return null;

    // Restore fulfilled quantities
    if (fulfillment.items) {
      for (const item of fulfillment.items) {
        await this.db
          .update(orderItems)
          .set({
            fulfilledQuantity: sql`${orderItems.fulfilledQuantity} - ${item.quantity}`,
          })
          .where(eq(orderItems.id, item.orderItemId));
      }
    }

    // Cancel fulfillment
    await this.db
      .update(orderFulfillments)
      .set({
        status: "canceled",
        updatedAt: new Date(),
      })
      .where(eq(orderFulfillments.id, fulfillmentId));

    // Update order fulfillment status
    await this.updateOrderFulfillmentStatus(fulfillment.orderId);

    return this.getFulfillmentById(fulfillmentId);
  }

  /**
   * Get returns for an order
   */
  async getReturnsByOrderId(orderId: string): Promise<ReturnEntity[]> {
    const returns = await this.db.query.orderReturns.findMany({
      where: (orderReturns, { eq }) => eq(orderReturns.orderId, orderId),
      with: {
        items: true,
      },
      orderBy: (orderReturns, { desc }) => [desc(orderReturns.createdAt)],
    });
    return toPlainObject(returns) as ReturnEntity[];
  }

  /**
   * Create a return
   */
  async createReturn(data: {
    orderId: string;
    fulfillmentId?: string;
    items: Array<{
      orderItemId: string;
      quantity: number;
    }>;
    reason?: string;
  }): Promise<ReturnEntity> {
    const returnId = "ret_" + crypto.randomUUID();

    // Create return record
    await this.db.insert(orderReturns).values({
      id: returnId,
      orderId: data.orderId,
      fulfillmentId: data.fulfillmentId ?? null,
      status: "pending",
      reason: data.reason ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create return items
    for (const item of data.items) {
      const itemId = "ritem_" + crypto.randomUUID();
      await this.db.insert(returnItems).values({
        id: itemId,
        returnId,
        orderItemId: item.orderItemId,
        quantity: item.quantity,
      });

      // Update order item returned quantity
      await this.db
        .update(orderItems)
        .set({
          returnedQuantity: sql`${orderItems.returnedQuantity} + ${item.quantity}`,
        })
        .where(eq(orderItems.id, item.orderItemId));
    }

    // Update order fulfillment status
    await this.updateOrderReturnStatus(data.orderId);

    return (await this.db.query.orderReturns.findFirst({
      where: (orderReturns, { eq }) => eq(orderReturns.id, returnId),
      with: { items: true },
    })) as ReturnEntity;
  }

  /**
   * Mark return as received
   */
  async markReturnReceived(returnId: string): Promise<ReturnEntity | null> {
    await this.db
      .update(orderReturns)
      .set({
        status: "received",
        receivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orderReturns.id, returnId));

    return (await this.db.query.orderReturns.findFirst({
      where: (orderReturns, { eq }) => eq(orderReturns.id, returnId),
      with: { items: true },
    })) as ReturnEntity | null;
  }

  /**
   * Mark return as processed
   */
  async markReturnProcessed(returnId: string): Promise<ReturnEntity | null> {
    await this.db
      .update(orderReturns)
      .set({
        status: "processed",
        updatedAt: new Date(),
      })
      .where(eq(orderReturns.id, returnId));

    return (await this.db.query.orderReturns.findFirst({
      where: (orderReturns, { eq }) => eq(orderReturns.id, returnId),
      with: { items: true },
    })) as ReturnEntity | null;
  }

  // Private helper methods

  /**
   * Update order fulfillment status based on fulfilled quantities
   */
  private async updateOrderFulfillmentStatus(orderId: string): Promise<void> {
    const order = await this.db.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, orderId),
      with: { items: true },
    });

    if (!order || !order.items) return;

    const allFulfilled = order.items.every((item) => item.fulfilledQuantity >= item.quantity);
    const someFulfilled = order.items.some((item) => item.fulfilledQuantity > 0);

    let status: "not_fulfilled" | "fulfilled" | "partially_fulfilled" = "not_fulfilled";
    if (allFulfilled) {
      status = "fulfilled";
    } else if (someFulfilled) {
      status = "partially_fulfilled";
    }

    await this.db
      .update(orders)
      .set({ fulfillmentStatus: status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  }

  /**
   * Update order status after shipment
   */
  private async updateOrderStatusAfterShipment(orderId: string): Promise<void> {
    const fulfillments = await this.getFulfillmentsByOrderId(orderId);

    const allShipped = fulfillments.every(
      (f) => f.status === "shipped" || f.status === "delivered",
    );

    if (allShipped && fulfillments.length > 0) {
      await this.db
        .update(orders)
        .set({ status: "shipped", updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    }
  }

  /**
   * Update order status after delivery
   */
  private async updateOrderStatusAfterDelivery(orderId: string): Promise<void> {
    const fulfillments = await this.getFulfillmentsByOrderId(orderId);

    const allDelivered = fulfillments.every((f) => f.status === "delivered");

    if (allDelivered && fulfillments.length > 0) {
      await this.db
        .update(orders)
        .set({ status: "delivered", updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    }
  }

  /**
   * Update order return status based on returned quantities
   */
  private async updateOrderReturnStatus(orderId: string): Promise<void> {
    const order = await this.db.query.orders.findFirst({
      where: (orders, { eq }) => eq(orders.id, orderId),
      with: { items: true },
    });

    if (!order || !order.items) return;

    const allReturned = order.items.every((item) => item.returnedQuantity >= item.quantity);
    const someReturned = order.items.some((item) => item.returnedQuantity > 0);

    let status:
      | "not_fulfilled"
      | "fulfilled"
      | "partially_fulfilled"
      | "returned"
      | "partially_returned" = order.fulfillmentStatus;
    if (allReturned) {
      status = "returned";
    } else if (someReturned) {
      status = "partially_returned";
    }

    await this.db
      .update(orders)
      .set({ fulfillmentStatus: status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
  }
}
