// src/components/cart/CartItem/CartItem.js

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { CartContext } from "../../../context/CartContext";

// Styled Components – Giao diện nâng cấp
const Item = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const ImageContainer = styled.div`
  flex-shrink: 0;

  img {
    width: 110px;
    height: 110px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #eee;
  }
`;

const Details = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Name = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0;

  a {
    text-decoration: none;
    color: #222;
    transition: color 0.2s;

    &:hover {
      color: #2e7d32;
    }
  }
`;

const Variant = styled.p`
  font-size: 14px;
  color: #777;
`;

const Price = styled.div`
  font-size: 16px;
  color: #222;

  .original {
    margin-left: 8px;
    font-size: 14px;
    color: #aaa;
    text-decoration: line-through;
    font-weight: normal;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;

  button {
    width: 34px;
    height: 34px;
    background: #f9f9f9;
    border: none;
    font-size: 14px;
    cursor: pointer;
    color: #333;

    &:hover {
      background: #f0f0f0;
    }
  }

  input {
    width: 48px;
    height: 34px;
    border: none;
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
    text-align: center;
    font-size: 14px;

    &:focus {
      outline: none;
      background: #fcfcfc;
    }
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #e53935;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.2s;

  &:hover {
    color: #b71c1c;
  }
`;

const Subtotal = styled.div`
  text-align: right;
  font-weight: 600;
  font-size: 16px;
  color: #333;

  @media (max-width: 768px) {
    text-align: left;
    margin-top: 10px;
  }
`;

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useContext(CartContext);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateQuantity(item.id, value);
    }
  };

  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const increaseQuantity = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const subtotal = (item.discountPrice || item.price) * item.quantity;

  return (
    <Item>
      <ImageContainer>
        <Link to={`/products/${item.id}`}>
          <img src={item.image} alt={item.name} />
        </Link>
      </ImageContainer>

      <Details>
        <Name>
          <Link to={`/products/${item.id}`}>{item.name}</Link>
        </Name>
        {item.variant && <Variant>Mô tả: {item.variant}</Variant>}
        <Price>
          {item.discountPrice || item.price}đ
          {item.discountPrice && (
            <span className="original">{item.price}đ</span>
          )}
        </Price>

        <Actions>
          <QuantitySelector>
            <button onClick={decreaseQuantity}>
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
      </Details>

      <Subtotal>{subtotal.toLocaleString()}đ</Subtotal>
    </Item>
  );
};

export default CartItem;
