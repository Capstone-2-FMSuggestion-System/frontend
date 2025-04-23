// src/components/common/ProductCard/ProductCard.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { CartContext } from '../../../context/CartContext';

const Card = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  height: 200px;
  background: #f5f5f5;
  
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

const DiscountBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #FF8C00;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
`;

const Content = styled.div`
  padding: 15px;
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
  const { addToCart } = useContext(CartContext);
  
  const handleAddToCart = () => {
    addToCart(product, 1);
  };
  
  // Hiển thị log cho debug
  console.log("ProductCard rendering for:", product.name, "with ID:", product.product_id);
  console.log("Image data:", { image: product.image, images: product.images });
  
  // Xác định giá hiển thị
  const currentPrice = product.price;
  const originalPrice = product.original_price;
  const discountPercentage = originalPrice > currentPrice 
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;
  
  // Lấy ảnh chính
  const productImage = product.image || (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300x300?text=No+Image');
  
  return (
    <Card>
      <ImageContainer>
        <img 
          src={productImage} 
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x300?text=Error+Loading';
          }}
        />
        {discountPercentage > 0 && (
          <DiscountBadge>{discountPercentage}% OFF</DiscountBadge>
        )}
      </ImageContainer>
      <Content>
        <Title>
          <Link to={`/products/${product.product_id}`}>{product.name}</Link>
        </Title>
        <Rating>
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} color={i < 4 ? "#FFD700" : "#e4e5e9"} />
          ))}
          <span>(0)</span>
        </Rating>
        <Price>
          <span className="current">{Math.round(currentPrice).toLocaleString()}đ/{product.unit || 'kg'}</span>
          {originalPrice > currentPrice && (
            <span className="original">{Math.round(originalPrice).toLocaleString()}đ</span>
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