import React from 'react';
import styled from 'styled-components';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';

const ProductListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 10px 0;
  padding: 15px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  position: relative;
  max-width: 320px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: #f8f9fa;
`;

const ProductName = styled.h5`
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 600;
  color: #212529;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const CurrentPrice = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: #dc3545;
`;

const OriginalPrice = styled.span`
  font-size: 12px;
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
  gap: 8px;
  align-items: center;
`;

const AddToCartButton = styled.button`
  flex: 1;
  background: #39c0ed;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
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

const ViewDetailButton = styled.button`
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #007bff;
    color: white;
  }
`;

const StockInfo = styled.div`
  font-size: 11px;
  color: ${props => props.inStock ? '#28a745' : '#dc3545'};
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StockIcon = styled.span`
  font-size: 10px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 2px dashed #dee2e6;
`;

const RecommendationText = styled.p`
  color: #495057;
  font-size: 14px;
  margin: 0 0 15px 0;
  padding: 12px;
  background: rgba(57, 192, 237, 0.1);
  border-radius: 8px;
  border-left: 4px solid #39c0ed;
`;

const ProductList = ({ products, onViewDetail }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (product) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    try {
      await addToCart({
        product_id: product.id,
        quantity: 1
      });
      
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
      
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
    }
  };

  const handleViewDetail = (product) => {
    if (onViewDetail) {
      onViewDetail(product);
    } else {
      // Sử dụng route frontend để mở trang chi tiết sản phẩm
      // Frontend sẽ gọi API backend thông qua productService.getProductById()
      window.open(`/products/${product.id}`, '_blank');
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
    <ProductListContainer>
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
          
          return (
            <ProductCard key={product.id}>
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
                  onClick={() => handleAddToCart(product)}
                  disabled={!isInStock || !user}
                  title={!user ? 'Vui lòng đăng nhập để thêm vào giỏ hàng' : 
                         !isInStock ? 'Sản phẩm tạm hết hàng' : 'Thêm vào giỏ hàng'}
                >
                  {!isInStock ? 'Hết hàng' : 
                   !user ? 'Đăng nhập' : 'Chọn sản phẩm'}
                </AddToCartButton>
                
                <ViewDetailButton 
                  onClick={() => handleViewDetail(product)}
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