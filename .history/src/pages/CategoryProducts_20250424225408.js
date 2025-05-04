// src/pages/CategoryProducts.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaAngleRight } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import CategoryProductItem from '../components/category/CategoryProductItem/CategoryProductItem';
import Pagination from '../components/common/Pagination/Pagination';
import CategorySidebar from '../components/category/CategorySidebar/CategorySidebar';
import productService from '../services/productService';
import { useCategory } from '../context/CategoryContext';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const BreadcrumbNav = styled.nav`
  margin-bottom: 20px;
  
  ul {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    align-items: center;
    flex-wrap: wrap;
    
    li {
      display: flex;
      align-items: center;
      
      &:not(:last-child)::after {
        content: '';
        margin: 0 8px;
        display: flex;
        align-items: center;
      }
      
      a {
        color: #666;
        text-decoration: none;
        display: flex;
        align-items: center;
        
        &:hover {
          color: #4CAF50;
        }
      }
      
      &:last-child a {
        color: #333;
        font-weight: 500;
        pointer-events: none;
      }
    }
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  animation: fadeIn 0.5s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const CategoryHeader = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const CategoryTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
`;

const CategoryDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  margin-bottom: 20px;
`;

const ProductCount = styled.div`
  color: #666;
  font-size: 14px;
`;

const SortSelector = styled.select`
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const NoProducts = styled.div`
  text-align: center;
  padding: 50px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h3 {
    margin: 0 0 10px;
    color: #333;
  }
  
  p {
    color: #666;
    margin: 0;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px 0;
  color: #4CAF50;
  font-size: 18px;
`;

