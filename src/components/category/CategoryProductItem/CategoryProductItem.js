// src/components/category/CategoryProductItem/CategoryProductItem.js
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaStar, FaShoppingCart, FaHeart, FaEye } from 'react-icons/fa';
import { useCart } from '../../../context/CartContext';

const Card = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  position: relative;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
    
    .quick-actions {
      opacity: 1;
      transform: translateY(0);
    }
    
    .image-container img {
      transform: scale(1.05);
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  height: 200px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #FF8C00;
  color: white;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  z-index: 2;
`;

const QuickActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
  z-index: 2;
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #4CAF50;
    color: white;
    border-color: #4CAF50;
  }
`;

const WishlistButton = styled(ActionButton)`
  color: ${props => props.active ? '#FF8C00' : '#555'};
  border-color: ${props => props.active ? '#FF8C00' : '#ddd'};
  
  &:hover {
    background: #FF8C00;
    color: white;
    border-color: #FF8C00;
  }
`;

const Content = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
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
    font-size: 14px;
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
  margin-top: auto;
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

const CategoryProductItem = ({ product }) => {
  const [inWishlist, setInWishlist] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    console.log('ProductID trong CategoryProductItem:', product?.id);
    console.log('Sản phẩm đầy đủ:', product);
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const toggleWishlist = () => {
    setInWishlist(!inWishlist);
    // Here you would typically call an API to update the user's wishlist
  };

  // Tính toán giá và phần trăm giảm giá tương tự như trong ProductDetail.js
  const hasOriginalPrice = product.originalPrice || product.original_price;
  const hasDiscountPrice = product.discountPrice || product.price;
  const originalPriceValue = product.originalPrice || product.original_price || 0;
  const displayPrice = product.discountPrice || product.price || 0;

  // Kiểm tra và tính toán phần trăm giảm giá
  const hasDiscount = product.hasDiscount !== undefined ? product.hasDiscount :
    (hasOriginalPrice && hasDiscountPrice && originalPriceValue > displayPrice);
  const discountPercentage = hasDiscount
    ? Math.round(((originalPriceValue - hasDiscountPrice) / originalPriceValue) * 100)
    : 0;

  console.log('CategoryProductItem: Thông tin giảm giá:', {
    hasOriginalPrice,
    hasDiscountPrice,
    originalPriceValue,
    displayPrice,
    hasDiscount,
    discountPercentage
  });

  const productId = product?.id || 'undefined-id';

  return (
    <Card>
      <ImageContainer className="image-container">
        <Link to={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
          />
        </Link>
        {hasDiscount && discountPercentage > 0 && (
          <DiscountBadge>{discountPercentage}% GIẢM</DiscountBadge>
        )}
        <QuickActions className="quick-actions">
          <WishlistButton
            active={inWishlist ? 1 : 0}
            onClick={toggleWishlist}
            title={inWishlist ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
          >
            <FaHeart />
          </WishlistButton>
          <ActionButton
            onClick={handleAddToCart}
            title="Thêm vào giỏ hàng"
          >
            <FaShoppingCart />
          </ActionButton>
          <ActionButton
            as={Link}
            to={`/products/${product.id}`}
            title="Xem chi tiết"
          >
            <FaEye />
          </ActionButton>
        </QuickActions>
      </ImageContainer>

      <Content>
        <Title>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </Title>

        <Rating>
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} color={i < Math.floor(product.rating) ? "#FFD700" : "#e4e5e9"} />
          ))}
          <span>({product.reviewCount})</span>
        </Rating>

        <Price>
          <span className="current">{Math.round(displayPrice).toLocaleString()}đ/{product.unit || 'kg'}</span>
          {hasDiscount && discountPercentage > 0 && (
            <span className="original">{Math.round(originalPriceValue).toLocaleString()}đ</span>
          )}
        </Price>

        <AddToCartButton onClick={handleAddToCart}>
          <FaShoppingCart /> Thêm vào giỏ hàng
        </AddToCartButton>
      </Content>
    </Card>
  );
};

export default CategoryProductItem;