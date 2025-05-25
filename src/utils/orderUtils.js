// Utility functions for order management

/**
 * Check if an order uses PayOS payment method
 * @param {string} paymentMethod - The payment method string
 * @returns {boolean} - True if it's a PayOS payment
 */
export const isPayOSPayment = (paymentMethod) => {
    if (!paymentMethod) return false;
    return ['PayOS', 'PAYOS', 'payos'].includes(paymentMethod);
};

/**
 * Check if an order can be cancelled by user
 * @param {Object} order - The order object
 * @returns {boolean} - True if order can be cancelled
 */
export const canCancelOrder = (order) => {
    if (!order) return false;
    return order.status === 'pending' && !isPayOSPayment(order.payment_method);
};

/**
 * Check if order should show contact to cancel button
 * @param {Object} order - The order object
 * @returns {boolean} - True if should show contact button
 */
export const shouldShowContactToCancel = (order) => {
    if (!order) return false;
    return isPayOSPayment(order.payment_method) &&
        (order.status === 'pending' || order.status === 'processing');
};

/**
 * Get the correct initial status for PayOS orders
 * @param {Object} order - The order object
 * @returns {string} - The correct status
 */
export const getCorrectOrderStatus = (order) => {
    if (!order) return 'pending';

    // PayOS orders should be 'processing' if they're still 'pending'
    if (isPayOSPayment(order.payment_method) && order.status === 'pending') {
        return 'processing';
    }

    return order.status;
};

/**
 * Format payment method for display
 * @param {string} method - The payment method
 * @returns {string} - Formatted payment method
 */
export const formatPaymentMethod = (method) => {
    if (!method) return 'Chưa cập nhật';

    const methods = {
        'cod': 'Thanh toán khi nhận hàng',
        'COD': 'Thanh toán khi nhận hàng',
        'payos': 'Thanh toán online qua PayOS',
        'PayOS': 'Thanh toán online qua PayOS',
        'PAYOS': 'Thanh toán online qua PayOS',
        'bank': 'Chuyển khoản ngân hàng',
        'momo': 'Ví MoMo',
        'zalopay': 'Ví ZaloPay',
        'vnpay': 'VNPay'
    };

    return methods[method] || method;
}; 