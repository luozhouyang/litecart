/**
 * Payment Service
 *
 * Handles payment session and transaction operations.
 * Extends RpcTarget for RPC calls from Workers.
 */

import { eq } from "drizzle-orm";
import { paymentSessions, transactions } from "../schema";
import { StoreDatabase } from "../types";
import { BaseService, toPlainObject } from "./base-service";

export interface CreatePaymentSessionData {
  cartId: string;
  orderId?: string;
  providerId: string;
  sessionId: string; // Provider's session ID (Stripe checkout session ID)
  paymentIntentId?: string;
  amount: number;
  currencyCode: string;
  expiresAt?: Date;
}

export interface PaymentSessionEntity {
  id: string;
  cartId: string;
  orderId: string | null;
  providerId: string;
  sessionId: string;
  paymentIntentId: string | null;
  amount: number;
  currencyCode: string;
  status: string;
  data: string | null;
  expiresAt: Date | null;
  capturedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface TransactionEntity {
  id: string;
  orderId: string;
  paymentSessionId: string | null;
  amount: number;
  currencyCode: string;
  providerId: string;
  referenceId: string | null;
  type: string;
  status: string;
  metadata: string | null;
  createdAt: Date | null;
}

export class PaymentService extends BaseService {
  constructor(protected db: StoreDatabase) {
    super(db);
  }

  /**
   * Get payment session by ID
   */
  async getById(id: string): Promise<PaymentSessionEntity | null> {
    const session = await this.db.query.paymentSessions.findFirst({
      where: (paymentSessions, { eq }) => eq(paymentSessions.id, id),
    });
    return toPlainObject(session) as PaymentSessionEntity | null;
  }

  /**
   * Get payment session by cart ID
   */
  async getByCartId(cartId: string): Promise<PaymentSessionEntity | null> {
    const session = await this.db.query.paymentSessions.findFirst({
      where: (paymentSessions, { eq }) => eq(paymentSessions.cartId, cartId),
      orderBy: (paymentSessions, { desc }) => [desc(paymentSessions.createdAt)],
    });
    return toPlainObject(session) as PaymentSessionEntity | null;
  }

  /**
   * Get payment session by provider session ID (Stripe checkout session ID)
   */
  async getBySessionId(sessionId: string): Promise<PaymentSessionEntity | null> {
    const session = await this.db.query.paymentSessions.findFirst({
      where: (paymentSessions, { eq }) => eq(paymentSessions.sessionId, sessionId),
    });
    return toPlainObject(session) as PaymentSessionEntity | null;
  }

  /**
   * Create a new payment session
   */
  async createSession(data: CreatePaymentSessionData): Promise<PaymentSessionEntity> {
    const id = "ps_" + crypto.randomUUID();

    await this.db.insert(paymentSessions).values({
      id,
      cartId: data.cartId,
      orderId: data.orderId ?? null,
      providerId: data.providerId,
      sessionId: data.sessionId,
      paymentIntentId: data.paymentIntentId ?? null,
      amount: data.amount,
      currencyCode: data.currencyCode,
      status: "pending",
      expiresAt: data.expiresAt ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getById(id) as Promise<PaymentSessionEntity>;
  }

  /**
   * Update payment session status
   */
  async updateSessionStatus(
    id: string,
    status: "pending" | "authorized" | "captured" | "canceled" | "failed",
    paymentIntentId?: string,
  ): Promise<PaymentSessionEntity | null> {
    await this.db
      .update(paymentSessions)
      .set({
        status,
        paymentIntentId: paymentIntentId ?? null,
        capturedAt: status === "captured" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(paymentSessions.id, id));

    return this.getById(id);
  }

  /**
   * Link payment session to an order
   */
  async linkToOrder(sessionId: string, orderId: string): Promise<PaymentSessionEntity | null> {
    await this.db
      .update(paymentSessions)
      .set({
        orderId,
        updatedAt: new Date(),
      })
      .where(eq(paymentSessions.id, sessionId));

    return this.getById(sessionId);
  }

  /**
   * Get transactions for an order
   */
  async getTransactionsByOrderId(orderId: string): Promise<TransactionEntity[]> {
    const txns = await this.db.query.transactions.findMany({
      where: (transactions, { eq }) => eq(transactions.orderId, orderId),
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
    });
    return toPlainObject(txns) as TransactionEntity[];
  }

  /**
   * Create a transaction record
   */
  async createTransaction(data: {
    orderId: string;
    paymentSessionId?: string;
    amount: number;
    currencyCode: string;
    providerId: string;
    referenceId?: string;
    type: "payment" | "refund" | "capture";
    status: "pending" | "authorized" | "captured" | "refunded" | "failed";
    metadata?: Record<string, unknown>;
  }): Promise<TransactionEntity> {
    const id = "txn_" + crypto.randomUUID();

    await this.db.insert(transactions).values({
      id,
      orderId: data.orderId,
      paymentSessionId: data.paymentSessionId ?? null,
      amount: data.amount,
      currencyCode: data.currencyCode,
      providerId: data.providerId,
      referenceId: data.referenceId ?? null,
      type: data.type,
      status: data.status,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      createdAt: new Date(),
    });

    const txn = await this.db.query.transactions.findFirst({
      where: (transactions, { eq }) => eq(transactions.id, id),
    });
    return toPlainObject(txn) as TransactionEntity;
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    id: string,
    status: "pending" | "authorized" | "captured" | "refunded" | "failed",
  ): Promise<TransactionEntity | null> {
    await this.db.update(transactions).set({ status }).where(eq(transactions.id, id));

    const txn = await this.db.query.transactions.findFirst({
      where: (transactions, { eq }) => eq(transactions.id, id),
    });
    return toPlainObject(txn) as TransactionEntity | null;
  }
}
