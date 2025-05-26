// src/services/productService.js
import api from './api';
import axios from 'axios';

const productService = {
  // Lấy tất cả sản phẩm với các bộ lọc
  getProducts: async (params = {}) => {
    try {
      // Xử lý tham số exclude trước khi gửi API
      const apiParams = { ...params };

      // Xử lý exclude nếu có (chuyển thành chuỗi nếu là số)
      if (apiParams.exclude !== undefined) {
        if (Array.isArray(apiParams.exclude)) {
          apiParams.exclude = apiParams.exclude.join(',');
        } else if (typeof apiParams.exclude !== 'string') {
          apiParams.exclude = String(apiParams.exclude);
        }
      }

      console.log('Sending API params:', apiParams);

      const response = await api.get('/api/e-commerce/products', { params: apiParams });
      const products = response.data.map(product => formatProductData(product));

      console.log(`Retrieved ${products.length} products from API`);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Lấy chi tiết sản phẩm theo ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/api/e-commerce/products/${id}`);
      return formatProductData(response.data);
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },

  // Lấy sản phẩm theo danh mục
  getProductsByCategory: async (categoryId, params = {}) => {
    try {
      // Các tham số mặc định cho phân trang
      const apiParams = {
        page: 1,
        limit: 9,
        sort_by: "name",
        include_subcategories: true,
        ...params
      };

      console.log('===== FETCHING CATEGORY PRODUCTS =====');
      console.log('Category ID:', categoryId);
      console.log('API Params:', apiParams);

      // Xử lý trường hợp đặc biệt khi categoryId = "all"
      if (categoryId === 'all' || categoryId === 'all-products') {
        console.log('Redirecting to getAllProducts...');
        return await productService.getAllProducts(apiParams);
      }

      const response = await api.get(`/api/e-commerce/categories/${categoryId}/products`, { params: apiParams });

      console.log('===== CATEGORY PRODUCTS RAW RESPONSE =====');
      console.log('Full response:', response.data);
      console.log('Response structure:', {
        hasProducts: !!response.data.products,
        productCount: response.data.products?.length || 0,
        pagination: response.data.pagination,
        totalProducts: response.data.total_products,
        totalPages: response.data.total_pages
      });

      // Xử lý pagination - cải thiện logic
      let finalPagination;

      if (response.data.pagination) {
        // Sử dụng pagination data từ API
        finalPagination = response.data.pagination;
        console.log('Using API pagination data:', finalPagination);
      } else if (response.data.total_products) {
        // Tạo pagination từ thông tin total_products
        finalPagination = {
          total_products: response.data.total_products,
          total_pages: Math.ceil(response.data.total_products / apiParams.limit),
          current_page: apiParams.page,
          limit: apiParams.limit,
          has_next: apiParams.page < Math.ceil(response.data.total_products / apiParams.limit),
          has_prev: apiParams.page > 1
        };
        console.log('Created pagination from total_products:', finalPagination);
      } else {
        // Fallback - giả sử có nhiều sản phẩm hơn để test pagination
        const productCount = response.data.products?.length || 0;
        const assumedTotal = Math.max(productCount * 2, 25); // Giả sử có ít nhất 25 sản phẩm
        finalPagination = {
          total_products: assumedTotal,
          total_pages: Math.ceil(assumedTotal / apiParams.limit),
          current_page: apiParams.page,
          limit: apiParams.limit,
          has_next: apiParams.page < Math.ceil(assumedTotal / apiParams.limit),
          has_prev: apiParams.page > 1
        };
        console.log('Using fallback pagination (for testing):', finalPagination);
      }

      // Trả về dữ liệu với pagination được cải thiện
      const result = {
        products: response.data.products || [],
        pagination: finalPagination,
        category: response.data.category || {
          category_id: categoryId,
          name: 'Danh mục',
          description: ''
        }
      };

      console.log('===== FINAL CATEGORY RESULT =====');
      console.log('Product count:', result.products.length);
      console.log('Pagination:', result.pagination);
      console.log('Total pages:', result.pagination.total_pages);
      console.log('===== END CATEGORY PRODUCTS =====');

      return result;
    } catch (error) {
      console.error('===== ERROR FETCHING CATEGORY PRODUCTS =====');
      console.error('Category ID:', categoryId);
      console.error('Error:', error);
      console.error('===== END ERROR =====');

      return {
        products: [],
        pagination: {
          total_products: 0,
          total_pages: 0,
          current_page: 1,
          limit: 9,
          has_next: false,
          has_prev: false
        },
        category: {
          category_id: categoryId,
          name: categoryId === 'all' ? 'Tất cả sản phẩm' : '',
          description: ''
        }
      };
    }
  },

  // Tìm kiếm sản phẩm
  searchProducts: async (query, params = {}) => {
    try {
      console.log('🔍 Searching products:', query, params);
      const response = await api.get('/api/e-commerce/products/search', {
        params: { query, ...params }
      });

      console.log('🔍 Search API response:', response.data);

      // API mới trả về cấu trúc { products: [], total: 0, ... }
      if (response.data && response.data.products) {
        const formattedProducts = response.data.products.map(product => formatProductData(product));
        console.log('🔍 Formatted search results:', formattedProducts.length, 'products');
        return formattedProducts;
      }

      // Fallback cho cấu trúc cũ
      if (Array.isArray(response.data)) {
        return response.data.map(product => formatProductData(product));
      }

      console.warn('🔍 Unexpected search response structure:', response.data);
      return [];
    } catch (error) {
      console.error('Error searching products:', error);
      return []; // Trả về mảng rỗng thay vì throw error
    }
  },

  // Lấy sản phẩm nổi bật
  getFeaturedProducts: async () => {
    try {
      console.log('Gọi API lấy sản phẩm nổi bật');
      // Thiết lập timeout 8 giây để tránh chờ quá lâu
      const response = await api.get('/api/e-commerce/products/featured', {
        timeout: 8000
      });

      console.log('Kết quả API sản phẩm nổi bật:', response.data);

      // Kiểm tra dữ liệu hợp lệ
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('API trả về dữ liệu không hợp lệ:', response.data);
        return [];
      }

      // Định dạng dữ liệu sản phẩm
      const formattedProducts = response.data.map(product => formatProductData(product));
      console.log(`Đã định dạng ${formattedProducts.length} sản phẩm nổi bật`);

      return formattedProducts;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // Trả về mảng rỗng thay vì ném lỗi
      return [];
    }
  },

  // Lấy đánh giá sản phẩm
  getProductReviews: async (productId, params = {}) => {
    try {
      const response = await api.get(`/api/e-commerce/products/${productId}/reviews`, { params });
      return {
        reviews: response.data.reviews || [],
        total: response.data.total || 0,
        averageRating: response.data.average_rating || 0,
        ratingCounts: response.data.rating_counts || [0, 0, 0, 0, 0]
      };
    } catch (error) {
      console.error(`Error fetching reviews for product ID ${productId}:`, error);
      throw error;
    }
  },

  // Thêm đánh giá sản phẩm
  addProductReview: async (productId, reviewData) => {
    try {
      const response = await api.post(`/api/e-commerce/products/${productId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error adding review for product ID ${productId}:`, error);
      throw error;
    }
  },

  // Đánh giá review (thích/không thích)
  voteReview: async (productId, reviewId, voteType) => {
    try {
      const response = await api.post(`/api/e-commerce/products/${productId}/reviews/${reviewId}/vote`, {
        vote_type: voteType
      });
      return response.data;
    } catch (error) {
      console.error(`Error voting review ID ${reviewId}:`, error);
      throw error;
    }
  },

  // Lấy tất cả danh mục
  getCategories: async () => {
    try {
      const response = await api.get('/api/e-commerce/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Lấy danh mục con theo ID danh mục cha
  getSubcategories: async (categoryId) => {
    try {
      // Nếu không có categoryId, lấy tất cả categories
      const endpoint = categoryId
        ? `${API_URL}/api/e-commerce/categories/${categoryId}/subcategories`
        : `${API_URL}/api/e-commerce/categories`;

      // console.log('Fetching subcategories from endpoint:', endpoint);

      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      if (error.response?.status === 422) {
        console.warn('Invalid category ID:', categoryId);
        return [];
      }
      throw error;
    }
  },

  // Lấy cây danh mục
  getCategoryTree: async () => {
    try {
      const response = await api.get('/api/e-commerce/categories-tree');
      return response.data;
    } catch (error) {
      console.error('Error fetching category tree:', error);
      throw error;
    }
  },

  // Lấy sản phẩm liên quan
  getRelatedProducts: async (productId, limit = 4) => {
    try {
      if (!productId) {
        console.error('Không có productId cho sản phẩm liên quan');
        return [];
      }

      // Kiểm tra cache trong session storage
      const cacheKey = `related_products_${productId}_limit_${limit}`;

      // Xóa cache cũ để buộc tải lại dữ liệu
      try {
        sessionStorage.removeItem(cacheKey);
        console.log(`Đã xóa cache ${cacheKey} để tải lại dữ liệu mới`);
      } catch (error) {
        console.warn('Lỗi khi xóa cache:', error);
      }

      // Gọi API lấy sản phẩm liên quan
      console.log(`Lấy sản phẩm liên quan cho sản phẩm ID ${productId}`);

      const response = await api.get(`/api/e-commerce/products/${productId}/related`, {
        params: { limit }
      });

      // Xử lý dữ liệu trả về
      let relatedProducts = [];

      if (response.data && Array.isArray(response.data)) {
        console.log('Dữ liệu sản phẩm liên quan từ API:', response.data);

        // Kiểm tra cấu trúc dữ liệu trả về
        response.data.forEach((product, index) => {
          console.log(`Sản phẩm liên quan #${index + 1}:`, {
            id: product.product_id,
            name: product.name,
            image: product.image || '[Không có]',
            images: product.images || '[Không có]'
          });
        });

        // Thêm debug mode cho ít nhất sản phẩm đầu tiên
        const debugOption = { isRelatedProduct: true, debug: true };

        relatedProducts = response.data.map((product, index) =>
          formatProductData(product, index === 0 ? debugOption : { isRelatedProduct: true })
        );

        // Kiểm tra các sản phẩm sau khi format
        console.log('Sản phẩm liên quan sau khi format:');
        relatedProducts.forEach((product, index) => {
          console.log(`Sản phẩm liên quan #${index + 1} (đã format):`, {
            id: product.id,
            name: product.name,
            image: product.image || '[Không có]',
            images: product.images || '[Không có]',
            price: product.discountPrice || product.originalPrice,
            originalPrice: product.originalPrice
          });
        });
      } else {
        console.warn('Định dạng dữ liệu API không hợp lệ cho sản phẩm liên quan');
      }

      console.log(`Nhận được ${relatedProducts.length} sản phẩm liên quan`);

      // Lưu kết quả vào cache
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(relatedProducts));
      } catch (cacheError) {
        console.warn('Lỗi lưu cache sessionStorage:', cacheError);
      }

      return relatedProducts;
    } catch (error) {
      console.error(`Lỗi khi lấy sản phẩm liên quan:`, error);
      return []; // Trả về mảng rỗng khi có lỗi
    }
  },

  // Lấy tất cả sản phẩm với phân trang
  getAllProducts: async (params = {}) => {
    try {
      const apiParams = {
        page: 1,
        limit: 9,
        sort_by: "created_at",
        ...params
      };

      console.log('===== FETCHING ALL PRODUCTS =====');
      console.log('API Params:', apiParams);

      const response = await api.get('/api/e-commerce/products', { params: apiParams });

      console.log('===== RAW API RESPONSE =====');
      console.log('Full response:', response.data);
      console.log('Response structure:', {
        hasProducts: !!response.data.products,
        hasDirectArray: Array.isArray(response.data),
        productCount: response.data.products?.length || response.data.length || 0,
        pagination: response.data.pagination,
        totalProducts: response.data.total_products,
        totalPages: response.data.total_pages,
        currentPage: response.data.current_page,
        hasNext: response.data.has_next,
        hasPrev: response.data.has_prev
      });

      // Xử lý dữ liệu sản phẩm
      let rawProducts = [];
      let paginationData = null;

      // Kiểm tra cấu trúc response
      if (response.data.products && Array.isArray(response.data.products)) {
        // Cấu trúc có pagination
        rawProducts = response.data.products;
        paginationData = response.data.pagination;
        console.log('Using products array with pagination data');
      } else if (Array.isArray(response.data)) {
        // Cấu trúc trực tiếp là array
        rawProducts = response.data;
        paginationData = null;
        console.log('Using direct array, no pagination data');
      }

      console.log('Raw products count:', rawProducts.length);
      console.log('Pagination data:', paginationData);

      // Format từng sản phẩm
      const formattedProducts = rawProducts.map((product, index) => {
        return formatProductData(product, { debug: index === 0 });
      });

      // Xử lý pagination - ưu tiên thông tin từ API với giới hạn hợp lý
      let finalPagination;

      if (paginationData) {
        // Sử dụng pagination data từ API nhưng giới hạn số trang hiển thị
        const maxReasonablePages = 50; // Giới hạn tối đa 50 trang để UX tốt hơn
        const actualTotalPages = paginationData.total_pages;
        const displayTotalPages = Math.min(actualTotalPages, maxReasonablePages);

        finalPagination = {
          ...paginationData,
          total_pages: displayTotalPages,
          has_next: apiParams.page < displayTotalPages
        };
        console.log('Using API pagination data (limited):', finalPagination);
      } else if (response.data.total_products || response.data.total_pages) {
        // Tạo pagination từ thông tin total_products hoặc total_pages với giới hạn
        const totalProducts = response.data.total_products || (response.data.total_pages * apiParams.limit);
        const actualTotalPages = response.data.total_pages || Math.ceil(totalProducts / apiParams.limit);
        const maxReasonablePages = 50; // Giới hạn tối đa 50 trang
        const displayTotalPages = Math.min(actualTotalPages, maxReasonablePages);

        finalPagination = {
          total_products: totalProducts,
          total_pages: displayTotalPages,
          current_page: response.data.current_page || apiParams.page,
          limit: apiParams.limit,
          has_next: (response.data.current_page || apiParams.page) < displayTotalPages,
          has_prev: (response.data.current_page || apiParams.page) > 1
        };
        console.log('Created pagination from API metadata (limited):', finalPagination);
      } else {
        // Nếu không có thông tin pagination, tạo pagination cơ bản
        const estimatedTotal = rawProducts.length > 0 ? Math.max(rawProducts.length * 10, 100) : 0;
        const maxReasonablePages = 20; // Giới hạn cho trường hợp fallback
        const actualTotalPages = Math.ceil(estimatedTotal / apiParams.limit);
        const displayTotalPages = Math.min(actualTotalPages, maxReasonablePages);

        finalPagination = {
          total_products: estimatedTotal,
          total_pages: displayTotalPages,
          current_page: apiParams.page,
          limit: apiParams.limit,
          has_next: apiParams.page < displayTotalPages,
          has_prev: apiParams.page > 1
        };
        console.log('⚠️ No pagination info from API, using estimated pagination (limited):', finalPagination);
      }

      const result = {
        products: formattedProducts,
        pagination: finalPagination,
        category: {
          category_id: 'all',
          name: 'Tất cả sản phẩm',
          description: 'Hiển thị tất cả sản phẩm có sẵn'
        }
      };

      console.log('===== FINAL RESULT =====');
      console.log('Product count:', result.products.length);
      console.log('Pagination:', result.pagination);
      console.log('Total pages:', result.pagination.total_pages);
      console.log('Expected: 1627 sản phẩm = ~136 trang (với 12 sản phẩm/trang)');
      console.log('===== END ALL PRODUCTS =====');

      return result;
    } catch (error) {
      console.error('===== ERROR FETCHING ALL PRODUCTS =====');
      console.error('Error:', error);
      console.error('===== END ERROR =====');

      return {
        products: [],
        pagination: {
          total_products: 0,
          total_pages: 0,
          current_page: 1,
          limit: 9,
          has_next: false,
          has_prev: false
        },
        category: {
          category_id: 'all',
          name: 'Tất cả sản phẩm',
          description: 'Hiển thị tất cả sản phẩm có sẵn'
        }
      };
    }
  }
};

