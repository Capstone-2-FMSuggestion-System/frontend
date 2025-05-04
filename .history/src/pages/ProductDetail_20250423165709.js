// src/pages/ProductDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaStar, FaShoppingCart, FaHeart, FaShareAlt, FaMinus, FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/common/Button/Button';
import ProductCard from '../components/common/ProductCard/ProductCard';
import ReviewFilter from '../components/common/ReviewFilter/ReviewFilter';
import ReviewItem from '../components/common/ReviewItem/ReviewItem';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';

const ProductContainer = styled.div`
  margin-bottom: 40px;
`;

const BreadcrumbNav = styled.nav`
  margin-bottom: 20px;
  
  ul {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      margin-right: 5px;
      
      &:after {
        content: '/';
        margin-left: 5px;
        color: #999;
      }
      
      &:last-child:after {
        content: '';
      }
      
      a {
        color: #666;
        text-decoration: none;
        
        &:hover {
          color: #4CAF50;
        }
      }
      
      &:last-child a {
        color: #333;
        font-weight: 500;
      }
    }
  }
`;

const ProductDetailLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageGallery = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Thumbnails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  @media (max-width: 480px) {
    flex-direction: row;
    order: 2;
  }
  
  img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    cursor: pointer;
    border: 2px solid transparent;
    
    &.active {
      border-color: #4CAF50;
    }
  }
`;

const MainImage = styled.div`
  img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div``;

const ProductTitle = styled.h1`
  font-size: 1.8rem;
  margin: 0 0 15px;
`;

const ProductMeta = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  .rating {
    display: flex;
    align-items: center;
    
    svg {
      color: #FFD700;
      margin-right: 2px;
    }
    
    span {
      margin-left: 5px;
      color: #666;
    }
  }
  
  .divider {
    margin: 0 15px;
    color: #ddd;
  }
  
  .stock {
    color: ${props => props.inStock ? '#4CAF50' : '#d32f2f'};
  }
`;

const ProductPrice = styled.div`
  margin-bottom: 20px;
  
  .current {
    font-size: 1.8rem;
    font-weight: bold;
    color: #333;
  }
  
  .original {
    margin-left: 10px;
    font-size: 1.2rem;
    color: #999;
    text-decoration: line-through;
  }
  
  .discount {
    display: inline-block;
    margin-left: 10px;
    padding: 3px 8px;
    background-color: #FF8C00;
    color: white;
    border-radius: 4px;
    font-size: 0.9rem;
  }
