import type { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import * as schema from "./schema";

export type StoreDatabase = DrizzleSqliteDODatabase<typeof schema>;

/**
 * Simplified entity types for RPC responses
 * These avoid the complex Drizzle inference types
 */

// Category
export interface CategoryEntity {
  id: string;
  name: string;
  handle: string;
  description: string | null;
  parentId: string | null;
  rank: number | null;
  metadata: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

// Collection
export interface CollectionEntity {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  metadata: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

// Product (base entity)
export interface ProductEntity {
  id: string;
  title: string;
  handle: string;
  description: string | null;
  subtitle: string | null;
  status: string;
  isDiscountable: boolean | null;
  categoryId: string | null;
  collectionId: string | null;
  thumbnail: string | null;
  metadata: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

// Product with variants (for storefront response)
export interface ProductWithVariantsEntity extends ProductEntity {
  variants: Array<{
    id: string;
    productId: string;
    title: string;
    sku: string | null;
    prices: Array<{
      id: string;
      variantId: string;
      currencyCode: string;
      amount: number;
    }>;
  }>;
}

// Variant
export interface VariantEntity {
  id: string;
  productId: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  ean: string | null;
  upc: string | null;
  allowBackorder: boolean | null;
  manageInventory: boolean | null;
  weight: number | null;
  length: number | null;
  height: number | null;
  width: number | null;
  originCountry: string | null;
  hsCode: string | null;
  midCode: string | null;
  material: string | null;
  metadata: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

// Price
export interface PriceEntity {
  id: string;
  variantId: string;
  currencyCode: string;
  amount: number;
  minQuantity: number | null;
  maxQuantity: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

// Order
export interface OrderEntity {
  id: string;
  displayId: number;
  customerId: string | null;
  email: string;
  regionId: string;
  currencyCode: string;
  status: string;
  fulfillmentStatus: string;
  paymentStatus: string;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number | null;
  total: number;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  metadata: string | null;
  deletedAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Order Item
export interface OrderItemEntity {
  id: string;
  orderId: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxTotal: number | null;
  total: number;
  fulfilledQuantity: number | null;
  returnedQuantity: number | null;
  metadata: string | null;
  createdAt: Date | null;
}

// Cart
export interface CartEntity {
  id: string;
  email: string | null;
  customerId: string | null;
  regionId: string;
  currencyCode: string;
  shippingAddressId: string | null;
  billingAddressId: string | null;
  completedAt: Date | null;
  metadata: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Cart Item
export interface CartItemEntity {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

// Cart with items (for storefront response)
export interface CartWithItemsEntity extends CartEntity {
  items: Array<{
    id: string;
    cartId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    variant: {
      id: string;
      productId: string;
      title: string;
      sku: string | null;
      product: {
        id: string;
        title: string;
      };
      prices: Array<{
        id: string;
        variantId: string;
        currencyCode: string;
        amount: number;
      }>;
    };
  }>;
}

// Customer
export interface CustomerEntity {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  hasAccount: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

// Region
export interface RegionEntity {
  id: string;
  name: string;
  currencyCode: string;
  taxRate: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

// Address
export interface AddressEntity {
  id: string;
  customerId: string | null;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string | null;
  postalCode: string;
  countryCode: string;
  phone: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
