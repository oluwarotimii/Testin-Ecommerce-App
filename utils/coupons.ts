import AsyncStorage from '@react-native-async-storage/async-storage';

export type CouponDiscountType = 'percent' | 'fixed_cart' | 'fixed_product';

export type AppliedCoupon = {
  code: string;
  discountType: CouponDiscountType;
  amount: number;
};

const APPLIED_COUPON_STORAGE_KEY = 'appliedCoupon';

export const normalizeCouponCode = (code: string) => code.trim().toLowerCase();

export const calculateCouponDiscount = (subtotal: number, coupon: AppliedCoupon) => {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0;

  if (coupon.discountType === 'percent') {
    const percent = Math.max(0, Math.min(100, coupon.amount));
    return Math.min(subtotal, (subtotal * percent) / 100);
  }

  if (coupon.discountType === 'fixed_cart') {
    const value = Math.max(0, coupon.amount);
    return Math.min(subtotal, value);
  }

  // fixed_product is not supported in this app-level cart calculation
  return 0;
};

export const getStoredAppliedCoupon = async (): Promise<AppliedCoupon | null> => {
  const raw = await AsyncStorage.getItem(APPLIED_COUPON_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AppliedCoupon;
    if (!parsed?.code || !parsed.discountType || typeof parsed.amount !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
};

export const setStoredAppliedCoupon = async (coupon: AppliedCoupon) => {
  await AsyncStorage.setItem(APPLIED_COUPON_STORAGE_KEY, JSON.stringify(coupon));
};

export const clearStoredAppliedCoupon = async () => {
  await AsyncStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
};

