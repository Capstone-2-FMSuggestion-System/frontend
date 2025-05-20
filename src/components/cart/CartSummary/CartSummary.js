// src/components/cart/CartSummary/CartSummary.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowRight, FaCheck, FaTimes } from 'react-icons/fa';
import Button from '../../common/Button/Button';
import { CartContext } from '../../../context/CartContext';
import { AuthContext } from '../../../context/AuthContext';
import orderService from '../../../services/orderService';
import { API_URL } from '../../../config';

const SummaryContainer = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
`;

const SummaryTitle = styled.h2`
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  
  .label {
    color: #666;
  }
  
  .value {
    font-weight: ${props => props.bold ? '600' : '400'};
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #ddd;
  margin: 15px 0;
`;

const TotalRow = styled(SummaryRow)`
  font-size: 18px;
  .label, .value {
    font-weight: 600;
    color: #333;
  }
`;

const CouponForm = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const CouponInput = styled.div`
  display: flex;
  
  input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
    outline: none;
    
    &:focus {
      border-color: #4CAF50;
    }
  }
  
  button {
    padding: 10px 15px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    
    &:hover {
      background-color: #388E3C;
    }
  }
`;

const CheckoutButton = styled(Button)`
  margin-top: 20px;
`;

const CouponMessage = styled.div`
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  
  &.success {
    background-color: #e8f5e9;
    color: #2e7d32;
  }
  
  &.error {
    background-color: #ffebee;
    color: #c62828;
  }
  
  svg {
    margin-right: 6px;
  }
