// src/services/productService.js
import api from './api';

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
      
      console.log(`Fetching products for category ${categoryId} with params:`, apiParams);
      
      const response = await api.get(`/api/e-commerce/categories/${categoryId}/products`, { params: apiParams });
      console.log('Sản phẩm theo danh mục:', response.data);
      
      // Trả về dữ liệu nguyên bản từ API, không qua xử lý formatProductData
      const result = {
        products: response.data.products, // Trả về trực tiếp, không map qua formatProductData
        pagination: response.data.pagination,
        category: response.data.category
      };
      
      console.log(`Retrieved ${result.products.length} products for category ${categoryId} (page ${result.pagination.current_page}/${result.pagination.total_pages})`);
      
      return result;
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      // Trả về đối tượng có cấu trúc tương tự kết quả thành công nhưng rỗng
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
          name: "",
          description: ""
        }
      };
    }
  },
  
  // Tìm kiếm sản phẩm
  searchProducts: async (query, params = {}) => {
    try {
      const response = await api.get('/api/e-commerce/products/search', { 
        params: { query, ...params } 
      });
      return response.data.map(product => formatProductData(product));
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },
  
  // Lấy sản phẩm nổi bật
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/api/e-commerce/products/featured');
      return response.data.map(product => formatProductData(product));
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
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
      const response = await api.get(`/api/e-commerce/categories/${categoryId}/subcategories`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subcategories for category ID ${categoryId}:`, error);
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

export default productService;
