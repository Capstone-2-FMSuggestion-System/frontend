// src/components/common/ProductCard/ProductCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaStar, FaShoppingCart, FaFire, FaCrown } from 'react-icons/fa';
import { useCart } from '../../../context/CartContext';

const Card = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  ${props => props.isFeatured && `
    border: 2px solid #FF6B6B;
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.2);
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #FF6B6B, #FF8E8E);
    }
  `}
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
    ${props => props.isFeatured && `
      box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
      transform: translateY(-8px);
    `}
  }
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  height: 200px;
  background: #f5f5f5;
  ${props => props.isFeatured && `
    height: 220px;
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 100%);
    }
  `}
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  .no-image {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
    font-size: 14px;
  }
`;

const HotBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 5px;
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 5px;
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 45px;
  left: 10px;
  background: linear-gradient(45deg, #4CAF50, #8BC34A);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
`;

const Content = styled.div`
  padding: 15px;
  ${props => props.isFeatured && `
    background: linear-gradient(to bottom, #fff, #fff5f5);
  `}
`;

const Title = styled.h3`
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  ${props => props.isFeatured && `
    color: #FF6B6B;
    font-weight: 600;
  `}
  
  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      color: #4CAF50;
    }
  }
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  
  svg {
    color: #FFD700;
    margin-right: 2px;
  }
  
  span {
    color: #666;
    font-size: 14px;
    margin-left: 5px;
  }
`;

const Price = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  .current {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }
  
  .original {
    margin-left: 10px;
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
  }
`;

const AddToCartButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #388E3C;
  }
`;

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Kiểm tra xem product có hợp lệ không
    if (!product || !product.id) {
      console.error('Invalid product data:', product);
      return;
    }

    // Log để debug
    console.log('Adding to cart:', {
      id: product.id,
      name: product.name,
      price: product.price
    });

    addToCart(product, 1);
  };

  // Hiển thị log cho debug
  console.log("ProductCard rendering for:", product.name, "with ID:", product.id);
  console.log("Image data:", { image: product.image, images: product.images });

  // Xác định giá hiển thị với kiểm tra null
  const currentPrice = product?.price || 0;
  const originalPrice = product?.original_price || 0;
  const discountPercentage = originalPrice > currentPrice && originalPrice > 0
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Lấy ảnh chính
  const productImage = product?.image || (product?.images && product.images.length > 0 ? product.images[0].image_url : 'https://via.placeholder.com/300x300?text=No+Image');

  return (
    <Card isFeatured={product?.is_featured}>
      <ImageContainer isFeatured={product?.is_featured}>
        <Link to={`/products/${product?.id}`}>
          {productImage ? (
            <img
              src={productImage}
              alt={product?.name || 'Sản phẩm'}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x300?text=Error+Loading';
              }}
            />
          ) : (
            <div className="no-image">Không có hình ảnh</div>
          )}
        </Link>
        {product?.is_featured && (
          <>
            <HotBadge>
              <FaFire /> HOT
            </HotBadge>
            <FeaturedBadge>
              <FaCrown /> Nổi bật
            </FeaturedBadge>
          </>
        )}
        {discountPercentage > 0 && (
          <DiscountBadge>{discountPercentage}% OFF</DiscountBadge>
        )}
      </ImageContainer>
      <Content isFeatured={product?.is_featured}>
        <Title isFeatured={product?.is_featured}>
          <Link to={`/products/${product?.id}`}>{product?.name || 'Sản phẩm'}</Link>
        </Title>
        <Rating>
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} color={i < Math.floor(product?.rating || 0) ? "#FFD700" : "#e4e5e9"} />
          ))}
          <span>({product?.reviewCount || 0})</span>
        </Rating>
        <Price>
          <span className="current">{currentPrice.toLocaleString('vi-VN')}đ/{product?.unit || 'kg'}</span>
          {originalPrice > currentPrice && originalPrice > 0 && (
            <span className="original">{originalPrice.toLocaleString('vi-VN')}đ</span>
          )}
        </Price>
        <AddToCartButton onClick={handleAddToCart}>
          <FaShoppingCart /> Thêm vào giỏ hàng
        </AddToCartButton>
      </Content>
    </Card>
  );
};

export default ProductCard;