import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaArrowLeft, FaBox, FaMapMarkerAlt, FaTruck, FaFileInvoice, FaDownload } from 'react-icons/fa';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button/Button';
import orderService from '../../services/orderService';
import OrderStatus from '../../components/order-management/OrderStatus/OrderStatus';
import OrderProductItem from '../../components/order-management/OrderProductItem/OrderProductItem';
import OrderSummary from '../../components/order-management/OrderSummary/OrderSummary';

const OrderDetailContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
  animation: fadeIn 0.5s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const OrderDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h1 {
    margin: 0;
    font-size: 24px;
  }
`;

const BackButton = styled(Link)`
  display: flex;
  align-items: center;
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  
  svg {
    margin-right: 8px;
    transition: transform 0.2s ease;
  }
  
  &:hover {
    text-decoration: underline;
    
    svg {
      transform: translateX(-3px);
    }
  }
`;

const CardContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  background: #f5f5f5;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  
  h2 {
    margin: 0;
    font-size: 18px;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 10px;
      color: #4CAF50;
    }
  }
`;

const CardBody = styled.div`
  padding: 20px;
`;

const OrderInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  h3 {
    font-size: 16px;
    margin: 0 0 10px;
    color: #666;
  }
  
  p {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
`;

const OrderStatusContainer = styled.div`
  margin-bottom: 30px;
`;

const OrderItems = styled.div`
  margin-top: 20px;
`;

const ItemTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: #f9f9f9;
    font-weight: 600;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  
  button {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
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

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #F44336;
  font-size: 18px;
`;

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(id);
        console.log('Order details fetched:', data);
        setOrder(data);
        setError(null);
      } catch (err) {
        setError('Failed to load order details. Please try again.');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Chưa cập nhật';
    }
  };

  const formatPaymentMethod = (method) => {
    if (!method) return 'Chưa cập nhật';
    const methods = {
      'cod': 'Thanh toán khi nhận hàng',
      'bank': 'Chuyển khoản ngân hàng',
      'momo': 'Ví MoMo',
      'zalopay': 'Ví ZaloPay',
      'vnpay': 'VNPay'
    };
    return methods[method.toLowerCase()] || method;
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancelOrder(id);
        // Refresh order data
        const updatedOrder = await orderService.getOrderById(id);
        setOrder(updatedOrder);
      } catch (err) {
        setError('Failed to cancel order. Please try again.');
        console.error('Error cancelling order:', err);
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <OrderDetailContainer>
          <LoadingSpinner>Đang tải thông tin đơn hàng...</LoadingSpinner>
        </OrderDetailContainer>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <OrderDetailContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <BackButton to="/orders">
              <FaArrowLeft /> Quay lại danh sách đơn hàng
            </BackButton>
          </div>
        </OrderDetailContainer>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <OrderDetailContainer>
          <ErrorMessage>Không tìm thấy đơn hàng</ErrorMessage>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <BackButton to="/orders">
              <FaArrowLeft /> Quay lại danh sách đơn hàng
            </BackButton>
          </div>
        </OrderDetailContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <OrderDetailContainer>
        <OrderDetailHeader>
          <h1>Đơn hàng #{order.orderNumber || order.id}</h1>
          <BackButton to="/orders">
            <FaArrowLeft /> Quay lại danh sách đơn hàng
          </BackButton>
        </OrderDetailHeader>

        <CardContainer>
          <CardHeader>
            <h2><FaBox /> Thông tin đơn hàng</h2>
          </CardHeader>
          <CardBody>
            <OrderStatusContainer>
              <OrderStatus status={order.status?.toLowerCase() || 'pending'} showTracker={true} />
            </OrderStatusContainer>

            <OrderInfo>
              <InfoItem>
                <h3>Ngày đặt hàng</h3>
                <p>{formatDate(order.createdAt)}</p>
              </InfoItem>
              <InfoItem>
                <h3>Phương thức thanh toán</h3>
                <p>{formatPaymentMethod(order.paymentMethod)}</p>
              </InfoItem>
              {order.estimatedDelivery && (
                <InfoItem>
                  <h3>Dự kiến giao hàng</h3>
                  <p>{formatDate(order.estimatedDelivery)}</p>
                </InfoItem>
              )}
            </OrderInfo>
          </CardBody>
        </CardContainer>

        <CardContainer>
          <CardHeader>
            <h2><FaMapMarkerAlt /> Thông tin giao hàng</h2>
          </CardHeader>
          <CardBody>
            <OrderInfo>
              {order.shippingAddress && typeof order.shippingAddress === 'object' ? (
                <>
                  <InfoItem>
                    <h3>Người nhận</h3>
                    <p>{order.shippingAddress.name ?? 'Chưa cập nhật'}</p>
                  </InfoItem>
                  <InfoItem>
                    <h3>Số điện thoại</h3>
                    <p>{order.shippingAddress.phone ?? 'Chưa cập nhật'}</p>
                  </InfoItem>
                  <InfoItem>
                    <h3>Địa chỉ</h3>
                    <p>
                      {order.shippingAddress.address ?? 'Chưa cập nhật'}, {order.shippingAddress.city ?? ''}, {order.shippingAddress.province ?? ''}, {order.shippingAddress.postalCode ?? ''}
                    </p>
                  </InfoItem>
                </>
              ) : (
                <InfoItem>
                  <p>Chưa có thông tin giao hàng</p>
                </InfoItem>
              )}
            </OrderInfo>
          </CardBody>
        </CardContainer>

        <CardContainer>
          <CardHeader>
            <h2><FaTruck /> Sản phẩm đã đặt</h2>
          </CardHeader>
          <CardBody>
            <OrderItems>
              <ItemTable>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.map(item => (
                    <OrderProductItem key={item.id || item.product_id} item={item} />
                  ))}
                </tbody>
              </ItemTable>

              <OrderSummary
                subtotal={order.subtotal || 0}
                shippingFee={order.shippingFee || 0}
                discount={order.discount || 0}
                total={order.total || 0}
              />
            </OrderItems>
          </CardBody>
        </CardContainer>

        <ActionButtons>
          {order.status === 'pending' && (
            <Button
              variant="danger"
              onClick={handleCancelOrder}
            >
              Hủy đơn hàng
            </Button>
          )}
          {order.status === 'shipped' && (
            <Button
              variant="warning"
              onClick={() => {/* Confirm received logic */ }}
            >
              <FaTruck /> Xác nhận đã nhận hàng
            </Button>
          )}
          <Button
            variant="text"
            onClick={() => {/* Download invoice logic */ }}
          >
            <FaFileInvoice /> Tải hóa đơn
          </Button>
        </ActionButtons>
      </OrderDetailContainer>
    </MainLayout>
  );
};

export default OrderDetail;