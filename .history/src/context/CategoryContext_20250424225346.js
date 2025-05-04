import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import productService from '../services/productService';

/**
 * CategoryContext
 * 
 * Context này lưu trữ và quản lý dữ liệu danh mục sản phẩm trong bộ nhớ ứng dụng.
 * Thay vì sử dụng localStorage, context này cung cấp một cách để lưu trữ tạm thời
 * dữ liệu danh mục giữa các lần di chuyển trang, giúp:
 * 
 * 1. Giảm số lần gọi API không cần thiết
 * 2. Bảo vệ dữ liệu khỏi việc lưu trữ bên ngoài bộ nhớ trình duyệt
 * 3. Chia sẻ dữ liệu giữa các component khác nhau
 * 4. Dữ liệu chỉ tồn tại trong phiên làm việc, không lưu trữ lâu dài
 */

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  // Lưu trữ danh mục con với key là categoryId
  const [subcategoriesMap, setSubcategoriesMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  // Thêm state để lưu trữ subcategory đã chọn cho mỗi category
  const [selectedSubcategoryMap, setSelectedSubcategoryMap] = useState({});
  // Thêm state để xác định xem người dùng đang quay lại hay không
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);

  // Hàm lấy danh mục con từ API hoặc cache, memoize bằng useCallback
  const fetchSubcategories = useCallback(async (categoryId, forceRefresh = false) => {
    if (!categoryId) {
      console.error('CategoryContext: No categoryId provided to fetchSubcategories');
      return [];
    }

    // Kiểm tra nếu categoryId không phải là số
    if (isNaN(parseInt(categoryId))) {
      console.error('CategoryContext: Invalid categoryId provided:', categoryId);
      return [];
    }

    // Kiểm tra xem đã có dữ liệu trong cache chưa và không yêu cầu refresh
    if (!forceRefresh && subcategoriesMap[categoryId]) {
      console.log('CategoryContext: Using cached subcategories for', categoryId);
      return subcategoriesMap[categoryId];
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('CategoryContext: Fetching subcategories for', categoryId, forceRefresh ? '(forced)' : '');
      const data = await productService.getSubcategories(categoryId);

      // Nếu API trả về dữ liệu hợp lệ, lưu vào cache
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`CategoryContext: Got ${data.length} subcategories for ${categoryId}, saving to cache`);
        setSubcategoriesMap(prev => ({
          ...prev,
          [categoryId]: data
        }));
        setLastFetched(Date.now());
        setIsLoading(false);
        return data;
      }
      // Trường hợp API trả về mảng rỗng
      else if (data && Array.isArray(data) && data.length === 0) {
        console.log('CategoryContext: API returned empty array, checking cache');

        // Nếu đã có dữ liệu trong cache và không force refresh, ưu tiên sử dụng cache
        if (!forceRefresh && subcategoriesMap[categoryId] && subcategoriesMap[categoryId].length > 0) {
          console.log(`CategoryContext: Using existing ${subcategoriesMap[categoryId].length} items from cache for ${categoryId}`);
          setIsLoading(false);
          return subcategoriesMap[categoryId];
        }

        // Tìm trong các cache khác nếu không có dữ liệu cho categoryId hiện tại
        const cachedEntries = Object.entries(subcategoriesMap);
        if (cachedEntries.length > 0) {
          // Tìm danh mục trong cache có nhiều subcategories nhất
          let bestMatch = null;
          let maxSubcategories = 0;

          cachedEntries.forEach(([cachedId, subcategories]) => {
            if (subcategories && subcategories.length > maxSubcategories) {
              maxSubcategories = subcategories.length;
              bestMatch = cachedId;
            }
          });

          if (bestMatch && subcategoriesMap[bestMatch].length > 0) {
            console.log(`CategoryContext: Using best available data from category ${bestMatch} with ${maxSubcategories} subcategories`);
            return subcategoriesMap[bestMatch];
          }
        }

        // Nếu không tìm thấy dữ liệu nào, trả về mảng rỗng
        console.log('CategoryContext: No data found in cache, returning empty array');
        setIsLoading(false);
        return [];
      }

      // Trường hợp lỗi hoặc dữ liệu không hợp lệ
      console.warn('CategoryContext: Invalid data returned from API');
      setIsLoading(false);
      return [];
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      setError(error.message || 'Không thể lấy danh mục con');
      setIsLoading(false);

      // Nếu có lỗi nhưng có dữ liệu trong cache, vẫn trả về dữ liệu cache
      if (subcategoriesMap[categoryId] && subcategoriesMap[categoryId].length > 0) {
        console.log(`CategoryContext: Error occurred but using cached data for ${categoryId}`);
        return subcategoriesMap[categoryId];
      }

      return [];
    }
  }, [subcategoriesMap]);

  // Hàm lấy danh mục nếu đã có trong cache
  const getSubcategoriesFromCache = useCallback((categoryId) => {
    return subcategoriesMap[categoryId] || null;
  }, [subcategoriesMap]);

  // Hàm xóa cache cho một danh mục cụ thể
  const clearSubcategoriesCache = useCallback((categoryId) => {
    if (categoryId) {
      console.log('CategoryContext: Clearing cache for', categoryId);
      setSubcategoriesMap(prev => {
        const newCache = { ...prev };
        delete newCache[categoryId];
        return newCache;
      });
    } else {
      console.log('CategoryContext: Clearing all cache');
      setSubcategoriesMap({});
    }
  }, []);

  // Thêm hàm để lưu subcategory đã chọn
  const setSelectedSubcategory = useCallback((categoryId, subcategoryId) => {
    if (!categoryId) return;
    console.log('CategoryContext: Setting selected subcategory', { categoryId, subcategoryId });
    setSelectedSubcategoryMap(prev => ({
      ...prev,
      [categoryId]: subcategoryId
    }));
  }, []);

  // Thêm hàm để lấy subcategory đã chọn
  const getSelectedSubcategory = useCallback((categoryId) => {
    return selectedSubcategoryMap[categoryId] || null;
  }, [selectedSubcategoryMap]);

  // Thêm hàm để đánh dấu trạng thái điều hướng
  const setNavigatingBackStatus = useCallback((status) => {
    setIsNavigatingBack(status);
  }, []);

  // Debug để theo dõi thay đổi trong context
  useEffect(() => {
    console.log('CategoryContext: subcategoriesMap updated', subcategoriesMap);
  }, [subcategoriesMap]);

  useEffect(() => {
    console.log('CategoryContext: selectedSubcategoryMap updated', selectedSubcategoryMap);
  }, [selectedSubcategoryMap]);

  // Giá trị cung cấp qua context
  const contextValue = {
    subcategoriesMap,
    fetchSubcategories,
    getSubcategoriesFromCache,
    clearSubcategoriesCache,
    setSelectedSubcategory,
    getSelectedSubcategory,
    isNavigatingBack,
    setNavigatingBackStatus,
    isLoading,
    error,
    lastFetched
  };

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
};

// Hook tùy chỉnh để sử dụng context
export const useCategory = () => useContext(CategoryContext);

export default CategoryContext; 