// src/components/cart/CartSummary/CartSummary.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaArrowRight } from "react-icons/fa";
import Button from "../../common/Button/Button";
import { CartContext } from "../../../context/CartContext";
import { AuthContext } from "../../../context/AuthContext";

const SummaryContainer = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SummaryTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;

  .label {
    color: #666;
  }

  .value {
    font-weight: ${(props) => (props.bold ? "600" : "400")};
    color: ${(props) => (props.bold ? "#333" : "#555")};
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #ddd;
  margin: 15px 0;
`;

const TotalRow = styled(SummaryRow)`
  font-size: 18px;
  .label,
  .value {
    font-weight: 600;
    color: #333;
  }
`;

const CouponForm = styled.div`
  margin-top: 20px;
`;

const CouponInput = styled.div`
  display: flex;
  justify-content: space-between;

  input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
    outline: none;
    font-size: 14px;

    &:focus {
      border-color: #4caf50;
    }
  }

  button {
    padding: 10px 15px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background-color: #388e3c;
    }
  }
`;

const CheckoutButton = styled(Button)`
  margin-top: 20px;
`;

const CartSummary = ({ onCheckout }) => {
  const [couponCode, setCouponCode] = useState("");
  const { cart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    // Apply coupon logic would go here
    alert(`Coupon code "${couponCode}" applied!`);
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      if (onCheckout) {
        onCheckout();
      } else {
        navigate("/checkout");
      }
    } else {
      navigate("/login", { state: { from: "/checkout" } });
    }
  };

  // Calculate summary values
  const subtotal = cart.totalAmount;
  const shipping = subtotal > 200000 ? 0 : 20000;
  const discount = 0; // This would be calculated based on applied coupons
  const total = subtotal + shipping - discount;

  return (
    <SummaryContainer>
      <SummaryTitle>Tổng kết hoá đơn</SummaryTitle>

      <SummaryRow>
        <span className="label">Thành giá</span>
        <span className="value">{subtotal}đ</span>
      </SummaryRow>

      <SummaryRow>
        <span className="label">Giảm giá</span>
        <span className="value">-{discount}đ</span>
      </SummaryRow>

      <SummaryRow>
        <span className="label">Shipping</span>
        <span className="value">
          {shipping === 0 ? "Miễn phí" : `${shipping}đ`}
        </span>
      </SummaryRow>

      <Divider />

      <TotalRow bold>
        <span className="label">TỔNG</span>
        <span className="value">{total}đ</span>
      </TotalRow>

      <CouponForm>
        <CouponInput>
          <input
            type="text"
            placeholder="Coupon Code"
            value={couponCode}
            onChange={handleCouponChange}
          />
          <button onClick={handleApplyCoupon}>Áp dụng</button>
        </CouponInput>
      </CouponForm>

      <CheckoutButton
        variant="secondary"
        size="large"
        fullWidth
        onClick={handleCheckout}
      >
        Hoàn tất thanh toán <FaArrowRight />
      </CheckoutButton>
    </SummaryContainer>
  );
};

export default CartSummary;
