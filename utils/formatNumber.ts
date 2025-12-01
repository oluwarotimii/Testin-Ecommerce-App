/**
 * Format a number with comma separators for thousands
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string with commas
 */
export function formatNumber(value: number | string, decimals: number = 2): string {
    const num = typeof value === 'number' ? value : parseFloat(value || '0');

    if (isNaN(num)) return '0.00';

    // Use en-NG locale for proper Nigerian number formatting
    return num.toLocaleString('en-NG', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Format a price with currency symbol and comma separators
 * @param value - The price to format
 * @param currency - Currency symbol (default: '₦')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted price string
 */
export function formatPrice(value: number | string, currency: string = '₦', decimals: number = 2): string {
    const formattedNumber = formatNumber(value, decimals);
    return `${currency}${formattedNumber}`;
}

/**
 * Format a quantity (whole number, no decimals)
 * @param value - The quantity to format
 * @returns Formatted quantity string with commas
 */
export function formatQuantity(value: number | string): string {
    return formatNumber(value, 0);
}
