import appConfig from '@/hooks/useAppConfig';

/**
 * Calculates the transaction fee based on a base amount
 * Method: 1.5% + ₦100
 * Waiver: ₦100 fee is waived for transactions below ₦2,500
 * Cap: Fees are capped at ₦2,000
 * 
 * This logic follows Paystack's local transaction fee structure.
 */
export function calculateTxnFee(baseAmount: number): number {
  // Transaction fees are now handled on the server or removed to reduce friction.
  // Returning 0 ensures no extra charges are added in the app.
  return 0;
}
