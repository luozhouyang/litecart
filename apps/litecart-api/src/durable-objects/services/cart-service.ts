/**
 * Cart Service
 *
 * Handles cart operations.
 * Extends RpcTarget for RPC calls from Workers.
 */

import { eq } from "drizzle-orm";
import { cartAddresses, cartItems, carts } from "../schema";
import { StoreDatabase, type CartWithItemsEntity } from "../types";
import { BaseService, toPlainObject } from "./base-service";

export class CartService extends BaseService {
  constructor(protected db: StoreDatabase) {
    super(db);
  }

  /**
   * Get cart by ID with items
   */
  async getById(id: string): Promise<CartWithItemsEntity | null> {
    const cart = await this.db.query.carts.findFirst({
      where: (carts, { eq }) => eq(carts.id, id),
      with: {
        items: {
          with: {
            variant: {
              with: {
                product: true,
                prices: true,
              },
            },
          },
        },
        customer: true,
      },
    });
    return toPlainObject(cart) as CartWithItemsEntity | null;
  }

  /**
   * Create a new cart
   */
  async create(data: {
    email?: string;
    customerId?: string;
    regionId: string;
    currencyCode: string;
  }) {
    const id = "cart_" + crypto.randomUUID();

    await this.db.insert(carts).values({
      id,
      email: data.email ?? null,
      customerId: data.customerId ?? null,
      regionId: data.regionId,
      currencyCode: data.currencyCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(id);
  }

  /**
   * Add item to cart
   */
  async addItem(data: { cartId: string; variantId: string; quantity: number; unitPrice: number }) {
    // Check if item already exists
    const existingItem = await this.db.query.cartItems.findFirst({
      where: (items, { and, eq }) =>
        and(eq(items.cartId, data.cartId), eq(items.variantId, data.variantId)),
    });

    if (existingItem) {
      // Update quantity
      return this.updateItemQuantity(existingItem.id, existingItem.quantity + data.quantity);
    }

    const id = "ci_" + crypto.randomUUID();

    await this.db.insert(cartItems).values({
      id,
      cartId: data.cartId,
      variantId: data.variantId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(data.cartId);
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    await this.db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, itemId));

    // Get the cart ID to return the full cart
    const item = await this.db.query.cartItems.findFirst({
      where: (items, { eq }) => eq(items.id, itemId),
    });

    if (item) {
      return this.getById(item.cartId);
    }
    return null;
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string) {
    const item = await this.db.query.cartItems.findFirst({
      where: (items, { eq }) => eq(items.id, itemId),
    });

    if (!item) {
      return null;
    }

    await this.db.delete(cartItems).where(eq(cartItems.id, itemId));

    return this.getById(item.cartId);
  }

  /**
   * Update cart item quantity by cart ID and item ID
   */
  async updateItem(cartId: string, itemId: string, quantity: number) {
    const existingItem = await this.db.query.cartItems.findFirst({
      where: (items, { and, eq }) => and(eq(items.id, itemId), eq(items.cartId, cartId)),
    });

    if (!existingItem) {
      return this.getById(cartId);
    }

    return this.updateItemQuantity(existingItem.id, quantity);
  }

  /**
   * Set shipping address for cart
   */
  async setShippingAddress(
    cartId: string,
    data: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      province?: string;
      postalCode: string;
      countryCode: string;
      phone?: string;
    },
  ) {
    // Create cart address
    const addressId = "caddr_" + crypto.randomUUID();

    await this.db.insert(cartAddresses).values({
      id: addressId,
      cartId,
      firstName: data.firstName,
      lastName: data.lastName,
      address1: data.address1,
      address2: data.address2 ?? null,
      city: data.city,
      province: data.province ?? null,
      postalCode: data.postalCode,
      countryCode: data.countryCode,
      phone: data.phone ?? null,
    });

    // Update cart with shipping address reference
    await this.db
      .update(carts)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cartId));

    return this.getById(cartId);
  }

  /**
   * Calculate cart totals
   */
  async calculateTotals(cartId: string) {
    const cart = await this.getById(cartId);
    if (!cart) {
      return null;
    }

    // Calculate subtotal from items
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity;
    }, 0);

    // For now, shipping and tax are simplified (would come from shipping methods and tax rates)
    const shippingTotal = 0;
    const taxTotal = 0;
    const total = subtotal + shippingTotal + taxTotal;

    return {
      subtotal,
      shippingTotal,
      taxTotal,
      total,
    };
  }

  /**
   * Get available shipping options for cart
   * Simplified for now - returns default options based on region
   */
  async getAvailableShippingOptions(cartId: string) {
    const cart = await this.getById(cartId);
    if (!cart) {
      return [];
    }

    // Simplified shipping options
    return [
      {
        id: "ship_standard",
        name: "Standard Shipping",
        price: 0,
        estimatedDays: 5,
      },
      {
        id: "ship_express",
        name: "Express Shipping",
        price: 1500, // $15.00 in cents
        estimatedDays: 2,
      },
    ];
  }

  /**
   * Complete a cart (mark as completed)
   */
  async complete(id: string) {
    await this.db
      .update(carts)
      .set({
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(carts.id, id));

    return this.getById(id);
  }
}
