import React from 'react';
import styled from 'styled-components';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 8px 0;
  padding: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 10px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 1;
`;

const ProductListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const ProductListTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProductListTitle = styled.h4`
  margin: 0;
  color: #495057;
  font-size: 16px;
  font-weight: 600;
`;

const ProductCountBadge = styled.span`
  background: #28a745;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
`;

const ProductIcon = styled.span`
  font-size: 18px;
`;

const ProductGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
  position: relative;
  min-width: 180px;
  max-width: 180px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  }
`;

const AvailableBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #28a745;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 1;
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
  background-color: #f8f9fa;
`;

const ProductName = styled.h5`
  margin: 0 0 4px 0;
  font-size: 13px;
  font-weight: 600;
  color: #212529;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
`;

const CurrentPrice = styled.span`
  font-size: 13px;
  font-weight: bold;
  color: #dc3545;
`;

const OriginalPrice = styled.span`
  font-size: 11px;
  color: #6c757d;
  text-decoration: line-through;
`;

const DiscountBadge = styled.span`
  background: #dc3545;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 3px;
`;

const ProductDescription = styled.p`
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  position: relative;
  z-index: 50;
  pointer-events: auto;
`;

const AddToCartButton = styled.button`
  flex: 1;
  background: #39c0ed;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 100;
  pointer-events: auto;
  
  &:hover:not(:disabled) {
    background: #2a9dbd;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const RecommendationText = styled.div`
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 12px;
  font-style: italic;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
  padding: 20px;
`;

const StockInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
  font-size: 11px;
  color: ${props => props.inStock ? '#28a745' : '#dc3545'};
  font-weight: 600;
`;

const StockIcon = styled.span`
  font-size: 10px;
`;

const ViewDetailButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 100;
  pointer-events: auto;
  
  &:hover {
    background: #5a6268;
    transform: translateY(-1px);
  }
`;

const ProductList = ({ products, onViewDetail }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Debug logs
  // console.log('🔍 ProductList RENDERED với', products?.length || 0, 'sản phẩm');
  // console.log('🔍 ProductList Debug Info:', {
  //   apiUrl: process.env.REACT_APP_API_URL,
  //   hasUser: !!user,
  //   userToken: user?.token ? 'Present' : 'Missing',
  //   productsCount: products?.length || 0,
  //   environment: process.env.NODE_ENV
  // });

  // Debug cấu trúc sản phẩm
  // if (products && products.length > 0) {
  //   console.log('📦 Product Structure Debug:', {
  //     firstProduct: products[0],
  //     productKeys: Object.keys(products[0] || {}),
  //     hasId: 'id' in (products[0] || {}),
  //     hasProductId: 'product_id' in (products[0] || {}),
  //     idValue: products[0]?.id,
  //     productIdValue: products[0]?.product_id
  //   });
  // }

  const handleAddToCart = async (product) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      navigate('/login');
      return;
    }

    // Đảm bảo lấy đúng product_id
    const productId = product.product_id || product.id;
    
    if (!productId) {
      console.error('❌ Không tìm thấy product_id:', product);
      alert('Lỗi: Không tìm thấy ID sản phẩm');
      return;
    }

    // Lấy token từ authService thay vì user object
    const { accessToken } = await import('../../../services/authService').then(module => 
      module.default.tokenUtils.getTokens()
    );

    console.log('🛒 Thêm sản phẩm vào giỏ hàng:', {
      originalProduct: product,
      extractedProductId: productId,
      productName: product.name,
      apiUrl: `${process.env.REACT_APP_API_URL}/api/users/cart`,
      hasUserToken: !!user.token,
      hasAccessToken: !!accessToken,
      userObject: user,
      requestPayload: {
        product_id: productId,
        quantity: 1
      }
    });

    try {
      // Sử dụng token từ authService
      const tokenToUse = accessToken || user.token;
      
      if (!tokenToUse) {
        alert('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      // Gọi API backend để thêm vào giỏ hàng
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/cart`, {
        product_id: productId,
        quantity: 1
      }, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Response thêm vào giỏ hàng:', response.data);

      if (response.status === 200) {
        // Cập nhật state giỏ hàng trong context với product object đầy đủ
        await addToCart({
          id: productId,
          name: product.name,
          price: product.price,
          originalPrice: product.original_price,
          image: product.image,
          unit: product.unit || 'cái'
        }, 1);
        
        // Hiển thị thông báo thành công
        const notification = document.createElement('div');
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #28a745;
          color: white;
          padding: 12px 20px;
          border-radius: 6px;
          z-index: 10000;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = `✅ Đã thêm "${product.name}" vào giỏ hàng`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        requestData: {
          product_id: productId,
          quantity: 1
        }
      });
      
      let errorMessage = 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng';
      
      if (error.response) {
        console.log('Response error data:', error.response.data);
        switch (error.response.status) {
          case 401:
            errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
            navigate('/login');
            break;
          case 404:
            errorMessage = 'Không tìm thấy sản phẩm';
            break;
          case 400:
            errorMessage = error.response.data?.detail || error.response.data?.message || 'Dữ liệu không hợp lệ';
            break;
          default:
            errorMessage = `Có lỗi xảy ra (${error.response.status}): ${error.response.data?.detail || 'Vui lòng thử lại sau'}`;
        }
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      }
      
      alert(errorMessage);
    }
  };

  const handleViewDetail = async (product) => {
    // Debug product structure
    console.log('🔍 Product object for detail view:', product);
    console.log('🔍 Available keys:', Object.keys(product || {}));
    console.log('🔍 product.id:', product?.id);
    console.log('🔍 product.product_id:', product?.product_id);
    
    // Đảm bảo lấy đúng product_id
    const productId = product.product_id || product.id;
    
    if (!productId) {
      console.error('❌ Không tìm thấy product_id:', product);
      alert('Lỗi: Không tìm thấy ID sản phẩm');
      return;
    }

    console.log('👁️ Xem chi tiết sản phẩm:', {
      originalProduct: product,
      extractedProductId: productId,
      productName: product.name,
      apiUrl: `${process.env.REACT_APP_API_URL}/api/e-commerce/products/${productId}`
    });

    try {
      // Gọi API để lấy chi tiết sản phẩm
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/e-commerce/products/${productId}`);
      
      console.log('✅ Response chi tiết sản phẩm:', response.data);
      
      if (response.status === 200) {
        if (onViewDetail) {
          onViewDetail(response.data);
        } else {
          // Chuyển hướng đến trang chi tiết sản phẩm
          navigate(`/products/${productId}`, { state: { product: response.data } });
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy chi tiết sản phẩm:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        requestedProductId: productId
      });
      
      let errorMessage = 'Không thể xem chi tiết sản phẩm';
      
      if (error.response) {
        console.log('Response error data:', error.response.data);
        switch (error.response.status) {
          case 404:
            errorMessage = 'Không tìm thấy thông tin sản phẩm';
            break;
          default:
            errorMessage = `Có lỗi xảy ra (${error.response.status}): ${error.response.data?.detail || 'Vui lòng thử lại sau'}`;
        }
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      }
      
      alert(errorMessage);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  if (!products || products.length === 0) {
    return (
      <ProductListContainer>
        <ProductListHeader>
          <ProductListTitleContainer>
            <ProductIcon>🛒</ProductIcon>
            <ProductListTitle>Sản phẩm có sẵn</ProductListTitle>
          </ProductListTitleContainer>
        </ProductListHeader>
        <EmptyMessage>
          💡 Hiện tại không có sản phẩm nào có sẵn trong kho cho các nguyên liệu này.
          <br />
          Bạn có thể tìm kiếm sản phẩm tương tự hoặc liên hệ với chúng tôi để được hỗ trợ.
        </EmptyMessage>
      </ProductListContainer>
    );
  }

  return (
    <ProductListContainer className="product-list-container">
      <ProductListHeader>
        <ProductListTitleContainer>
          <ProductIcon>🛒</ProductIcon>
          <ProductListTitle>Sản phẩm có sẵn</ProductListTitle>
          <ProductCountBadge>{products.length}</ProductCountBadge>
        </ProductListTitleContainer>
      </ProductListHeader>
      
      <RecommendationText>
        Các sản phẩm có thể bạn quan tâm:
      </RecommendationText>
      
      <ProductGrid>
        {products.map((product) => {
          const discount = calculateDiscount(product.original_price, product.price);
          const isInStock = product.stock_quantity > 0;
          const productId = product.product_id || product.id;
          
          return (
            <ProductCard key={productId}>
              <AvailableBadge>Có sẵn</AvailableBadge>
              
              <ProductImage
                src={product.image || 'https://via.placeholder.com/200x120?text=Không+có+hình'}
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/200x120?text=Không+có+hình';
                }}
              />
              
              <ProductName title={product.name}>{product.name}</ProductName>
              
              <StockInfo inStock={isInStock}>
                <StockIcon>{isInStock ? '✅' : '❌'}</StockIcon>
                {isInStock 
                  ? `Còn ${product.stock_quantity} ${product.unit || 'sản phẩm'}`
                  : 'Tạm hết hàng'
                }
              </StockInfo>
              
              <ProductPrice>
                <CurrentPrice>{formatPrice(product.price)}</CurrentPrice>
                {discount > 0 && (
                  <>
                    <OriginalPrice>{formatPrice(product.original_price)}</OriginalPrice>
                    <DiscountBadge>-{discount}%</DiscountBadge>
                  </>
                )}
              </ProductPrice>
              
              {product.description && (
                <ProductDescription title={product.description}>
                  {product.description}
                </ProductDescription>
              )}
              
              <ProductActions>
                <AddToCartButton
                  onClick={(e) => {
                    console.log('🔥 AddToCartButton CLICKED!', product.name);
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  onMouseDown={(e) => {
                    console.log('🔥 AddToCartButton MOUSE DOWN!', product.name);
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    console.log('🔥 AddToCartButton TOUCH START!', product.name);
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  disabled={!isInStock || !user}
                  title={!user ? 'Vui lòng đăng nhập để thêm vào giỏ hàng' : 
                         !isInStock ? 'Sản phẩm tạm hết hàng' : 'Thêm vào giỏ hàng'}
                >
                  {!isInStock ? 'Hết hàng' : 
                   !user ? 'Đăng nhập' : 'Chọn sản phẩm'}
                </AddToCartButton>
                
                <ViewDetailButton 
                  onClick={(e) => {
                    console.log('🔥 ViewDetailButton CLICKED!', product.name);
                    e.preventDefault();
                    e.stopPropagation();
                    handleViewDetail(product);
                  }}
                  onMouseDown={(e) => {
                    console.log('🔥 ViewDetailButton MOUSE DOWN!', product.name);
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    console.log('🔥 ViewDetailButton TOUCH START!', product.name);
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  title="Xem chi tiết sản phẩm"
                >
                  Chi tiết
                </ViewDetailButton>
              </ProductActions>
            </ProductCard>
          );
        })}
      </ProductGrid>
    </ProductListContainer>
  );
};

export default ProductList; 