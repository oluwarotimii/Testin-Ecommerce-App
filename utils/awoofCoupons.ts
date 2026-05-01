import AsyncStorage from '@react-native-async-storage/async-storage';

export type AwoofCouponDiscountType = 'percent' | 'fixed_cart';

export type AwoofAppliedCoupon = {
  code: string;
  discountType: AwoofCouponDiscountType;
  amount: number;
};

const AWOOF_APPLIED_COUPON_STORAGE_KEY = 'awoofAppliedCoupon';

export const normalizeAwoofCouponCode = (code: string) => code.trim().toLowerCase();

export const calculateAwoofCouponDiscount = (subtotal: number, coupon: AwoofAppliedCoupon) => {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0;

  if (coupon.discountType === 'percent') {
    const percent = Math.max(0, Math.min(100, coupon.amount));
    return Math.min(subtotal, (subtotal * percent) / 100);
  }

  const value = Math.max(0, coupon.amount);
  return Math.min(subtotal, value);
};

export const getStoredAwoofAppliedCoupon = async (): Promise<AwoofAppliedCoupon | null> => {
  const raw = await AsyncStorage.getItem(AWOOF_APPLIED_COUPON_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AwoofAppliedCoupon;
    if (!parsed?.code || !parsed.discountType || typeof parsed.amount !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const setStoredAwoofAppliedCoupon = async (coupon: AwoofAppliedCoupon) => {
  await AsyncStorage.setItem(AWOOF_APPLIED_COUPON_STORAGE_KEY, JSON.stringify(coupon));
};

export const clearStoredAwoofAppliedCoupon = async () => {
  await AsyncStorage.removeItem(AWOOF_APPLIED_COUPON_STORAGE_KEY);
};

