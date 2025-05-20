/**
 * Tiện ích xử lý và phân tích dữ liệu doanh thu
 */

/**
 * Chuẩn hóa dữ liệu doanh thu từ API
 * @param {Array} revenueData - Dữ liệu doanh thu thô từ API
 * @param {string} timeRange - Khoảng thời gian (daily, weekly, monthly, yearly)
 * @returns {Array} - Dữ liệu doanh thu đã được chuẩn hóa
 */
export const normalizeRevenueData = (revenueData, timeRange = 'monthly') => {
  if (!revenueData || !Array.isArray(revenueData) || revenueData.length === 0) {
    return [];
  }

  return revenueData.map(item => ({
    period: item.period || item.label || '',
    revenue: Number(item.revenue || item.value || 0),
    orders_count: Number(item.orders_count || 0),
    formatted_period: formatPeriodLabel(item.period || item.label || '', timeRange)
  }));
};

/**
 * Định dạng nhãn thời gian dựa trên khoảng thời gian
 * @param {string} period - Nhãn thời gian gốc
 * @param {string} timeRange - Khoảng thời gian (daily, weekly, monthly, yearly)
 * @returns {string} - Nhãn thời gian đã định dạng
 */
export const formatPeriodLabel = (period, timeRange = 'monthly') => {
  if (!period) return '';
  
  try {
    switch(timeRange) {
      case 'daily':
        // Định dạng: 'DD/MM'
        if (period.includes('-')) {
          const date = new Date(period);
          return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        }
        return period;
      case 'weekly':
        // Nếu period là 'Week X of YYYY', chỉ giữ lại 'Tuần X'
        if (period.includes('Week')) {
          return period.replace(/Week (\d+) of \d+/i, 'Tuần $1');
        }
        return period;
      case 'monthly':
        // Định dạng: 'MM/YYYY'
        if (period.includes('-')) {
          const [year, month] = period.split('-');
          return `${month}/${year}`;
        }
        return period;
      case 'yearly':
        // Giữ nguyên năm
        return period;
      default:
        return period;
    }
  } catch (error) {
    console.error('Lỗi khi định dạng nhãn thời gian:', error);
    return period;
  }
};

/**
 * Tính toán doanh thu trung bình từ dữ liệu
 * @param {Array} revenueData - Dữ liệu doanh thu đã chuẩn hóa
 * @returns {number} - Doanh thu trung bình
 */
export const calculateAverageRevenue = (revenueData) => {
  if (!revenueData || !Array.isArray(revenueData) || revenueData.length === 0) {
    return 0;
  }

  const total = revenueData.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
  return total / revenueData.length;
};

/**
 * Tính toán tổng doanh thu từ dữ liệu
 * @param {Array} revenueData - Dữ liệu doanh thu đã chuẩn hóa
 * @returns {number} - Tổng doanh thu
 */
export const calculateTotalRevenue = (revenueData) => {
  if (!revenueData || !Array.isArray(revenueData) || revenueData.length === 0) {
    return 0;
  }

  return revenueData.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
};

/**
 * Tính toán tổng số đơn hàng từ dữ liệu
 * @param {Array} revenueData - Dữ liệu doanh thu đã chuẩn hóa
 * @returns {number} - Tổng số đơn hàng
 */
export const calculateTotalOrders = (revenueData) => {
  if (!revenueData || !Array.isArray(revenueData) || revenueData.length === 0) {
    return 0;
  }

  return revenueData.reduce((sum, item) => sum + Number(item.orders_count || 0), 0);
};

/**
 * Tìm giá trị doanh thu cao nhất trong dữ liệu
 * @param {Array} revenueData - Dữ liệu doanh thu đã chuẩn hóa
 * @returns {Object|null} - Mục dữ liệu có doanh thu cao nhất hoặc null nếu không có dữ liệu
 */
export const findHighestRevenuePeriod = (revenueData) => {
  if (!revenueData || !Array.isArray(revenueData) || revenueData.length === 0) {
    return null;
  }

  return revenueData.reduce((max, item) => 
    Number(item.revenue || 0) > Number(max.revenue || 0) ? item : max
  , revenueData[0]);
};

/**
 * Phân tích xu hướng doanh thu (tăng/giảm)
 * @param {Array} revenueData - Dữ liệu doanh thu đã chuẩn hóa
 * @returns {Object} - Thông tin xu hướng doanh thu
 */
export const analyzeRevenueTrend = (revenueData) => {
  if (!revenueData || !Array.isArray(revenueData) || revenueData.length < 2) {
    return { trend: 'unchanged', percentage: 0 };
  }

  // Sắp xếp dữ liệu theo period nếu có thể
  const sortedData = [...revenueData].sort((a, b) => {
    if (a.period && b.period && a.period.includes('-') && b.period.includes('-')) {
      return new Date(a.period) - new Date(b.period);
    }
    return 0;
  });

  const firstValue = Number(sortedData[0].revenue || 0);
  const lastValue = Number(sortedData[sortedData.length - 1].revenue || 0);
  
  // Tính phần trăm thay đổi
  let percentChange = 0;
  if (firstValue > 0) {
    percentChange = ((lastValue - firstValue) / firstValue) * 100;
  }

  // Xác định xu hướng
  let trend = 'unchanged';
  if (percentChange > 0) trend = 'increasing';
  else if (percentChange < 0) trend = 'decreasing';
  
  return {
    trend,
    percentage: Math.abs(percentChange),
    isPositive: percentChange >= 0
  };
}; 