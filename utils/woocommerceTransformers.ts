/**
 * Utility functions to transform WooCommerce API responses to app format
 */

export interface AppProduct {
    id: number;
    title: string;
    image: string;
    price: number;
    original_price: number;
    description: string;
    category: string;
    category_id?: number;
    categories?: Array<{ id: number; name: string; slug: string }>; // Full categories array from WooCommerce
    rating?: {
        rate: number;
        count: number;
    };
}

export interface AppOrder {
    order_id: number | string;
    date_added: string;
    status: string;
    total: string | number;
    products: any[];
}

export interface AppCategory {
    category_id: number;
    name: string;
    image?: string;
}

/**
 * Transform WooCommerce product to app format
 */
export function transformProduct(wcProduct: any): AppProduct {
    // Extract and validate image URL
    let imageUrl = '';
    if (wcProduct.images && wcProduct.images[0]) {
        imageUrl = wcProduct.images[0].src || wcProduct.images[0];
    } else if (wcProduct.image) {
        imageUrl = typeof wcProduct.image === 'string' ? wcProduct.image : (wcProduct.image.src || '');
    }

    // Ensure image URL is properly formatted
    if (imageUrl && !imageUrl.startsWith('http')) {
        // If it's a relative URL, prepend the store URL
        // Use WORDPRESS_URL as that's what's configured in the .env
        const storeUrl = process.env.EXPO_PUBLIC_WORDPRESS_URL || '';
        if (storeUrl && !imageUrl.startsWith('/')) {
            imageUrl = `${storeUrl}/${imageUrl}`;
        }
    }

    return {
        id: wcProduct.id,
        title: decodeHtmlEntities(wcProduct.name || wcProduct.title || 'Untitled Product'),
        image: imageUrl,
        price: parseFloat(wcProduct.price || '0'),
        original_price: parseFloat(wcProduct.regular_price || wcProduct.price || '0'),
        description: decodeHtmlEntities(wcProduct.description || wcProduct.short_description || ''),
        category: wcProduct.categories && wcProduct.categories.length > 0
            ? decodeHtmlEntities(wcProduct.categories[0].name || wcProduct.categories[0].slug || 'General')
            : 'General',
        category_id: wcProduct.categories && wcProduct.categories.length > 0
            ? wcProduct.categories[0].id
            : undefined,
        // Preserve full categories array for proper filtering
        categories: wcProduct.categories && Array.isArray(wcProduct.categories)
            ? wcProduct.categories.map((cat: any) => ({
                id: cat.id,
                name: decodeHtmlEntities(cat.name),
                slug: cat.slug
            }))
            : undefined,
        rating: wcProduct.average_rating ? {
            rate: parseFloat(wcProduct.average_rating),
            count: wcProduct.rating_count || 0
        } : undefined
    };
}

/**
 * Transform array of WooCommerce products
 */
export function transformProducts(wcProducts: any[]): AppProduct[] {
    if (!Array.isArray(wcProducts)) {
        return [];
    }
    return wcProducts.map(transformProduct);
}

/**
 * Transform WooCommerce order to app format
 */
export function transformOrder(wcOrder: any): AppOrder {
    return {
        order_id: wcOrder.id || wcOrder.order_id,
        date_added: wcOrder.date_created || wcOrder.date_added || new Date().toISOString(),
        status: wcOrder.status || 'pending',
        total: wcOrder.total || '0',
        products: wcOrder.line_items || wcOrder.products || []
    };
}

/**
 * Transform array of WooCommerce orders
 */
export function transformOrders(wcOrders: any[]): AppOrder[] {
    if (!Array.isArray(wcOrders)) {
        return [];
    }
    return wcOrders.map(transformOrder);
}

/**
 * Decode HTML entities in a string
 */
function decodeHtmlEntities(text: string): string {
    if (!text) return '';
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .trim();
}

/**
 * Transform WooCommerce category to app format
 */
export function transformCategory(wcCategory: any): AppCategory {
    let imageUrl = '';

    if (wcCategory.image) {
        if (typeof wcCategory.image === 'string') {
            imageUrl = wcCategory.image;
        } else if (typeof wcCategory.image === 'object' && wcCategory.image.src) {
            imageUrl = wcCategory.image.src;
        } else if (typeof wcCategory.image === 'object' && wcCategory.image.url) {
            imageUrl = wcCategory.image.url;
        }
    }

    // Ensure image URL is properly formatted
    if (imageUrl && !imageUrl.startsWith('http')) {
        // If it's a relative URL, prepend the store URL
        const storeUrl = process.env.EXPO_PUBLIC_WORDPRESS_URL || '';
        if (storeUrl && !imageUrl.startsWith('/')) {
            imageUrl = `${storeUrl}/${imageUrl}`;
        }
    }

    return {
        category_id: wcCategory.id || wcCategory.category_id,
        name: decodeHtmlEntities(wcCategory.name || 'Uncategorized'),
        image: imageUrl || undefined
    };
}

/**
 * Transform array of WooCommerce categories
 */
export function transformCategories(wcCategories: any[]): AppCategory[] {
    if (!Array.isArray(wcCategories)) {
        return [];
    }
    return wcCategories.map(transformCategory);
}

/**
 * Format price with currency symbol
 */
export function formatPrice(price: number | string, currency: string = '₦'): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `${currency}${numPrice.toFixed(2)}`;
}

/**
 * Strip HTML tags from description
 */
export function stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

/**
 * Parse WooCommerce date to readable format
 */
export function formatWooCommerceDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

/**
 * Get status color based on order status
 */
export function getOrderStatusColor(status: string): string {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'delivered':
        case 'shipped':  // Add shipped as a success/green status
            return '#4CAF50'; // success green
        case 'processing':
            return '#FF9800'; // warning orange
        case 'on-hold':
        case 'pending':
            return '#FFC107'; // warning yellow
        case 'cancelled':
        case 'refunded':
        case 'failed':
            return '#F44336'; // error red
        default:
            return '#9E9E9E'; // gray
    }
}

/**
 * Map WooCommerce status to app status
 */
export function mapWooCommerceStatus(wcStatus: string): string {
    const statusMap: Record<string, string> = {
        'completed': 'shipped',  // Never show as delivered, always as shipped
        'processing': 'processing',
        'on-hold': 'processing',
        'pending': 'processing',
        'cancelled': 'cancelled',
        'refunded': 'cancelled',
        'failed': 'cancelled'
    };
    return statusMap[wcStatus.toLowerCase()] || wcStatus;
}
