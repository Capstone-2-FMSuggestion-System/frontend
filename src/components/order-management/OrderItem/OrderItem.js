import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaEye, FaFileDownload, FaTruck } from 'react-icons/fa';
import Button from '../../common/Button/Button';
import orderService from '../../../services/orderService';
import { useToast } from '../../../context/ToastContext';

const OrderItemContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  overflow: hidden;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OrderNumber = styled.span`
  font-weight: 600;
  color: #212529;
`;

const OrderDate = styled.span`
  font-size: 14px;
  color: #6c757d;
`;

const OrderStatus = styled.span`
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fff3cd';
      case 'processing': return '#cce5ff';
      case 'shipped': return '#d4edda';
      case 'delivered': return '#d1e7dd';
      case 'cancelled': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#856404';
      case 'processing': return '#004085';
      case 'shipped': return '#155724';
      case 'delivered': return '#0f5132';
      case 'cancelled': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const OrderContent = styled.div`
  padding: 16px;
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const ProductRow = styled.tr`
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const ProductCell = styled.td`
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
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

const ProductDetails = styled.div`
  margin-left: 15px;
`;

const ProductName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const ProductVariant = styled.div`
  font-size: 14px;
  color: #666;
`;

const ProductPrice = styled.div`
  font-weight: 500;
`;

const ProductQuantity = styled.div`
  font-weight: 500;
`;

const ProductTotal = styled.div`
  font-weight: 600;
  color: #4CAF50;
`;

const AdditionalProducts = styled.div`
  font-size: 14px;
  color: #6c757d;
  margin-top: 8px;
`;

const NoProducts = styled.div`
  color: #6c757d;
  font-style: italic;
`;

const OrderFooter = styled.div`
  padding: 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalAmount = styled.div`
  font-weight: 600;
  color: #212529;
  
  span {
    color: #dc3545;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ViewButton = styled(ActionButton)`
  background: #007bff;
  color: white;
  border: none;
`;

const TrackButton = styled(ActionButton)`
  background: #ffc107;
  color: #212529;
  border: none;
`;

const InvoiceButton = styled(ActionButton)`
  background: #6c757d;
  color: white;
  border: none;
`;

const OrderItem = ({ order, onTrackOrder, onDownloadInvoice, onCancelOrder }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [status, setStatus] = React.useState(order.status);
  const [loading, setLoading] = React.useState(false);

  const handleViewDetails = () => {
    navigate(`/orders/${order.id}`);
  };

  const handleConfirmReceived = async () => {
    setLoading(true);
    try {
      await orderService.updateOrderStatus(order.id, 'delivered');
      setStatus('delivered');
      toast.success({ title: 'Thành công', message: 'Đã xác nhận nhận hàng!', duration: 3000 });
    } catch (error) {
      toast.error({ title: 'Lỗi', message: error.message || 'Xác nhận nhận hàng thất bại', duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  console.log('OrderItem received order:', order);
  console.log('Order items data:', order.items);
  console.log('Order items type:', typeof order.items);
  console.log('Order items length:', order.items?.length);
  console.log('Order items structure:', {
    isArray: Array.isArray(order.items),
    hasItems: !!order.items,
    itemsKeys: order.items ? Object.keys(order.items) : null
  });

  const orderItems = Array.isArray(order.items) ? order.items : [];

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
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
      return dateString;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <OrderItemContainer>
      <OrderHeader>
        <OrderInfo>
          <OrderNumber>#{order.orderId}</OrderNumber>
          <OrderDate>{formatDate(order.createdAt)}</OrderDate>
        </OrderInfo>
        <OrderStatus status={status}>{getStatusText(status)}</OrderStatus>
      </OrderHeader>

      <OrderContent>
        {orderItems.length > 0 ? (
          <ProductTable>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '15px' }}>Sản phẩm</th>
                <th style={{ textAlign: 'left', padding: '15px' }}>Đơn giá</th>
                <th style={{ textAlign: 'left', padding: '15px' }}>Số lượng</th>
                <th style={{ textAlign: 'left', padding: '15px' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <ProductRow key={item.id || item.product_id || index}>
                  <ProductCell>
                    <ProductInfo>
                      <ProductImage
                        src={item.product?.images?.[0]?.image_url || item.product_image || '/images/placeholder.png'}
                        alt={item.product?.name || item.product_name || `#${item.product_id}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder.png';
                        }}
                      />
                      <ProductDetails>
                        <ProductName>{item.product?.name || item.product_name || `#${item.product_id}`}</ProductName>
                        <ProductVariant>Đơn vị: {item.unit || 'kg'}</ProductVariant>
                      </ProductDetails>
                    </ProductInfo>
                  </ProductCell>
                  <ProductCell>
                    <ProductPrice>{formatPrice(item.price)}</ProductPrice>
                  </ProductCell>
                  <ProductCell>
                    <ProductQuantity>{item.quantity}</ProductQuantity>
                  </ProductCell>
                  <ProductCell>
                    <ProductTotal>{formatPrice(item.total || (item.price * item.quantity))}</ProductTotal>
                  </ProductCell>
                </ProductRow>
              ))}
            </tbody>
          </ProductTable>
        ) : (
          <NoProducts>Không có sản phẩm trong đơn hàng</NoProducts>
        )}
      </OrderContent>

      <OrderFooter>
        <TotalAmount>
          Tổng tiền: <span>{formatPrice(order.totalAmount)}</span>
        </TotalAmount>
        <ActionButtons>
          <ViewButton onClick={handleViewDetails}>
            Xem chi tiết
          </ViewButton>
          {status === 'pending' && (
            <TrackButton style={{ background: '#dc3545', color: '#fff' }} onClick={() => onCancelOrder && onCancelOrder(order.id)}>
              Hủy đơn hàng
            </TrackButton>
          )}
          {status === 'shipped' && (
            <TrackButton style={{ background: '#ffc107', color: '#212529' }} onClick={handleConfirmReceived} disabled={loading}>
              {loading ? 'Đang xác nhận...' : 'Xác nhận đã nhận hàng'}
            </TrackButton>
          )}
          {status === 'delivered' && (
            <InvoiceButton onClick={() => onDownloadInvoice && onDownloadInvoice(order.id)}>
              Tải hóa đơn
            </InvoiceButton>
          )}
        </ActionButtons>
      </OrderFooter>
    </OrderItemContainer>
  );
};

export default OrderItem;