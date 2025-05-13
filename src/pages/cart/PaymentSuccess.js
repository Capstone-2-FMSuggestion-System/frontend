import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaCheckCircle, FaHome, FaListAlt } from 'react-icons/fa';
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
`;

const OrderDetail = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  
  &:last-child {
    margin-bottom: 0;
    padding-top: 10px;
    border-top: 1px dashed #ddd;
    font-weight: 600;
  }
  
  span:first-child {
    color: #666;
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
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'payos':
        return 'Thanh toán qua PayOS';
      default:
        return 'Thanh toán';
    }
  };

  return (
    <MainLayout>
      <Container>
        <SuccessIcon>
          <FaCheckCircle />
        </SuccessIcon>

        <Title>Cảm ơn bạn đã đặt hàng!</Title>

        <Message>
          Đơn hàng của bạn đã được đặt thành công. Chúng tôi đã gửi email xác nhận với tất cả thông tin chi tiết.
          Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
        </Message>

        <OrderInfo>
          <OrderDetail>
            <span>Mã đơn hàng:</span>
            <span>#{order.id || '12345678'}</span>
          </OrderDetail>

          <OrderDetail>
            <span>Ngày đặt:</span>
            <span>{new Date().toLocaleDateString('vi-VN')}</span>
          </OrderDetail>

          <OrderDetail>
            <span>Phương thức thanh toán:</span>
            <span>{getPaymentMethodText(order.paymentMethod)}</span>
          </OrderDetail>

          <OrderDetail>
            <span>Tổng tiền:</span>
            <span>{order.total ? `${order.total.toLocaleString('vi-VN')}đ` : '0đ'}</span>
          </OrderDetail>
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