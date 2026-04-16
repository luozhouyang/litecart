import type { Queue } from "@cloudflare/workers-types";

// Queue message types
export type OrderQueueMessage = {
  type: "order.created" | "order.paid" | "order.fulfilled" | "order.canceled";
  data: {
    orderId: string;
    email: string;
    customerId?: string;
    total?: number;
    currencyCode?: string;
    items?: Array<{ variantId: string; quantity: number }>;
  };
  timestamp: number;
};

export type EmailQueueMessage = {
  type: "email.order.confirmation" | "email.password.reset" | "email.welcome";
  data: {
    to: string;
    orderId?: string;
    displayId?: number;
    resetUrl?: string;
    customerName?: string;
  };
  timestamp: number;
};

export type WebhookQueueMessage = {
  type: "webhook.dispatch";
  data: {
    webhookId: string;
    url: string;
    event: "order.created" | "order.updated" | "order.fulfilled" | "inventory.changed";
    payload: Record<string, unknown>;
    secret: string;
  };
  timestamp: number;
};

export type InventoryQueueMessage = {
  type: "inventory.reserve" | "inventory.release" | "inventory.deduct";
  data: {
    cartId?: string;
    orderId?: string;
    items: Array<{ variantId: string; quantity: number }>;
  };
  timestamp: number;
};

// Queue bindings interface
export interface QueueBindings {
  ORDER_QUEUE: Queue;
  EMAIL_QUEUE: Queue;
  WEBHOOK_QUEUE: Queue;
  INVENTORY_QUEUE: Queue;
}

// Send message to queue
export async function sendOrderQueue(queue: Queue, message: OrderQueueMessage) {
  return queue.send(message);
}

export async function sendEmailQueue(queue: Queue, message: EmailQueueMessage) {
  return queue.send(message);
}

export async function sendWebhookQueue(queue: Queue, message: WebhookQueueMessage) {
  return queue.send(message);
}

export async function sendInventoryQueue(queue: Queue, message: InventoryQueueMessage) {
  return queue.send(message);
}

// Batch send messages - Cloudflare Queue expects { body: message } format
export async function sendOrderQueueBatch(queue: Queue, messages: OrderQueueMessage[]) {
  return queue.sendBatch(messages.map((msg) => ({ body: msg })));
}
