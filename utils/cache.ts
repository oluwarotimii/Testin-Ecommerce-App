/**
 * Simple caching utility with stale-while-revalidate pattern
 * Uses AsyncStorage for persistence across app sessions
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheConfig {
  staleTime: number;      // How long data is considered "fresh" (ms)
  cacheTime: number;      // How long to keep data before hard expire (ms)
}

// Default cache configurations
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Featured products: 5 min stale, 30 min cache
  featuredProducts: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  },
  // Categories: 10 min stale, 1 hour cache (rarely changes)
  categories: {
    staleTime: 10 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  },
  // Products: 2 min stale, 15 min cache
  products: {
    staleTime: 2 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
  },
  // Carousel: 5 min stale, 30 min cache
  carousel: {
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  },
};

/**
 * Get data from cache if valid
 * Returns null if cache miss or expired
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(`@cache:${key}`);
    if (!cached) return null;

    const parsed: CachedData<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache has hard expired
    if (now > parsed.expiresAt) {
      await AsyncStorage.removeItem(`@cache:${key}`);
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error(`Cache get error for ${key}:`, error);
    return null;
  }
}

/**
 * Set data in cache with timestamps
 */
export async function setInCache<T>(
  key: string,
  data: T,
  config?: CacheConfig
): Promise<void> {
  try {
    const cacheConfig = config || CACHE_CONFIGS.products;
    const now = Date.now();

    const cached: CachedData<T> = {
      data,
      timestamp: now,
      expiresAt: now + cacheConfig.cacheTime,
    };

    await AsyncStorage.setItem(`@cache:${key}`, JSON.stringify(cached));
  } catch (error) {
    console.error(`Cache set error for ${key}:`, error);
  }
}

/**
 * Check if cached data is stale (needs revalidation)
 */
export async function isStale(key: string): Promise<boolean> {
  try {
    const cached = await AsyncStorage.getItem(`@cache:${key}`);
    if (!cached) return true;

    const parsed: CachedData<any> = JSON.parse(cached);
    const now = Date.now();

    // Consider stale if past staleTime but not yet expired
    return now > parsed.timestamp + CACHE_CONFIGS.products.staleTime;
  } catch (error) {
    console.error(`Cache isStale error for ${key}:`, error);
    return true;
  }
}

/**
 * Get cached data with stale-while-revalidate pattern
 * Returns cached data immediately (even if stale), caller handles revalidation
 */
export async function getCachedData<T>(key: string): Promise<{
  data: T | null;
  isStale: boolean;
  exists: boolean;
}> {
  const data = await getFromCache<T>(key);
  const stale = await isStale(key);

  return {
    data,
    isStale: stale,
    exists: data !== null,
  };
}

/**
 * Clear specific cache key
 */
export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`@cache:${key}`);
  } catch (error) {
    console.error(`Cache clear error for ${key}:`, error);
  }
}

/**
 * Clear all caches (use sparingly)
 */
export async function clearAllCaches(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('@cache:'));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.error('Clear all caches error:', error);
  }
}

/**
 * Featured category ID caching
 * Fetches once, caches indefinitely (until app restart or manual clear)
 */
const FEATURED_CATEGORY_CACHE_KEY = '@cache:featuredCategoryId';

export async function getCachedFeaturedCategoryId(): Promise<number | null> {
  try {
    const cached = await AsyncStorage.getItem(FEATURED_CATEGORY_CACHE_KEY);
    return cached ? parseInt(cached, 10) : null;
  } catch (error) {
    console.error('Get cached featured category ID error:', error);
    return null;
  }
}

export async function setCachedFeaturedCategoryId(id: number): Promise<void> {
  try {
    await AsyncStorage.setItem(FEATURED_CATEGORY_CACHE_KEY, id.toString());
    console.log('Cached featured category ID:', id);
  } catch (error) {
    console.error('Set cached featured category ID error:', error);
  }
}

export async function clearCachedFeaturedCategoryId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FEATURED_CATEGORY_CACHE_KEY);
  } catch (error) {
    console.error('Clear cached featured category ID error:', error);
  }
}