// Hàm định dạng dữ liệu sản phẩm từ API sang định dạng phù hợp với UI
const formatProductData = (apiProduct, options = {}) => {
  // Chỉ ghi log khi không phải là sản phẩm liên quan hoặc khi cần debug
  const shouldLog = !options.isRelatedProduct || options.debug === true;

  if (shouldLog) {
    console.log('===== DEBUG FORMAT_PRODUCT_DATA =====');
    console.log('INPUT API Product data:', JSON.stringify(apiProduct));
  }

  // Xử lý danh sách hình ảnh
  let sortedImages = [];

  // 1. Nếu API trả về trực tiếp trường images là mảng các URL
  if (Array.isArray(apiProduct.images)) {
    sortedImages = apiProduct.images.filter(img => img); // Lọc bỏ các giá trị null/undefined
    if (shouldLog) {
      console.log('Đã tìm thấy mảng images URL, với', sortedImages.length, 'ảnh');
    }
  }
  // 2. Nếu API trả về mảng đối tượng ProductImages
  else if (apiProduct.images && Array.isArray(apiProduct.images) && apiProduct.images.length > 0 && apiProduct.images[0].image_url) {
    sortedImages = apiProduct.images.map(img => img.image_url).filter(img => img);
    if (shouldLog) {
      console.log('Đã tìm thấy mảng đối tượng ProductImages, với', sortedImages.length, 'ảnh');
    }
  }

  // Lấy hình ảnh chính từ trường image hoặc từ mảng hình ảnh
  let primaryImage = apiProduct.image;
  if (!primaryImage && sortedImages.length > 0) {
    primaryImage = sortedImages[0];
  }

  if (shouldLog) {
    console.log('Primary image:', primaryImage);
    console.log('All images:', sortedImages);
  }

  // Lấy đơn vị
  const unit = apiProduct.unit || 'kg';

  // Xử lý giá và giá gốc
  let originalPrice = 0;
  let discountPrice = null;
  let hasDiscount = false;

  // Lấy giá gốc - KHÔNG NHÂN HỆ SỐ
  if (apiProduct.original_price !== undefined && apiProduct.original_price !== null) {
    originalPrice = parseFloat(apiProduct.original_price);
    if (shouldLog) {
      console.log('ORIGINAL PRICE FROM API:', apiProduct.original_price, '-> Parsed as:', originalPrice);
    }
  }

  // Lấy giá sau giảm - KHÔNG NHÂN HỆ SỐ
  if (apiProduct.price !== undefined && apiProduct.price !== null) {
    const priceValue = parseFloat(apiProduct.price);
    if (shouldLog) {
      console.log('PRICE FROM API:', apiProduct.price, '-> Parsed as:', priceValue);
    }

    // Nếu price là 0, không có giảm giá, sử dụng original_price
    if (priceValue === 0) {
      discountPrice = null;
    } else {
      // Nếu price > 0, đây là giá sau giảm giá
      discountPrice = priceValue;

      // Kiểm tra xem có giảm giá thực sự hay không (original_price > price)
      if (originalPrice > discountPrice) {
        hasDiscount = true;
      } else if (originalPrice === 0) {
        // Nếu không có original_price nhưng có price, dùng price làm giá gốc
        originalPrice = discountPrice;
        hasDiscount = false;
      } else if (originalPrice <= discountPrice) {
        // Trường hợp original_price <= price: dùng price là giá duy nhất
        originalPrice = discountPrice;
        hasDiscount = false;
      }
    }
  }

  // Xử lý ID sản phẩm
  const productId = apiProduct.product_id || apiProduct.id ||
    (apiProduct.productId) ||
    (apiProduct._id);

  // Ghi log ID sản phẩm đã xử lý
  if (shouldLog) {
    console.log('Processed Product ID:', productId);
    console.log('Unit:', unit);
    console.log('FINAL Original Price:', originalPrice);
    console.log('FINAL Discount Price:', discountPrice);
    console.log('Has Discount:', hasDiscount);
    console.log('Images:', sortedImages);
  }

  const formattedProduct = {
    id: productId, // Đảm bảo id luôn tồn tại
    name: apiProduct.name || '',
    shortDescription: apiProduct.short_description || (apiProduct.description ? apiProduct.description.substring(0, 150) + '...' : ''),
    description: apiProduct.description || '',
    originalPrice: originalPrice,
    discountPrice: discountPrice,
    hasDiscount: hasDiscount,
    images: sortedImages,
    image: primaryImage,
    inStock: apiProduct.stock_quantity > 0,
    stock_quantity: apiProduct.stock_quantity || 0,
    rating: apiProduct.average_rating || 0,
    reviewCount: apiProduct.review_count || 0,
    categoryId: apiProduct.category_id,
    category: apiProduct.category || { category_id: apiProduct.category_id, name: '' },
    tags: apiProduct.tags || [],
    ratingCounts: apiProduct.rating_counts || [0, 0, 0, 0, 0],
    specifications: [
      apiProduct.unit ? { name: "Đơn vị", value: apiProduct.unit } : null,
      apiProduct.stock_quantity !== undefined ? { name: "Số lượng còn lại", value: apiProduct.stock_quantity } : null,
      ...(apiProduct.specifications || [])
    ].filter(Boolean),
    reviews: apiProduct.reviews || [],
    isRelatedProduct: options.isRelatedProduct || false,
    unit: unit
  };

  if (shouldLog) {
    console.log('OUTPUT Formatted Product:', JSON.stringify(formattedProduct));
    console.log('===== END DEBUG =====');
  }

  return formattedProduct;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const getAllProducts = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/api/e-commerce/products`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await axios.get(`${API_URL}/api/e-commerce/products`, {
      params: {
        category_id: categoryId
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};



export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/e-commerce/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const voteReview = async (productId, reviewId, voteType) => {
  try {
    const response = await api.post(`/api/e-commerce/products/${productId}/reviews/${reviewId}/vote`, {
      vote_type: voteType
    });
    return response.data;
  } catch (error) {
    console.error(`Error voting review ID ${reviewId}:`, error);
    throw error;
  }
};

export const getSubcategories = async (categoryId) => {
  try {
    // Nếu không có categoryId, lấy tất cả categories
    const endpoint = categoryId
      ? `${API_URL}/api/e-commerce/categories/${categoryId}/subcategories`
      : `${API_URL}/api/e-commerce/categories`;

    // console.log('Fetching subcategories from endpoint:', endpoint);

    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    if (error.response?.status === 422) {
      console.warn('Invalid category ID:', categoryId);
      return [];
    }
    throw error;
  }
};

export default productService;

