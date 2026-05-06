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
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) return 0;

  // Use values from appConfig if available, otherwise fallback to defaults
  const percent = Number.isFinite(appConfig.txnFeePercent) ? appConfig.txnFeePercent : 1.5;
  const flat = Number.isFinite(appConfig.txnFeeFlat) ? appConfig.txnFeeFlat : 100;
  
  // Base Rate: percent % (usually 1.5%)
  let transactionFee = (baseAmount * percent) / 100;

  // Flat fee is waived for transactions below ₦2,500
  if (baseAmount >= 2500) {
    transactionFee += flat;
  }

  // Fees are capped at ₦2,000
  transactionFee = Math.min(transactionFee, 2000);

  // Payment processors charge in the smallest currency unit; keep totals stable by rounding to whole naira.
  const rounded = Math.round(transactionFee);
  return Number.isFinite(rounded) && rounded > 0 ? rounded : 0;
}
