import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCache } from '@/context/CacheContext';
import { transformProducts, transformCategories } from '@/utils/woocommerceTransformers';

const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch and cache products with automatic cache invalidation
 */
export function useCachedProducts(params?: Record<string, any>) {
    const { apiService } = useAuth();
    const cache = useCache();
    const cacheKey = `products-${JSON.stringify(params || {})}`;

    const [data, setData] = useState<any[]>(() => {
        const cached = cache.get<any[]>(cacheKey);
        return cached || [];
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async (force: boolean = false) => {
        if (!apiService) return;

        // Check cache first
        if (!force && !cache.isStale(cacheKey, CACHE_MAX_AGE)) {
            const cachedData = cache.get<any[]>(cacheKey);
            if (cachedData) {
                setData(cachedData);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiService.getProducts({ per_page: 20, page: 1, ...params });
            const transformed = transformProducts(response);

            setData(transformed);
            cache.set(cacheKey, transformed);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [apiService, cache, cacheKey, params]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return { data, loading, error, refetch: () => fetchProducts(true) };
}

/**
 * Hook to fetch and cache categories with automatic cache invalidation
 */
export function useCachedCategories(params?: any) {
    const { apiService } = useAuth();
    const cache = useCache();
    const cacheKey = `categories-${JSON.stringify(params || {})}`;

    const [data, setData] = useState<any[]>(() => {
        const cached = cache.get<any[]>(cacheKey);
        return cached || [];
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async (force: boolean = false) => {
        if (!apiService) return;

        // Check cache first
        if (!force && !cache.isStale(cacheKey, CACHE_MAX_AGE)) {
            const cachedData = cache.get<any[]>(cacheKey);
            if (cachedData) {
                setData(cachedData);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiService.getCategories(params);
            const transformed = transformCategories(response);

            setData(transformed);
            cache.set(cacheKey, transformed);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }, [apiService, cache, cacheKey, params]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { data, loading, error, refetch: () => fetchCategories(true) };
}

/**
 * Hook to fetch and cache wishlist with automatic cache invalidation
 */
export function useCachedWishlist() {
    const { apiService, isAuthenticated } = useAuth();
    const cache = useCache();
    const cacheKey = 'wishlist';

    const [data, setData] = useState<number[]>(() => {
        const cached = cache.get<any[]>(cacheKey);
        return cached ? cached.map((item: any) => item.id) : [];
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWishlist = useCallback(async (force: boolean = false) => {
        if (!apiService || !isAuthenticated) return;

        // Check cache first
        if (!force && !cache.isStale(cacheKey, CACHE_MAX_AGE)) {
            const cachedData = cache.get<any[]>(cacheKey);
            if (cachedData) {
                setData(cachedData.map((item: any) => item.id));
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const wishlistItems = await apiService.getWishlist();
            const ids = wishlistItems.map((item: any) => item.id);

            setData(ids);
            cache.set(cacheKey, wishlistItems);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch wishlist');
        } finally {
            setLoading(false);
        }
    }, [apiService, isAuthenticated, cache, cacheKey]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [fetchWishlist, isAuthenticated]);

    const invalidate = useCallback(() => {
        cache.invalidate(cacheKey);
    }, [cache, cacheKey]);

    return { data, loading, error, refetch: () => fetchWishlist(true), invalidate };
}

/**
 * Hook to fetch and cache featured products
 */
export function useCachedFeaturedProducts(categorySlug: string = 'daily-deals') {
    const { apiService } = useAuth();
    const cache = useCache();
    const cacheKey = `featured-${categorySlug}`;

    const [data, setData] = useState<{ categoryId: number | null; products: any[] }>(() => {
        const cached = cache.get<{ categoryId: number | null; products: any[] }>(cacheKey);
        return cached || { categoryId: null, products: [] };
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFeatured = useCallback(async (force: boolean = false) => {
        if (!apiService) return;

        // Check cache first
        if (!force && !cache.isStale(cacheKey, CACHE_MAX_AGE)) {
            const cachedData = cache.get<{ categoryId: number | null; products: any[] }>(cacheKey);
            if (cachedData) {
                setData(cachedData);
                return;
            }
        }

        setLoading(true);
        setError(null);

        try {
            let categories = await apiService.getCategories({ slug: categorySlug });

            if (!categories || categories.length === 0) {
                categories = await apiService.getCategories({ per_page: 1 });
            }

            if (categories && categories.length > 0) {
                const category = categories[0];
                const products = await apiService.getProducts({
                    category: category.id,
                    per_page: 4
                });
                const transformed = transformProducts(products);

                const result = { categoryId: category.id, products: transformed };
                setData(result);
                cache.set(cacheKey, result);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch featured products');
        } finally {
            setLoading(false);
        }
    }, [apiService, cache, cacheKey, categorySlug]);

    useEffect(() => {
        fetchFeatured();
    }, [fetchFeatured]);

    return { data, loading, error, refetch: () => fetchFeatured(true) };
}
