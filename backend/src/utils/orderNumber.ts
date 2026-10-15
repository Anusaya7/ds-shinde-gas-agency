import crypto from 'crypto';

/**
 * Generate a unique and human-friendly order tracking number.
 * Format: DSG-YYYYMMDD-XXXX (e.g., DSG-20251014-A8F2)
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);

  return `DSG-${dateStr}-${randomPart}`;
}
