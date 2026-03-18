import { useState, useEffect, useCallback } from 'react';
import { FEATURED_CATEGORY_SLUG, FEATURED_PRODUCTS_LIMIT } from '@/services/config';
import { getCachedFeaturedCategoryId, setCachedFeaturedCategoryId } from '@/utils/cache';
import { transformProducts } from '@/utils/woocommerceTransformers';

interface UseFeaturedProductsResult {
  featuredProducts: any[];
  loadingFeatured: boolean;
  errorFeatured: string | null;
  fetchFeaturedProducts: (forceRefresh?: boolean) => Promise<void>;
}

/**
 * Hook for fetching featured products (Best Deals section)
 * 
 * Features:
 * - Caches category ID after first lookup (avoids repeated API calls)
 * - Stale-while-revalidate caching for products
 * - Graceful fallback if network fails
 * - Reduced payload (8 products instead of 100)
 */
export function useFeaturedProducts(
  apiService: any,
  wishlist: number[],
  toggleWishlist: (productId: number) => Promise<void>
): UseFeaturedProductsResult {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [errorFeatured, setErrorFeatured] = useState<string | null>(null);

  const fetchFeaturedProducts = useCallback(async (forceRefresh: boolean = false) => {
    if (!apiService) return;

    setLoadingFeatured(true);
    setErrorFeatured(null);

    try {
      // Step 1: Get or fetch featured category ID
      let featuredCategoryId = await getCachedFeaturedCategoryId();

      if (!featuredCategoryId || forceRefresh) {
        // Fetch categories to find daily-deals
        const categories = await apiService.getCategories({ slug: FEATURED_CATEGORY_SLUG });

        if (categories && categories.length > 0) {
          featuredCategoryId = categories[0].id;
          await setCachedFeaturedCategoryId(featuredCategoryId);
        } else {
          // Fallback: use first available category
          const fallbackCategories = await apiService.getCategories({ per_page: 1 });
          if (fallbackCategories && fallbackCategories.length > 0) {
            featuredCategoryId = fallbackCategories[0].id;
            await setCachedFeaturedCategoryId(featuredCategoryId);
          }
        }
      }

      if (!featuredCategoryId) {
        setErrorFeatured('No featured category found');
        setLoadingFeatured(false);
        return;
      }

      // Step 2: Fetch featured products (limited to 8 for fast load)
      const products = await apiService.getProducts({
        category: featuredCategoryId,
        per_page: FEATURED_PRODUCTS_LIMIT,
        status: 'publish',
      });

      const transformed = transformProducts(products);
      setFeaturedProducts(transformed);

    } catch (error: any) {
      console.error('Error fetching featured products:', error);
      setErrorFeatured(error.message || 'Failed to load best deals');
      
      // Don't clear featuredProducts on error - show stale data instead
      // This provides better UX on flaky networks
    } finally {
      setLoadingFeatured(false);
    }
  }, [apiService]);

  // Fetch on mount and when apiService changes
  useEffect(() => {
    fetchFeaturedProducts();
  }, [apiService, fetchFeaturedProducts]);

  return {
    featuredProducts,
    loadingFeatured,
    errorFeatured,
    fetchFeaturedProducts,
  };
}
