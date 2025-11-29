/**
 * App Configuration
 * 
 * This file contains configurable settings for the app.
 * You can easily change these values without modifying the code.
 */

export const APP_CONFIG = {
    /**
     * Promotional Category Configuration
     * 
     * The "Latest Products" section on the homepage will display products from this category.
     * Change the slug below to use a different category for promotions.
     * 
     * Examples:
     * - 'daily-deals' - Shows products from Daily Deals category
     * - 'featured' - Shows featured products
     * - 'special-offers' - Shows special offers
     * - null - Shows all products (no category filter)
     * 
     * To find your category slug, go to WordPress Admin > Products > Categories
     */
    PROMO_CATEGORY_SLUG: null as string | null, // Set to null to show all products, or use a category slug like 'daily-deals'

    /**
     * Number of products to load initially on homepage
     */
    INITIAL_PRODUCTS_COUNT: 20,

    /**
     * Number of products to load when "Load More" is triggered
     */
    LOAD_MORE_COUNT: 20,
};
