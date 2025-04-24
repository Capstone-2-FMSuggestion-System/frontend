// src/components/cart/CartItem/CartItem.js
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { CartContext } from '../../../context/CartContext';

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const ImageContainer = styled.div`
  flex: 0 0 100px;
  margin-right: 20px;
  
  img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 4px;
  }
`;

const Details = styled.div`
  flex: 1;
`;

const Name = styled.h3`
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 500;
  
  a {
    color: #333;
    text-decoration: none;
    
    &:hover {
      color: #4CAF50;
    }
  }
`;

const Variant = styled.p`
  margin: 0 0 10px;
  font-size: 14px;
  color: #666;
`;


const Price = styled.div`
  font-weight: 600;
  
  .original {
    margin-left: 8px;
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
    font-weight: normal;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  
  @media (max-width: 768px) {
    margin-left: auto;
    margin-top: 0;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
  
  button {
    width: 30px;
    height: 30px;
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
    width: 40px;
    height: 30px;
    text-align: center;
    border: 1px solid #ddd;
    border-left: none;
    border-right: none;
    
    &:focus {
      outline: none;
    }
  }
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  
  &:hover {
    color: #b71c1c;
  }
`;

const Subtotal = styled.div`
  margin-left: auto;
  text-align: right;
  font-weight: 600;
  font-size: 16px;
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    text-align: right;
    margin-top: 10px;
  }
`;

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useContext(CartContext);

  // Log để debug
  console.log('Rendering cart item:', {
    id: item.id,
    cart_item_id: item.cart_item_id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    description: item.description
  });

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 99) {
      const itemId = item.cart_item_id || item.id;
      updateQuantity(itemId, value);
    } else if (value < 1) {
      const itemId = item.cart_item_id || item.id;
      updateQuantity(itemId, 1);
    } else if (value > 99) {
      const itemId = item.cart_item_id || item.id;
      updateQuantity(itemId, 99);
    }
  };

  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      const itemId = item.cart_item_id || item.id;
      updateQuantity(itemId, item.quantity - 1);
    }
  };

  const increaseQuantity = () => {
    const itemId = item.cart_item_id || item.id;
    updateQuantity(itemId, item.quantity + 1);
  };

  const handleRemove = () => {
    const itemId = item.cart_item_id || item.id;
    removeFromCart(itemId);
  };

  // Tính toán giá và tổng tiền
  const price = item.price || 0;
  const originalPrice = item.originalPrice || price;
  const subtotal = price * item.quantity;
  const unit = item.unit || 'kg';

  // Format giá tiền
  const formatPrice = (value) => {
    if (!value && value !== 0) return '0đ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <Item>
      <ImageContainer>
        <Link to={`/products/${item.id}`}>
          <img src={item.image || 'https://via.placeholder.com/100x100?text=No+Image'} alt={item.name} />
        </Link>
      </ImageContainer>

      <Details>
        <Name>
          <Link to={`/products/${item.id}`}>{item.name}</Link>
        </Name>
        <Variant>Đơn vị: {unit}</Variant>
        <Price>
          {formatPrice(price)}
          {originalPrice > price && (
            <span className="original">{formatPrice(originalPrice)}</span>
          )}
        </Price>
      </Details>

      <Actions>
        <QuantitySelector>
          <button onClick={decreaseQuantity} disabled={item.quantity <= 1}>
            <FaMinus />
          </button>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={handleQuantityChange}
          />
          <button onClick={increaseQuantity}>
            <FaPlus />
          </button>
        </QuantitySelector>
        <RemoveButton onClick={handleRemove}>
          <FaTrash />
        </RemoveButton>
      </Actions>

      <Subtotal>
        {formatPrice(subtotal)}
      </Subtotal>
    </Item>
  );
};

export default CartItem;