export interface OrderStatus {
    label: string;
    color: string;
}

export const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
    pending: { label: 'Pending', color: '#F1C40F' },
    processing: { label: 'Processing', color: '#3498DB' },
    'on-hold': { label: 'On Hold', color: '#95A5A6' },
    completed: { label: 'Delivered', color: '#2ECC71' },
    failed: { label: 'Failed', color: '#E74C3C' },
    cancelled: { label: 'Cancelled', color: '#E67E22' },
    refunded: { label: 'Refunded', color: '#8E44AD' },
    shipped: { label: 'Shipped', color: '#2980B9' },
    'checkout-draft': { label: 'Draft', color: '#BDC3C7' },
};

export function getOrderStatus(status: string): OrderStatus {
    return ORDER_STATUS_MAP[status] || { label: status.charAt(0).toUpperCase() + status.slice(1), color: '#95A5A6' };
}
