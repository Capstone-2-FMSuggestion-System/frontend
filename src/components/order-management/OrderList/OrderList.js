import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import OrderItem from '../OrderItem/OrderItem';
import Pagination from '../../common/Pagination/Pagination';
import orderService from '../../../services/orderService';

const OrderListContainer = styled.div`
  margin-bottom: 30px;
`;

const EmptyOrders = styled.div`
  text-align: center;
  padding: 40px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  svg {
    font-size: 48px;
    color: #ccc;
    margin-bottom: 20px;
  }
  
  h3 {
    margin: 0 0 10px;
    font-size: 18px;
    color: #333;
  }
  
  p {
    margin: 0 0 20px;
    color: #666;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #666;
  
  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
  
  animation: pulse 1.5s infinite ease-in-out;
`;

const OrderList = ({ orders: ordersProp, loading, currentPage, totalPages, onPageChange, emptyIcon }) => {
  const [orders, setOrders] = useState(ordersProp || []);

  useEffect(() => {
    setOrders(ordersProp || []);
  }, [ordersProp]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    try {
      await orderService.cancelOrder(orderId);
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'cancelled' } : order));
    } catch (err) {
      alert('Hủy đơn hàng thất bại!');
    }
  };

  const handleConfirmReceived = async (orderId) => {
    if (!window.confirm('Bạn xác nhận đã nhận được hàng?')) return;
    try {
      await orderService.updateOrderStatus(orderId, 'delivered');
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: 'delivered' } : order));
    } catch (err) {
      alert('Xác nhận nhận hàng thất bại!');
    }
  };

  if (loading) {
    return (
      <OrderListContainer>
        <LoadingContainer>
          <p>Đang tải đơn hàng...</p>
        </LoadingContainer>
      </OrderListContainer>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <OrderListContainer>
        <EmptyOrders>
          {emptyIcon}
          <h3>Không tìm thấy đơn hàng</h3>
          <p>Bạn chưa có đơn hàng nào.</p>
        </EmptyOrders>
      </OrderListContainer>
    );
  }

  return (
    <OrderListContainer>
      {orders.map(order => (
        <OrderItem key={order.id} order={order} onCancelOrder={handleCancelOrder} onConfirmReceived={handleConfirmReceived} />
      ))}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </OrderListContainer>
  );
};

export default OrderList;