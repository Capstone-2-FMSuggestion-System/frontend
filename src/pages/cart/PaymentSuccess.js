import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaCheckCircle, FaHome, FaListAlt, FaTag } from 'react-icons/fa';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button/Button';

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const SuccessIcon = styled.div`
  color: #4CAF50;
  font-size: 80px;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 15px;
  color: #333;
`;

const Message = styled.p`
  font-size: 16px;
  margin-bottom: 30px;
  color: #666;
  line-height: 1.6;
`;

const OrderInfo = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 30px;
  text-align: left;
`;

const OrderDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: ${props => props.total ? '10px 0 0 0' : '0'};
  border-top: ${props => props.total ? '1px dashed #ddd' : 'none'};
  font-weight: ${props => props.total ? '600' : 'normal'};
  
  span:first-child {
    color: #666;
  }
  
  span:last-child {
    font-weight: ${props => props.bold ? '600' : 'normal'};
    color: ${props => props.discount ? '#e53935' : 'inherit'};
  }
`;

const CouponTag = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 5px;
  
  svg {
    margin-right: 5px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const PaymentSuccess = () => {
  const location = useLocation();
  const order = location.state?.order || {};

  const getPaymentMethodText = (method) => {
    switch (method?.toLowerCase()) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'payos':
        return 'Thanh toán qua PayOS';
      default:
        return method || 'Thanh toán';
    }
  };

  // Format số tiền thành định dạng đẹp
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0đ';
    return `${Number(amount).toLocaleString('vi-VN')}đ`;
  };

  // Tính lại tổng tiền để đảm bảo đúng sau khi áp dụng giảm giá
  const calculateFinalTotal = () => {
    const subtotal = Number(order.subtotal) || 0;
    const discount = Number(order.discount_amount) || 0;
    
    // Đảm bảo tổng tiền không âm
    return Math.max(0, subtotal - discount);
  };

  // Xác định xem có phải giảm giá 100% hay không
  const isFullyDiscounted = () => {
    const subtotal = Number(order.subtotal) || 0;
    const discount = Number(order.discount_amount) || 0;
    
    // Kiểm tra nếu giảm giá chiếm ít nhất 99.9% giá trị
    return subtotal > 0 && (discount / subtotal >= 0.999);
  };

  // Sử dụng giá trị được tính toán lại để hiển thị
  const finalTotal = calculateFinalTotal();

  return (
    <MainLayout>
      <Container>
        <SuccessIcon>
          <FaCheckCircle />
        </SuccessIcon>

        <Title>Cảm ơn bạn đã đặt hàng!</Title>

        <Message>
          Đơn hàng của bạn đã được đặt thành công. Chúng tôi đã gửi email xác nhận với tất cả thông tin chi tiết.
          {isFullyDiscounted() ? ' Đơn hàng của bạn đã được giảm giá 100%.' : ' Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.'}
        </Message>

        <OrderInfo>
          <OrderDetail>
            <span>Mã đơn hàng:</span>
            <span>#{order.id || order.order_id || '12345678'}</span>
          </OrderDetail>

          <OrderDetail>
            <span>Ngày đặt:</span>
            <span>{new Date().toLocaleDateString('vi-VN')}</span>
          </OrderDetail>

          <OrderDetail>
            <span>Phương thức thanh toán:</span>
            <span>{getPaymentMethodText(order.paymentMethod || order.payment_method)}</span>
          </OrderDetail>

          {/* Luôn hiển thị thông tin chi tiết giá */}
          <OrderDetail>
            <span>Thành giá:</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </OrderDetail>
          
          {/* <OrderDetail discount={true}>
            <span>Giảm giá:</span>
            <span>-{formatCurrency(order.discount_amount)}</span>
          </OrderDetail> */}
          
          <OrderDetail total={true} bold={true}>
            <span>Tổng tiền:</span>
            <span>{formatCurrency(finalTotal)}</span>
          </OrderDetail>
          
          {order.coupon_code && (
            <div style={{ marginTop: '10px' }}>
              <span>Mã giảm giá đã dùng:</span>
              <br />
              <CouponTag>
                <FaTag /> {order.coupon_code}
              </CouponTag>
            </div>
          )}
        </OrderInfo>

        <ButtonGroup>
          <Button
            variant="primary"
            as={Link}
            to="/profile#orders"
            leftIcon={<FaListAlt />}
          >
            Xem đơn hàng của tôi
          </Button>

          <Button
            variant="outline"
            as={Link}
            to="/"
            leftIcon={<FaHome />}
          >
            Tiếp tục mua sắm
          </Button>
        </ButtonGroup>
      </Container>
    </MainLayout>
  );
};

export default PaymentSuccess;