import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaShoppingBag, FaSearch, FaFilter } from 'react-icons/fa';
import OrderList from '../../order-management/OrderList/OrderList';
import orderService from '../../../services/orderService';

const Container = styled.div`
  padding: 0;
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

const SearchFilterContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  flex: 1;
  position: relative;
  
  input {
    width: 100%;
    padding: 10px 15px 10px 40px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.3s ease;
    
    &:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #666;
  }
`;

const FilterDropdown = styled.select`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  min-width: 150px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
`;

const OrderTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Bước 1: Lấy danh sách đơn hàng
        const response = await orderService.getUserOrders();
        console.log('Fetched orders from API:', response);

        if (Array.isArray(response) && response.length > 0) {
          // Bước 2: Lấy chi tiết từng đơn hàng
          try {
            console.log('Fetching order details for each order...');
            const ordersWithDetails = await Promise.all(
              response.map(async (order) => {
                try {
                  // Gọi API để lấy chi tiết đơn hàng
                  const orderDetail = await orderService.getOrderById(order.orderId);
                  console.log(`Chi tiết đơn hàng ${order.orderId}:`, orderDetail);

                  // Cập nhật lại thông tin items từ chi tiết đơn hàng
                  if (orderDetail && orderDetail.items && orderDetail.items.length > 0) {
                    return {
                      ...order,
                      items: orderDetail.items
                    };
                  }
                  return order;
                } catch (error) {
                  console.error(`Lỗi khi lấy chi tiết đơn hàng ${order.orderId}:`, error);
                  return order;
                }
              })
            );
            console.log('Orders with details:', ordersWithDetails);
            setOrders(ordersWithDetails);
          } catch (error) {
            console.error('Error fetching order details:', error);
            setOrders(response);
          }

          setTotalPages(Math.ceil(response.length / 10));
        } else {
          console.error('Invalid orders data:', response);
          setOrders([]);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      setSearchTerm(e.target.value);
    }
  };

  const handleStatusFilterChange = (e) => {
    setCurrentPage(1);
    setStatusFilter(e.target.value);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' ||
      (order.orderId && order.orderId.toString().includes(searchTerm)) ||
      (order.items && order.items.some(item =>
        item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Container>
      <CardHeader>
        <h2><FaShoppingBag /> Lịch sử đơn hàng</h2>
      </CardHeader>
      <CardBody>
        <SearchFilterContainer>
          <SearchInput>
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng hoặc sản phẩm"
              onKeyDown={handleSearch}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>

          <FilterContainer>
            <FaFilter />
            <FilterDropdown value={statusFilter} onChange={handleStatusFilterChange}>
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao</option>
              <option value="delivered">Đã giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </FilterDropdown>
          </FilterContainer>
        </SearchFilterContainer>

        <OrderList
          orders={filteredOrders}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          emptyIcon={<FaShoppingBag />}
        />
      </CardBody>
    </Container>
  );
};

export default OrderTab; 