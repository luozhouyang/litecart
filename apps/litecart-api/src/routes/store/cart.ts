/**
 * Store Cart Routes
 *
 * Public storefront API for shopping cart operations.
 * Uses StoreDurableObject services for per-store cart and order operations.
 * Store context is set by storefrontJwtMiddleware (JWT token in Authorization header).
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createCartSchema,
  addCartItemSchema,
  updateCartItemSchema,
  setShippingAddressSchema,
  selectShippingMethodSchema,
  completeCartSchema,
} from "@litecart/types";
import { storefrontJwtMiddleware } from "../../middleware";
import type { HonoVariables } from "../../types/bindings";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: HonoVariables;
}>();

// Apply storefront JWT middleware to all routes
app.use("*", storefrontJwtMiddleware);

// POST /api/store/cart - Create cart
app.post("/", zValidator("json", createCartSchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const data = c.req.valid("json");

  const cartService = await storeDo.getCartService();
  const cart = await cartService.create({
    regionId: data.region_id,
    currencyCode: data.currency_code,
    email: data.email,
    customerId: data.customer_id,
  });

  return c.json({ cart }, 201);
});

// GET /api/store/cart/:id - Get cart
app.get("/:id", async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");

  const cartService = await storeDo.getCartService();
  const cart = await cartService.getById(id);

  if (!cart) {
    return c.json({ error: { code: "NOT_FOUND", message: "Cart not found" } }, 404);
  }

  // Calculate totals
  const totals = await cartService.calculateTotals(id);

  return c.json({
    cart: {
      ...cart,
      subtotal: totals?.subtotal || 0,
      shipping_total: totals?.shippingTotal || 0,
      tax_total: totals?.taxTotal || 0,
      total: totals?.total || 0,
    },
  });
});

// POST /api/store/cart/:id/items - Add item
app.post("/:id/items", zValidator("json", addCartItemSchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");
  const data = c.req.valid("json");

  const cartService = await storeDo.getCartService();

  const existing = await cartService.getById(id);
  if (!existing) {
    return c.json({ error: { code: "NOT_FOUND", message: "Cart not found" } }, 404);
  }

  try {
    const cart = await cartService.addItem({
      cartId: id,
      variantId: data.variant_id,
      quantity: data.quantity,
      unitPrice: data.unit_price ?? 0, // TODO: Get price from variant
    });
    return c.json({ cart });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to add item";
    return c.json({ error: { code: "ADD_ITEM_FAILED", message } }, 400);
  }
});

// PATCH /api/store/cart/:id/items/:itemId - Update item quantity
app.patch("/:id/items/:itemId", zValidator("json", updateCartItemSchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const cartId = c.req.param("id");
  const itemId = c.req.param("itemId");
  const data = c.req.valid("json");

  const cartService = await storeDo.getCartService();

  const cart = await cartService.updateItem(cartId, itemId, data.quantity);

  return c.json({ cart });
});

// DELETE /api/store/cart/:id/items/:itemId - Remove item
app.delete("/:id/items/:itemId", async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const itemId = c.req.param("itemId");

  const cartService = await storeDo.getCartService();

  const cart = await cartService.removeItem(itemId);

  return c.json({ cart });
});

// POST /api/store/cart/:id/shipping-address - Set shipping address
app.post("/:id/shipping-address", zValidator("json", setShippingAddressSchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");
  const data = c.req.valid("json");

  const cartService = await storeDo.getCartService();
  const cart = await cartService.setShippingAddress(id, data);

  return c.json({ cart });
});

// GET /api/store/cart/:id/shipping-options - Get available shipping options
app.get("/:id/shipping-options", async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");

  const cartService = await storeDo.getCartService();
  const options = await cartService.getAvailableShippingOptions(id);

  return c.json({ shipping_options: options });
});

// POST /api/store/cart/:id/shipping-method - Select shipping method
app.post("/:id/shipping-method", zValidator("json", selectShippingMethodSchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  // TODO: Implement shipping method selection
  // This would involve updating cart with selected shipping method

  return c.json({ message: "Shipping method selected" });
});

// POST /api/store/cart/:id/complete - Complete cart and create order
app.post("/:id/complete", zValidator("json", completeCartSchema), async (c) => {
  const storeDo = c.get("storeDo");
  if (!storeDo) {
    return c.json(
      {
        error: {
          code: "STORE_NOT_SET",
          message: "Store context not set",
        },
      },
      400,
    );
  }

  const id = c.req.param("id");
  const data = c.req.valid("json");

  const cartService = await storeDo.getCartService();
  const orderService = await storeDo.getOrderService();

  const cart = await cartService.getById(id);
  if (!cart) {
    return c.json({ error: { code: "NOT_FOUND", message: "Cart not found" } }, 404);
  }

  if (cart.completedAt) {
    return c.json({ error: { code: "ALREADY_COMPLETED", message: "Cart already completed" } }, 400);
  }

  // Calculate totals
  const totals = await cartService.calculateTotals(id);

  // Create order
  const order = await orderService.create({
    email: data?.customer?.email || cart.email || "guest@example.com",
    regionId: cart.regionId,
    currencyCode: cart.currencyCode,
    customerId: cart.customerId ?? undefined,
    items: cart.items.map((item) => ({
      variantId: item.variantId,
      productId: item.variant.productId,
      title: item.variant.product.title,
      variantTitle: item.variant.title,
      sku: item.variant.sku ?? undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    shippingAddress: {
      firstName: "Guest",
      lastName: "User",
      address1: "N/A",
      city: "N/A",
      postalCode: "00000",
      countryCode: "US",
    },
    subtotal: totals?.subtotal || 0,
    shippingTotal: totals?.shippingTotal || 0,
    taxTotal: totals?.taxTotal || 0,
    total: totals?.total || 0,
  });

  // Mark cart as completed
  await cartService.complete(id);

  return c.json({ order });
});

export default app;
