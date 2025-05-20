import React, { useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingCart, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import MainLayout from '../../layouts/MainLayout';
import CartItem from '../../components/cart/CartItem/CartItem';
import CartSummary from '../../components/cart/CartSummary/CartSummary';
import Button from '../../components/common/Button/Button';
import { CartContext } from '../../context/CartContext';
import { toast } from 'react-hot-toast';

const CartContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h1 {
    margin: 0;
    font-size: 24px;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 10px;
    }
  }
`;

const ContinueShopping = styled(Link)`
  display: flex;
  align-items: center;
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const CartContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CartItems = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 40px 20px;
  
  svg {
    font-size: 40px;
    color: #ccc;
    margin-bottom: 20px;
  }
  
  h2 {
    margin: 0 0 15px;
    font-size: 20px;
    color: #333;
  }
  
  p {
    margin: 0 0 20px;
    color: #666;
  }
`;

const AlertMessage = styled.div`
  display: flex;
  align-items: flex-start;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 4px;
  padding: 12px 15px;
  margin-bottom: 20px;
  
  svg {
    margin-right: 10px;
    margin-top: 3px;
    flex-shrink: 0;
  }
  
  p {
    margin: 0;
  }
`;

const Cart = () => {
  const { cart, clearCart } = useContext(CartContext);
  const location = useLocation();
  
  // Check if we have payment status information from redirect
  useEffect(() => {
    if (location.state?.paymentCancelled) {
      toast.error(location.state.message || 'Bạn đã hủy thanh toán');
    } else if (location.state?.paymentFailed) {
      toast.error(location.state.message || 'Thanh toán không thành công');
    }
  }, [location.state]);
  
  const isCartEmpty = cart.items.length === 0;
  
  return (
    <MainLayout>
      <CartContainer>
        <CartHeader>
          <h1>
            <FaShoppingCart /> Giỏ hàng ({cart.items.length})
          </h1>
          <ContinueShopping to="/">
            <FaArrowLeft /> Tiếp tục mua sắm
          </ContinueShopping>
        </CartHeader>
        
        {location.state?.paymentCancelled && (
          <AlertMessage>
            <FaExclamationTriangle />
            <p>{location.state.message || 'Bạn đã hủy thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'}</p>
          </AlertMessage>
        )}
        
        {location.state?.paymentFailed && (
          <AlertMessage>
            <FaExclamationTriangle />
            <p>{location.state.message || 'Thanh toán không thành công. Vui lòng thử lại sau.'}</p>
          </AlertMessage>
        )}
        
        <CartContent>
          <CartItems>
            {isCartEmpty ? (
              <EmptyCart>
                <FaShoppingCart />
                <h2>Giỏ hàng của bạn đang trống</h2>
                <p>Thêm sản phẩm vào giỏ hàng để tiến hành thanh toán.</p>
                <Button variant="primary" as={Link} to="/">
                  Mua ngay
                </Button>
              </EmptyCart>
            ) : (
              <>
                {cart.items.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </>
            )}
          </CartItems>
          
          {!isCartEmpty && (
            <CartSummary />
          )}
        </CartContent>
      </CartContainer>
    </MainLayout>
  );
};

export default Cart;