`;

const CartSummary = ({ onCheckout }) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [couponStatus, setCouponStatus] = useState(''); // 'success', 'error', or ''
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isApplying, setIsApplying] = useState(false);
  const { cart, updateCartDiscountInfo } = useContext(CartContext);
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isCheckoutPage = location.pathname === '/checkout';
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    total: 0,
    coupon_applied: false,
    coupon_code: null
  });
  
  useEffect(() => {
    // Tính toán tổng kết hóa đơn khi giỏ hàng thay đổi hoặc mã giảm giá thay đổi
    if (isAuthenticated && cart.items.length > 0) {
      const fetchCartSummary = async () => {
        try {
          // Nếu có mã giảm giá và đã xác nhận hợp lệ, gọi API để lấy tổng kết với mã giảm giá
          if (couponStatus === 'success' && couponCode) {
            const summary = await orderService.getCartSummary(couponCode);
            setOrderSummary(summary);
          } else {
            // Nếu không có mã giảm giá, tính toán tổng kết dựa trên giỏ hàng
            setOrderSummary({
              subtotal: Number(cart.totalAmount) || 0,
              discount: 0,
              total: Number(cart.totalAmount) || 0,
              coupon_applied: false,
              coupon_code: null
            });
          }
        } catch (error) {
          console.error('Error fetching cart summary:', error);
          // Trong trường hợp lỗi, vẫn cập nhật giá trị mặc định
          setOrderSummary({
            subtotal: Number(cart.totalAmount) || 0,
            discount: 0,
            total: Number(cart.totalAmount) || 0,
            coupon_applied: false,
            coupon_code: null
          });
        }
      };
      
      fetchCartSummary();
    } else {
      // Nếu không đăng nhập hoặc giỏ hàng trống, tính toán cơ bản
      const subtotal = Number(cart.totalAmount) || 0;
      const discount = Number((subtotal * discountPercent) / 100) || 0;
      const total = Math.max(0, subtotal - discount);
      
      setOrderSummary({
        subtotal: subtotal,
        discount: discount,
        total: total,
        coupon_applied: !!couponCode && couponStatus === 'success',
        coupon_code: couponStatus === 'success' ? couponCode : null
      });
    }
  }, [cart.totalAmount, couponCode, discountPercent, couponStatus, isAuthenticated, cart.items.length]);
  
  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
  };
  
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      setCouponMessage('Vui lòng nhập mã giảm giá');
      setCouponStatus('error');
      return;
    }
    
    try {
      setIsApplying(true);
      setCouponMessage('Đang kiểm tra mã giảm giá...');
      
      // Gọi API validate coupon thông qua endpoint
      const response = await fetch(`${API_URL}/api/e-commerce/coupons/${couponCode}/validate`);
      const data = await response.json();
      
      if (data.valid) {
        // Coupon hợp lệ
        setCouponStatus('success');
        setCouponMessage(`Áp dụng thành công: Giảm ${data.discount}%`);
        setDiscountPercent(data.discount);
        
        // Tính toán giá trị giảm giá từ tỷ lệ phần trăm API trả về
        const subtotal = Number(cart.totalAmount) || 0;
        const discountAmount = (subtotal * data.discount) / 100;
        
        // Tính toán tổng tiền sau khi giảm giá
        const discountedTotal = Math.max(0, subtotal - discountAmount);
        
        console.log('Áp dụng giảm giá:', {
          subtotal,
          discountPercent: data.discount,
          discountAmount,
          discountedTotal,
          couponCode
        });
        
        // Cập nhật thông tin giảm giá trong CartContext
        updateCartDiscountInfo(discountAmount, couponCode);
        
        // Cập nhật orderSummary với mã giảm giá mới
        if (isAuthenticated && cart.items.length > 0) {
          try {
            const summary = await orderService.getCartSummary(couponCode);
            setOrderSummary(summary);
          } catch (err) {
            console.error('Failed to get cart summary from server, using local calculation', err);
            setOrderSummary({
              subtotal: subtotal,
              discount: discountAmount,
              total: discountedTotal,
              coupon_applied: true,
              coupon_code: couponCode
            });
          }
        } else {
          // Cập nhật orderSummary với tính toán local
          setOrderSummary({
            subtotal: subtotal,
            discount: discountAmount,
            total: discountedTotal,
            coupon_applied: true,
            coupon_code: couponCode
          });
        }
      } else {
        // Coupon không hợp lệ
        setCouponStatus('error');
        setCouponMessage(data.message || 'Mã giảm giá không hợp lệ');
        setDiscountPercent(0);
        
        // Reset thông tin giảm giá
        updateCartDiscountInfo(0, null);
      }
    } catch (error) {
      setCouponStatus('error');
      setCouponMessage('Không thể áp dụng mã giảm giá. Vui lòng thử lại sau.');
      console.error('Apply coupon error:', error);
      setDiscountPercent(0);
      
      // Reset thông tin giảm giá
      updateCartDiscountInfo(0, null);
    } finally {
      setIsApplying(false);
    }
  };
  
  const handleCheckout = () => {
    if (isCheckoutPage) {
      // Tìm form gần nhất và kích hoạt submit
      try {
        // Cố gắng tìm form trong phạm vi đầu tiên (thường gần nhất)
        const checkoutForm = document.querySelector('form[class*="checkout"]') || 
                            document.querySelector('form');
        
        if (checkoutForm) {
          console.log('Tìm thấy form checkout, đang submit...');
          checkoutForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        } else {
          console.error('Không tìm thấy form checkout để submit');
        }
      } catch (error) {
        console.error('Lỗi khi cố gắng submit form checkout:', error);
      }
    } else if (isAuthenticated) {
      if (onCheckout) {
        onCheckout(orderSummary);
      } else {
        // Lưu thông tin orderSummary khi chuyển đến trang checkout
        navigate('/checkout', { 
          state: { 
            orderSummary,
            couponCode: couponStatus === 'success' ? couponCode : null,
            discountPercent
          }
        });
      }
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };
  
  const formatCurrency = (value) => {
    // Đảm bảo value là số hợp lệ
    const numValue = Number(value);
    if (isNaN(numValue)) return "0₫";
    return numValue.toLocaleString('vi-VN') + "₫";
  };
  
  return (
    <SummaryContainer>
      <SummaryTitle>Tổng kết hoá đơn</SummaryTitle>
      
      <SummaryRow>
        <span className="label">Thành giá</span>
        <span className="value">{formatCurrency(orderSummary.subtotal)}</span>
      </SummaryRow>
      
      <SummaryRow>
        <span className="label">Giảm giá</span>
        <span className="value">-{formatCurrency(orderSummary.discount)}</span>
      </SummaryRow>
      
      <Divider />
      
      <TotalRow bold>
        <span className="label">TỔNG</span>
        <span className="value">{formatCurrency(orderSummary.total)}</span>
      </TotalRow>
      
      <CouponForm>
        <CouponInput>
          <input
            type="text"
            placeholder="Mã giảm giá"
            value={couponCode}
            onChange={handleCouponChange}
            disabled={isApplying}
          />
          <button onClick={handleApplyCoupon} disabled={isApplying}>
            {isApplying ? 'Đang áp dụng...' : 'Áp dụng'}
          </button>
        </CouponInput>
        
        {couponMessage && (
          <CouponMessage className={couponStatus}>
            {couponStatus === 'success' ? <FaCheck /> : couponStatus === 'error' ? <FaTimes /> : null}
            {couponMessage}
          </CouponMessage>
        )}
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