`;

const ProductDescription = styled.div`
  margin-bottom: 20px;
  line-height: 1.6;
  color: #666;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  button {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    cursor: pointer;
    
    &:hover {
      background-color: #eee;
    }
    
    &:first-child {
      border-radius: 4px 0 0 4px;
    }
    
    &:last-child {
      border-radius: 0 4px 4px 0;
    }
  }
  
  input {
    width: 60px;
    height: 36px;
    text-align: center;
    border: 1px solid #ddd;
    border-left: none;
    border-right: none;
    
    &:focus {
      outline: none;
    }
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  
  button {
    flex: 1;
  }
`;

const ProductTabs = styled.div`
  margin-top: 40px;
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#4CAF50' : 'transparent'};
  color: ${props => props.active ? '#4CAF50' : '#666'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #4CAF50;
  }
`;

const TabContent = styled.div`
  line-height: 1.6;
`;

const RelatedProducts = styled.div`
  margin-top: 60px;
`;

const ReviewSection = styled.div`
  margin-top: 20px;
`;

const Review = styled.div`
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  
  .user {
    font-weight: 600;
  }
  
  .date {
    color: #999;
    font-size: 0.9rem;
  }
`;

const ReviewRating = styled.div`
  display: flex;
  margin-bottom: 10px;
  
  svg {
    color: #FFD700;
    margin-right: 2px;
  }
`;

const ReviewContent = styled.p`
  margin: 0;
  color: #666;
`;

const Accordion = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  overflow: hidden;
`;

const AccordionHeader = styled.div`
  padding: 15px;
  background-color: #f9f9f9;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
`;

const AccordionContent = styled.div`
  padding: ${props => props.open ? '15px' : '0 15px'};
  max-height: ${props => props.open ? '500px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 15px;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: #4CAF50;
  }
`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [expandedFaqs, setExpandedFaqs] = useState({});

  // State cho đánh giá
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: [0, 0, 0, 0, 0]
  });

  // State cho bộ lọc đánh giá
  const [reviewFilters, setReviewFilters] = useState({
    ratings: [],
    withImages: false,
    withVideos: false,
    verified: false,
    filterType: 'all',
    page: 1,
    limit: 5
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);

        // Log dữ liệu sản phẩm để kiểm tra
        console.log('ProductDetail: Dữ liệu sản phẩm từ API:', {
          id: data.id,
          name: data.name,
          original_price: data.original_price,
          price: data.price,
          originalPrice: data.originalPrice,
          discountPrice: data.discountPrice,
          category: data.category
        });

        // Đảm bảo thông tin danh mục đầy đủ
        if (data.category && (!data.category.category_id || !data.category.name)) {
          console.log('ProductDetail: Thông tin danh mục không đầy đủ, đang sửa lỗi', data.category);

          // Nếu không có name nhưng có category_id, thử lấy thông tin danh mục từ API
          if (data.category.category_id && !data.category.name) {
            try {
              // Đây là phần giả định, thay thế bằng logic thực tế của bạn để lấy tên danh mục
              data.category.name = 'Danh mục ' + data.category.category_id;
            } catch (err) {
              console.error('Lỗi khi lấy tên danh mục:', err);
            }
          }
        }

        setProduct(data);
        setActiveImage(0);

        try {
          console.log(`Đang lấy sản phẩm liên quan cho sản phẩm ID ${id}`);

          // Gọi API mới để lấy sản phẩm liên quan, chỉ cần truyền ID sản phẩm hiện tại
          const relatedProductsData = await productService.getRelatedProducts(id, 4);

          if (relatedProductsData && relatedProductsData.length > 0) {
            console.log(`Đã lấy thành công ${relatedProductsData.length} sản phẩm liên quan`);
            console.log('Thông tin sản phẩm liên quan:', relatedProductsData.map(p => ({
              id: p.id,
              name: p.name,
              image: p.image || '[Không có]',
              images: p.images || '[Không có]'
            })));
            setRelatedProducts(relatedProductsData);
          } else {
            console.log('Không tìm thấy sản phẩm liên quan');
            setRelatedProducts([]);
          }
        } catch (relatedError) {
          console.error('Lỗi khi lấy sản phẩm liên quan:', relatedError);
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin sản phẩm:', error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Lấy đánh giá khi cần
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id || activeTab !== 'reviews') return;

      try {
        setReviewsLoading(true);
        setReviewsError(null);

        // Chuẩn bị các tham số bộ lọc cho API
        const apiParams = {
          page: reviewFilters.page,
          limit: reviewFilters.limit
        };

        // Thêm bộ lọc rating nếu có
        if (reviewFilters.ratings.length > 0) {
          apiParams.ratings = reviewFilters.ratings.join(',');
        }

        // Thêm các bộ lọc khác nếu được chọn
        if (reviewFilters.withImages) {
          apiParams.has_images = true;
        }

        if (reviewFilters.withVideos) {
          apiParams.has_videos = true;
        }

        if (reviewFilters.verified) {
          apiParams.verified = true;
        }

        if (reviewFilters.filterType !== 'all') {
          apiParams.filter_type = reviewFilters.filterType;
        }

        const result = await productService.getProductReviews(id, apiParams);
        setReviews(result.reviews);
        setReviewStats({
          averageRating: result.averageRating,
          totalReviews: result.total,
          ratingCounts: result.ratingCounts
        });
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setReviewsError('Không thể tải đánh giá. Vui lòng thử lại sau.');
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id, activeTab, reviewFilters]);

  const handleFilterChange = (filters) => {
    setReviewFilters({
      ...reviewFilters,
      ...filters,
      page: 1 // Reset về trang đầu tiên khi thay đổi bộ lọc
    });
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Chuẩn bị trạng thái để khi quay lại trang danh mục
  const handleGoBack = () => {
    navigate(-1, {
      state: {
        fromProduct: true,
        isBack: true // Thêm cờ để đánh dấu đây là hành động quay lại
      }
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <p>Đang tải thông tin sản phẩm...</p>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <p>Không tìm thấy sản phẩm</p>
      </MainLayout>
    );
  }

  // Chuẩn bị mảng ảnh và loại bỏ các undefined hoặc null
  const productImages = product.images && product.images.length > 0
    ? product.images.filter(img => img)
    : [product.image].filter(img => img);

  // Tính tỉ lệ giảm giá dựa trên original_price và price từ API
  const hasOriginalPrice = product.originalPrice || product.original_price;
  const hasDiscountPrice = product.discountPrice || product.price;
  const originalPrice = product.originalPrice || product.original_price || 0;
  const discountPrice = product.price || 0;
  // console.log('ProductDetail: Thông tin giảm giá:', {
  //   hasOriginalPrice,
  //   hasDiscountPrice,
  //   originalPrice,
  //   discountPrice  
  // });

  // Sử dụng trường hasDiscount từ API nếu có, hoặc tự tính toán
  const hasDiscount = product.hasDiscount !== undefined ? product.hasDiscount :
    (hasOriginalPrice && hasDiscountPrice && originalPrice > discountPrice);

  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - hasDiscountPrice) / originalPrice) * 100)
    : 0;

  // Log để gỡ lỗi
  console.log('ProductDetail: Thông tin giảm giá:', {
    hasOriginalPrice,
    hasDiscountPrice,
    originalPrice,
    discountPrice,
    hasDiscount,
    discountPercentage,
    fromAPI_hasDiscount: product.hasDiscount
  });

  // Kiểm tra xem có ảnh không
  const hasImages = productImages && productImages.length > 0;

  return (
    <MainLayout>
      <ProductContainer>
        <BreadcrumbNav>
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/categories">Danh mục</Link></li>
            {product.category ? (
              <li>
                <Link
                  to={`/categories/${product.category.category_id || 'all'}`}
                >
                  {product.category.name || 'Tất cả sản phẩm'}
                </Link>
              </li>
            ) : null}
            <li><a href="#" onClick={(e) => { e.preventDefault(); handleGoBack(); }}>Quay lại</a></li>
          </ul>
        </BreadcrumbNav>

        <ProductDetailLayout>
          <ImageGallery>
            <Thumbnails>
              {hasImages && productImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} - thumbnail ${index + 1}`}
                  className={index === activeImage ? 'active' : ''}
                  onClick={() => setActiveImage(index)}
                />
              ))}
            </Thumbnails>
            <MainImage>
              {hasImages ? (
                <img
                  src={productImages[activeImage]}
                  alt={product.name}
                />
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #ddd', background: '#f9f9f9' }}>
                  <p>Không có hình ảnh</p>
                </div>
              )}
            </MainImage>
          </ImageGallery>

          <ProductInfo>
            <ProductTitle>{product.name}</ProductTitle>
            <ProductMeta inStock={product.inStock}>
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} color={i < Math.floor(product.rating) ? "#FFD700" : "#e4e5e9"} />
                ))}
                <span>({product.reviewCount})</span>
              </div>
              <span className="divider">|</span>
              <div className="stock">
                {product.inStock ? 'Còn hàng' : 'Hết hàng'}
              </div>
            </ProductMeta>

            <ProductPrice>
              <span className="current">{Math.round(hasDiscountPrice || originalPrice).toLocaleString()}đ/{product.unit || 'kg'}</span>
              {hasDiscount && (
                <>
                  <span className="original">{Math.round(originalPrice).toLocaleString()}đ</span>
                  <span className="discount">{discountPercentage}% GIẢM</span>
                </>
              )}
            </ProductPrice>

            <ProductDescription>
              {product.shortDescription}
            </ProductDescription>

            <QuantitySelector>
              <button onClick={decreaseQuantity}>
                <FaMinus />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
              />
              <button onClick={increaseQuantity}>
                <FaPlus />
              </button>
            </QuantitySelector>

            <ActionsRow>
              <Button
                variant="primary"
                size="large"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                <FaShoppingCart /> Thêm vào giỏ hàng
              </Button>
              <Button variant="outline">
                <FaHeart />
              </Button>
              <Button variant="outline">
                <FaShareAlt />
              </Button>
            </ActionsRow>

            {/* Product specifications */}
            <div>
              {product.specifications && product.specifications.map((spec, index) => (
                <Accordion key={index}>
                  <AccordionHeader onClick={() => toggleFaq(index)}>
                    {spec.name}
                    {expandedFaqs[index] ? <FaChevronUp /> : <FaChevronDown />}
                  </AccordionHeader>
                  <AccordionContent open={expandedFaqs[index]}>
                    {spec.value}
                  </AccordionContent>
                </Accordion>
              ))}
            </div>
          </ProductInfo>
        </ProductDetailLayout>

        <ProductTabs>
          <TabButtons>
            <TabButton
              active={activeTab === 'description'}
              onClick={() => setActiveTab('description')}
            >
              Mô tả
            </TabButton>
            <TabButton
              active={activeTab === 'reviews'}
              onClick={() => setActiveTab('reviews')}
            >
              Đánh giá ({product.reviewCount})
            </TabButton>
            <TabButton
              active={activeTab === 'shipping'}
              onClick={() => setActiveTab('shipping')}
            >
              Thông tin vận chuyển
            </TabButton>
          </TabButtons>

          <TabContent>
            {activeTab === 'description' && (
              <div>
                {product.description}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewSection>
                <ReviewFilter
                  averageRating={reviewStats.averageRating || product.rating}
                  totalReviews={reviewStats.totalReviews || product.reviewCount}
                  ratingCounts={reviewStats.ratingCounts}
                  onFilterChange={handleFilterChange}
                />

                {reviewsLoading ? (
                  <p>Đang tải đánh giá...</p>
                ) : reviewsError ? (
                  <p>{reviewsError}</p>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewItem
                      key={review.review_id}
                      review={review}
                      productId={product.id}
                    />
                  ))
                ) : (
                  <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                )}
              </ReviewSection>
            )}

            {activeTab === 'shipping' && (
              <div>
                <p>Thông tin vận chuyển cho sản phẩm này:</p>
                <ul>
                  <li>Miễn phí vận chuyển cho đơn hàng trên 200.000đ</li>
                  <li>Vận chuyển tiêu chuẩn: 2-3 ngày làm việc</li>
                  <li>Vận chuyển nhanh: 1 ngày làm việc (phí bổ sung)</li>
                  <li>Chấp nhận đổi trả trong vòng 30 ngày kể từ ngày mua</li>
                </ul>
              </div>
            )}
          </TabContent>
        </ProductTabs>

        <RelatedProducts>
          <SectionTitle>Sản phẩm liên quan</SectionTitle>
          {relatedProducts.length > 0 ? (
            <ProductGrid>
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>
          ) : (
            <p>Không có sản phẩm liên quan</p>
          )}
        </RelatedProducts>
      </ProductContainer>
    </MainLayout>
  );
};

export default ProductDetail;