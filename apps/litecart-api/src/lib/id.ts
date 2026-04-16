import { uuidv7 } from "uuidv7";

// ID prefix constants - all tables use prefix_uuidv7 format
export const ID_PREFIXES = {
  // Auth tables
  user: "usr_",
  session: "sess_",
  account: "acc_",
  verification: "ver_",

  // Store metadata (global D1)
  store: "store_",

  // Core business tables
  region: "reg_",
  country: "ctry_",
  category: "cat_",
  collection: "coll_",
  product: "prod_",
  productImage: "img_",
  productOption: "opt_",
  productOptionValue: "optv_",
  variant: "var_",
  variantOptionValue: "voptv_",
  price: "price_",

  // Inventory tables
  inventoryItem: "inv_",
  inventoryLevel: "invl_",
  inventoryChange: "invc_",

  // Customer tables
  customer: "cust_",
  address: "addr_",

  // Cart tables
  cart: "cart_",
  cartItem: "ci_",
  cartAddress: "caddr_",

  // Order tables
  order: "order_",
  orderItem: "oi_",
  orderAddress: "oaddr_",
  orderFulfillment: "ful_",
  fulfillmentItem: "fitem_",
  orderShippingMethod: "osm_",

  // Payment tables
  paymentSession: "ps_",
  transaction: "txn_",

  // Shipping tables
  shippingProvider: "sp_",
  shippingOption: "so_",
} as const;

// Generate ID with prefix using UUID v7
export function generateId(prefix: keyof typeof ID_PREFIXES): string {
  return ID_PREFIXES[prefix] + uuidv7();
}

// Generate UUID v7 without prefix
export function generateUuidv7(): string {
  return uuidv7();
}
