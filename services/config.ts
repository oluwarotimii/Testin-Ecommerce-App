import appConfig from '@/hooks/useAppConfig';

// Centralized configuration - single source of truth from useAppConfig
export const API_SERVICE_TYPE = appConfig.apiServiceType; // 'dummy' or 'wordpress'
export const WORDPRESS_URL = appConfig.wordpressUrl;
export const DASHBOARD_URL = appConfig.dashboardUrl; // Dashboard API URL for banners and carousels
export const API_BASE_URL = WORDPRESS_URL; // Use the WordPress URL as the base API URL for products, etc.

// Separate base URL for dashboard services (banners, carousels, etc.)
export const DASHBOARD_API_BASE_URL = DASHBOARD_URL; // Use the dashboard URL for banner/carousel API

// Featured category configuration
// Strategy: Cache the category ID after first lookup to avoid repeated API calls
// The actual ID will be fetched and cached on first app run
export const FEATURED_CATEGORY_SLUG = 'daily-deals';
export const FEATURED_CATEGORY_CACHE_KEY = '@config:featuredCategoryId';

// Product display limits
export const PRODUCTS_PER_PAGE = 20;
export const FEATURED_PRODUCTS_LIMIT = 8; // Show 8 products (4 rows x 2 columns on home)
export const CATEGORIES_LIMIT = 100;
