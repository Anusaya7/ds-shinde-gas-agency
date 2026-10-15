import crypto from 'crypto';
import Razorpay from 'razorpay';
import config from '../config/index.js';

let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return razorpayInstance;
}

export interface CreateOrderParams {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(params: CreateOrderParams) {
  const razorpay = getRazorpayClient();
  const amountInPaise = Math.round(params.amountInRupees * 100);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: params.receipt,
    notes: params.notes || {},
  };

  const order = await razorpay.orders.create(options);
  return order;
}

export interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export function verifyRazorpayPaymentSignature(params: VerifyPaymentParams): boolean {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;

  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === razorpaySignature;
}

export function verifyRazorpayWebhookSignature(
  webhookBody: string,
  webhookSignature: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(webhookBody)
    .digest('hex');

  return expectedSignature === webhookSignature;
}