// Thêm styled component cho URL
const CategoryURL = styled.div`
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
  
  a {
    color: #4CAF50;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

// Lấy category ID gốc từ URL
const getRootCategoryId = (pathname) => {
  // Xử lý tất cả các định dạng có thể của URL
  // '/categories/X', '/categories/X/...', '/products/X', etc.
  const categoryMatches = pathname.match(/\/categories\/(\d+)/);
  if (categoryMatches && categoryMatches[1]) {
    const categoryId = parseInt(categoryMatches[1]);
    if (!isNaN(categoryId)) {
      console.log('CategoryProducts: Found valid rootCategoryId in URL:', categoryId);
      return categoryId;
    }
  }

  // Không tìm thấy ID hợp lệ trong URL
  console.log('CategoryProducts: No valid rootCategoryId found in URL');
  return null;
};

const CategoryProducts = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [rootCategoryId, setRootCategoryId] = useState(null);
  const [originalRootId, setOriginalRootId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    sort: 'newest',
    minPrice: undefined,
    maxPrice: undefined
  });

  // Refs để theo dõi trạng thái
  const prevIdRef = useRef(id);
  const hasFetchedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const processingCategoryInfoRef = useRef(false);

  // Ref để lưu trữ lỗi MCP
  const mcpErrorsRef = useRef([]);

  // Sử dụng CategoryContext
  const {
    fetchSubcategories,
    clearSubcategoriesCache,
    setNavigatingBackStatus,
    getSelectedSubcategory,
    setSelectedSubcategory
  } = useCategory();

  // Memoize các hàm callback để tránh re-renders không cần thiết
  const memoizedFetchSubcategories = useCallback((catId, force) => {
    return fetchSubcategories(catId, force);
  }, [fetchSubcategories]);

  // Theo dõi lỗi trình duyệt với MCP
  useEffect(() => {
    // Theo dõi lỗi trình duyệt
    const handleError = (event) => {
      const errorInfo = {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack || 'Unknown',
        timestamp: new Date().toISOString()
      };

      // Lưu lỗi vào ref
      mcpErrorsRef.current.push(errorInfo);

      // Giới hạn số lượng lỗi lưu trữ
      if (mcpErrorsRef.current.length > 10) {
        mcpErrorsRef.current.shift();
      }

      // Ghi log lỗi
      console.error('MCP Error Monitoring:', errorInfo);

      // Reset trạng thái nếu có lỗi với việc tải sản phẩm
      if (
        event.message.includes('product') ||
        event.message.includes('categor') ||
        event.message.includes('fetch')
      ) {
        isProcessingRef.current = false;
        processingCategoryInfoRef.current = false;
        setLoading(false);
      }
    };

    // Lắng nghe lỗi trình duyệt
    window.addEventListener('error', handleError);

    // Lắng nghe promise rejection
    window.addEventListener('unhandledrejection', (event) => {
      handleError({
        message: `Unhandled Promise rejection: ${event.reason}`,
        error: event.reason,
        timestamp: new Date().toISOString()
      });
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  // Lưu trữ rootCategoryId ban đầu khi component mount lần đầu
  useEffect(() => {
    if (!originalRootId) {
      const rootId = getRootCategoryId(location.pathname) || id;
      console.log('CategoryProducts: Setting originalRootId to', rootId);
      setOriginalRootId(rootId);
    }
  }, [originalRootId, location.pathname, id]);

  // Kiểm tra nếu đang quay lại từ trang sản phẩm
  useEffect(() => {
    const isReturningFromProduct = location.state?.fromProduct;
    const isBrowserBack = location.action === 'POP';

    if (isReturningFromProduct || isBrowserBack) {
      console.log('CategoryProducts: Returning from product page or browser back');

      // Đánh dấu là đang quay lại trong context
      setNavigatingBackStatus(true);

      // Kiểm tra nếu có subcategory đã chọn
      if (id) {
        const selectedSubId = getSelectedSubcategory(id);
        if (selectedSubId) {
          console.log('CategoryProducts: Found previously selected subcategory', selectedSubId);
        }
      }

      // Xóa trạng thái để không gây lỗi khi làm mới trang
      if (isReturningFromProduct) {
        navigate(location.pathname, {
          replace: true,
          state: {
            isBack: true // Thêm cờ isBack để đánh dấu là đang quay lại
          }
        });
      }
    } else {
      // Không phải quay lại, đặt lại trạng thái
      setNavigatingBackStatus(false);
    }
  }, [location, navigate, id, getSelectedSubcategory, setNavigatingBackStatus]);

  // Xác định rootCategoryId mỗi khi pathname hoặc id thay đổi
  useEffect(() => {
    // Ngăn chặn xử lý nếu đang trong quá trình fetch
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    // Kiểm tra tính hợp lệ của id
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      console.error('CategoryProducts: Invalid category ID:', id);
      setLoading(false);
      isProcessingRef.current = false;
      return;
    }

    // Luôn cập nhật rootCategoryId là id hiện tại để lấy đúng sản phẩm
    const rootId = getRootCategoryId(location.pathname) || parsedId;
    console.log('CategoryProducts: Setting rootCategoryId to', rootId, 'from URL or id:', parsedId);
    setRootCategoryId(rootId);

    // Đảm bảo subcategories được load cho danh mục phù hợp
    if (rootId) {
      const isReturningFromProduct = location.state?.fromProduct;

      // Nếu có originalRootId, luôn fetch subcategories của danh mục gốc
      if (originalRootId) {
        memoizedFetchSubcategories(originalRootId, isReturningFromProduct)
          .catch(error => {
            console.error('Failed to fetch subcategories:', error);
            // Ghi log lỗi MCP
            mcpErrorsRef.current.push({
              message: `Failed to fetch subcategories: ${error.message}`,
              timestamp: new Date().toISOString(),
              context: { originalRootId, isReturningFromProduct }
            });
          });
      } else {
        memoizedFetchSubcategories(rootId, isReturningFromProduct)
          .catch(error => {
            console.error('Failed to fetch subcategories:', error);
            // Ghi log lỗi MCP
            mcpErrorsRef.current.push({
              message: `Failed to fetch subcategories: ${error.message}`,
              timestamp: new Date().toISOString(),
              context: { rootId, isReturningFromProduct }
            });
          });
      }
    }

    setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  }, [location.pathname, id, memoizedFetchSubcategories, location.state, originalRootId]);

  // Reset trang về 1 khi id thay đổi
  useEffect(() => {
    // Khi id thay đổi, reset trang về 1
    console.log('CategoryProducts: Detected id change, resetting to page 1');
    setCurrentPage(1);
  }, [id]);

  // Lấy thông tin category từ ID
  useEffect(() => {
    // Ngăn chặn xử lý nếu đang trong quá trình fetch hoặc ID chưa thay đổi
    if (processingCategoryInfoRef.current || id === prevIdRef.current) {
      return;
    }

    processingCategoryInfoRef.current = true;
    prevIdRef.current = id;

    const fetchCategoryInfo = async () => {
      try {
        const allCategories = await productService.getCategories();
        const categoryInfo = allCategories.find(c => c.category_id === parseInt(id));

        if (categoryInfo) {
          setCategory(categoryInfo);
        } else {
          setCategory({
            category_id: parseInt(id),
            name: 'Danh mục sản phẩm',
            description: 'Sản phẩm thuộc danh mục này'
          });
        }
      } catch (error) {
        console.error('Failed to fetch category info:', error);
        // Ghi log lỗi MCP
        mcpErrorsRef.current.push({
          message: `Failed to fetch category info: ${error.message}`,
          timestamp: new Date().toISOString(),
          context: { id }
        });
      } finally {
        setTimeout(() => {
          processingCategoryInfoRef.current = false;
        }, 300);
      }
    };

    fetchCategoryInfo();
  }, [id]);

  // Lấy sản phẩm thuộc category
  const fetchProducts = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      console.log('===== FETCHING PRODUCTS =====');
      console.log('Danh mục ID:', id);
      console.log('Trang hiện tại:', currentPage);
      console.log('Bộ lọc:', filters);

      // Xóa cache trước khi gọi API
      try {
        localStorage.clear(); // Xóa tất cả localStorage
        sessionStorage.clear(); // Xóa tất cả sessionStorage
        console.log('Đã xóa tất cả cache');
      } catch (e) {
        console.error('Lỗi khi xóa cache:', e);
      }

      // Xác định loại sắp xếp cho API
      let sort_by = "created_at"; // Mặc định sắp xếp theo thời gian tạo mới nhất
      switch (filters.sort) {
        case 'price-asc': sort_by = "price_asc"; break;
        case 'price-desc': sort_by = "price_desc"; break;
        case 'newest': sort_by = "created_at"; break;
        case 'name-asc': sort_by = "name_asc"; break;
        case 'name-desc': sort_by = "name_desc"; break;
        default: sort_by = "created_at";
      }

      const result = await productService.getProductsByCategory(id, {
        include_subcategories: true,
        page: currentPage,
        limit: 9,
        sort_by: sort_by,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice
      });

      console.log('Kết quả phân trang:', result);

      // Kiểm tra chi tiết sản phẩm đầu tiên
      if (result.products && result.products.length > 0) {
        console.log('===== CHI TIẾT SẢN PHẨM ĐẦU TIÊN =====');
        console.log('ID:', result.products[0].id);
        console.log('Tên:', result.products[0].name);
        console.log('Giá gốc:', result.products[0].originalPrice);
        console.log('Giá giảm:', result.products[0].discountPrice);
        console.log('===== END DETAILS =====');
      }

      setProducts(result.products || []);
      setTotalPages(result.pagination?.total_pages || 1);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm:', error);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [id, currentPage, filters]);

  // Fetch sản phẩm khi id, trang hoặc bộ lọc thay đổi
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({
      ...prev,
      sort: e.target.value
    }));
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
    setCurrentPage(1);
  };

  // Hàm truy xuất lỗi MCP cho debug
  const getMCPErrors = useCallback(() => {
    return mcpErrorsRef.current;
  }, []);

  const calculateAdjustedPrice = (price, unit = 'kg') => {
    if (!price) return 0;

    // Nếu đơn vị là gam hoặc ml, không cần điều chỉnh
    if (unit === 'g' || unit === 'ml') {
      return price;
    }

    // Áp dụng công thức cho đơn vị kg, l, etc.
    return price * 1000 / (unit === 'kg' || unit === 'l' ? 1 : parseFloat(unit) || 1);
  };

  return (
    <MainLayout>
      <PageContainer>
        <BreadcrumbNav>
          <ul>
            <li>
              <Link to="/">
                <FaHome /> Trang chủ
              </Link>
              <FaAngleRight />
            </li>
            <li>
              <Link to="/categories">
                Các loại thực phẩm
              </Link>
              <FaAngleRight />
            </li>
            <li>
              <Link to={`/categories/${id}`}>
                {category ? category.name : 'Đang tải...'}
              </Link>
            </li>
          </ul>
        </BreadcrumbNav>

        <ContentContainer>
          <CategorySidebar
            categoryId={originalRootId || rootCategoryId}
            onFilterChange={handleFilterChange}
          />

          <MainContent>
            {category && (
              <CategoryHeader>
                <CategoryTitle>{category.name}</CategoryTitle>
              </CategoryHeader>
            )}

            <ProductsHeader>
              <ProductCount>
                {loading ? 'Đang tải...' : `Hiển thị ${products.length} sản phẩm`}
              </ProductCount>
              <SortSelector
                value={filters.sort}
                onChange={handleSortChange}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
                <option value="name-asc">Tên: A-Z</option>
                <option value="name-desc">Tên: Z-A</option>
              </SortSelector>
            </ProductsHeader>

            {loading ? (
              <LoadingSpinner>
                Đang tải sản phẩm...
              </LoadingSpinner>
            ) : products.length > 0 ? (
              <>
                <ProductGrid>
                  {products.map(product => (
                    <CategoryProductItem
                      key={product.product_id || product.id}
                      product={{
                        id: product.product_id || product.id,
                        name: product.name,
                        price: product.price || product.discountPrice,
                        originalPrice: product.original_price || product.originalPrice,
                        discountPercent: product.discount_percent || 0,
                        image: product.image || product.images?.[0],
                        images: product.images || [],
                        rating: product.average_rating || 0,
                        reviewCount: product.review_count || 0,
                        unit: product.unit || 'kg',
                        inStock: product.in_stock !== false
                      }}
                    />
                  ))}
                </ProductGrid>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <NoProducts>
                <h3>Không tìm thấy sản phẩm nào</h3>
                <p>Vui lòng thử tìm kiếm với bộ lọc khác hoặc xem các danh mục sản phẩm khác.</p>
              </NoProducts>
            )}
          </MainContent>
        </ContentContainer>
      </PageContainer>
    </MainLayout>
  );
};

export default CategoryProducts;
