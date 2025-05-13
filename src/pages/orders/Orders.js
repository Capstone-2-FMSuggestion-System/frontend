import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingBag, FaEye, FaSearch } from 'react-icons/fa';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button/Button';
import orderService from '../../services/orderService';
import { toast } from 'react-hot-toast';

const Container = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 30px;
  color: #333;
`;

const OrderList = styled.div`
  display: grid;
  gap: 20px;
`;

const OrderCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
`;

const OrderId = styled.div`
  font-weight: 600;
  color: #333;
`;

const OrderDate = styled.div`
  color: #666;
`;

const OrderStatus = styled.div`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#fff3cd';
      case 'processing':
        return '#cce5ff';
      case 'completed':
        return '#d4edda';
      case 'cancelled':
        return '#f8d7da';
      default:
        return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#856404';
      case 'processing':
        return '#004085';
      case 'completed':
        return '#155724';
      case 'cancelled':
        return '#721c24';
      default:
        return '#383d41';
    }
  }};
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
`;

const OrderDetail = styled.div`
  span:first-child {
    color: #666;
    margin-right: 5px;
  }
`;

const OrderActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  color: #ccc;
  margin-bottom: 20px;
`;

const EmptyText = styled.p`
  color: #666;
  margin-bottom: 20px;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SearchButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusFilter = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch orders...');

      const response = await orderService.getUserOrders();
      console.log('API Response:', response);

      if (response && Array.isArray(response)) {
        const processedOrders = response.map(order => {
          console.log('Processing order:', order);
          return {
            order_id: order.order_id || order.id,
            created_at: order.created_at || order.createdAt,
            status: order.status,
            total_amount: order.total_amount || order.totalAmount || 0,
            payment_method: order.payment_method || (order.is_prepaid ? 'online' : 'cod'),
            customer_name: order.customer_name || 'Khách hàng',
            items: Array.isArray(order.items) ? order.items : [{
              product_name: order.product_name || 'Sản phẩm',
              quantity: order.quantity || 1,
              price: order.price || order.total_amount || 0
            }]
          };
        });
        console.log('Processed orders:', processedOrders);
        setOrders(processedOrders);
      } else {
        console.log('No orders found or invalid data structure');
        setOrders([]);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      if (error.message.includes('đăng nhập lại')) {
        window.location.href = '/login';
      } else {
        setError(error.message);
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Orders component mounted');
    fetchOrders();
  }, []);

  // Monitor orders state changes
  useEffect(() => {
    console.log('Orders state updated:', {
      orders,
      ordersLength: orders.length,
      firstOrder: orders[0]
    });
  }, [orders]);

  const filteredOrders = orders.filter(order => {
    console.log('Filtering order:', order);
    const matchesSearch = searchTerm === '' ||
      (order.order_id && order.order_id.toString().includes(searchTerm)) ||
      (order.items && order.items.some(item =>
        item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    console.log('Filter results:', {
      orderId: order.order_id,
      matchesSearch,
      matchesStatus,
      searchTerm,
      statusFilter
    });

    return matchesSearch && matchesStatus;
  });

  // Monitor filtered orders
  useEffect(() => {
    console.log('Filtered orders:', {
      filteredOrders,
      filteredLength: filteredOrders.length,
      searchTerm,
      statusFilter
    });
  }, [filteredOrders, searchTerm, statusFilter]);

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'delivered':
        return 'Đã giao hàng';
      default:
        return status;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the filter
  };

  if (loading) {
    return (
      <MainLayout>
        <Container>
          <Title>Đơn hàng của tôi</Title>
          <div>Đang tải...</div>
        </Container>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Container>
          <Title>Đơn hàng của tôi</Title>
          <div>Lỗi: {error}</div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        <Title>Đơn hàng của tôi</Title>

        <SearchContainer>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1 }}>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng hoặc sản phẩm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchButton type="submit" variant="primary" size="small">
              <FaSearch /> Tìm kiếm
            </SearchButton>
          </form>

          <StatusFilter
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </StatusFilter>
        </SearchContainer>

        {filteredOrders.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <FaShoppingBag />
            </EmptyIcon>
            <EmptyText>
              {searchTerm || statusFilter !== 'all'
                ? 'Không tìm thấy đơn hàng'
                : 'Bạn chưa có đơn hàng nào'}
            </EmptyText>
            <Button as={Link} to="/" variant="primary">
              Tiếp tục mua sắm
            </Button>
          </EmptyState>
        ) : (
          <OrderList>
            {filteredOrders.map((order) => {
              console.log('Rendering order:', order);
              return (
                <OrderCard key={order.order_id}>
                  <OrderHeader>
                    <OrderId>#{order.order_id}</OrderId>
                    <OrderDate>{formatDate(order.created_at)}</OrderDate>
                    <OrderStatus status={order.status}>{getStatusText(order.status)}</OrderStatus>
                  </OrderHeader>
                  <OrderDetails>
                    <OrderDetail>
                      <span>Khách hàng:</span>
                      <span>{order.customer_name}</span>
                    </OrderDetail>
                    <OrderDetail>
                      <span>Tổng tiền:</span>
                      <span>{order.total_amount.toLocaleString('vi-VN')}đ</span>
                    </OrderDetail>
                    <OrderDetail>
                      <span>Phương thức thanh toán:</span>
                      <span>{order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán online'}</span>
                    </OrderDetail>
                  </OrderDetails>
                  <OrderActions>
                    <Button
                      as={Link}
                      to={`/orders/${order.order_id}`}
                      variant="outline"
                      size="small"
                      leftIcon={<FaEye />}
                    >
                      Xem chi tiết
                    </Button>
                  </OrderActions>
                </OrderCard>
              );
            })}
          </OrderList>
        )}
      </Container>
    </MainLayout>
  );
};

export default Orders; 