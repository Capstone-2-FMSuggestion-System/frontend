import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaFilter, FaSort } from 'react-icons/fa';
import AdminLayout from '../../layouts/AdminLayout';
import Pagination from '../../components/common/Pagination/Pagination';
import adminOrderService from '../../services/adminOrderService';

const Container = styled(motion.div)`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TitleGroup = styled.div``;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const Description = styled.p`
  color: #6b7280;
  margin: 8px 0 0 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  color: #374151;
  min-width: 180px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #6b7280;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
`;

const TableHead = styled.thead`
  background-color: #f9fafb;
  border-bottom: 1px solid #eaeaea;

  th {
    padding: 12px 16px;
    color: #6b7280;
    font-weight: 600;
    white-space: nowrap;
  }
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid #eaeaea;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #f9fafb;
    }
  }

  td {
    padding: 12px 16px;
    color: #374151;
    white-space: nowrap;
  }
`;

const ShippingBadge = styled.span`
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  
  &.standard {
    background-color: #e2e8f0;
    color: #475569;
  }
  
  &.fast {
    background-color: #dcfce7;
    color: #166534;
  }
`;

const PaymentBadge = styled.span`
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
  
  &.paid {
    background-color: #dcfce7;
    color: #166534;
  }
  
  &.unpaid {
    background-color: #fef2f2;
    color: #b91c1c;
  }
`;

const PaginationContainer = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: center;
`;

const PageInfo = styled.div`
  text-align: center;
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
`;

const MoreButton = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 20px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #111827;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  background-color: #fef2f2;
  color: #b91c1c;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filterValue, setFilterValue] = useState('');
  const [sortValue, setSortValue] = useState('newest');
  const [monthFilter, setMonthFilter] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    status_options: [],
    payment_options: [],
    shipping_options: [],
    month_options: []
  });

  const itemsPerPage = 5;

  const fetchFilterOptions = async () => {
    try {
      console.log('Fetching filter options...');
      const options = await adminOrderService.getOrderFilterOptions();
      console.log('Filter options received:', options);
      setFilterOptions(options);
    } catch (err) {
      console.error('Error fetching filter options:', err);
      setError('Không thể tải tùy chọn lọc. Vui lòng thử lại sau.');
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
        filter: filterValue || undefined,
        sort: sortValue || undefined,
        month: monthFilter || undefined
      };

      console.log('Fetching orders with params:', params);
      const response = await adminOrderService.getOrders(params);
      console.log('Orders response:', response);

      if (response && response.orders) {
        setOrders(response.orders);
        setTotalPages(Math.ceil(response.total / itemsPerPage));
        setTotalOrders(response.total);
      } else {
        console.error('Invalid response format:', response);
        setError('Định dạng dữ liệu không hợp lệ');
      }

    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.message.includes('đăng nhập lại')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.message || 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterValue, sortValue, monthFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (e) => {
    setFilterValue(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortValue(e.target.value);
    setCurrentPage(1);
  };

  const handleMonthFilterChange = (e) => {
    setMonthFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <TitleGroup>
          <Title>Đơn hàng ({totalOrders})</Title>
          <Description>
            Quản lý đơn hàng và theo dõi trạng thái giao hàng tại đây.
          </Description>
        </TitleGroup>
      </Header>

      <FilterContainer>
        <Select
          value={filterValue}
          onChange={handleFilterChange}
          aria-label="Lọc theo đơn hàng"
        >
          <option value="">Lọc theo đơn hàng ...</option>
          {filterOptions.status_options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          value={monthFilter}
          onChange={handleMonthFilterChange}
          aria-label="Lọc theo tháng"
        >
          <option value="">Tháng từ 2025</option>
          {filterOptions.month_options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          value={sortValue}
          onChange={handleSortChange}
          aria-label="Sắp xếp"
        >
          <option value="newest">Sắp xếp</option>
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="amount_high">Giá cao đến thấp</option>
          <option value="amount_low">Giá thấp đến cao</option>
        </Select>
      </FilterContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingText>Đang tải dữ liệu...</LoadingText>
      ) : (
        <>
          {orders.length === 0 ? (
            <LoadingText>Không tìm thấy đơn hàng nào</LoadingText>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <tr>
                    <th>Tên sản phẩm</th>
                    <th>Khách hàng</th>
                    <th>SĐT</th>
                    <th>Email</th>
                    <th>Địa chỉ</th>
                    <th>Tổng tiền</th>
                    <th>Shipping</th>
                    <th>Trả trước</th>
                    <th></th>
                  </tr>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.product_name}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.phone_number}</td>
                      <td>{order.email}</td>
                      <td>{order.address}</td>
                      <td>{order.total_amount.toLocaleString('vi-VN')} đ</td>
                      <td>
                        <ShippingBadge className={order.shipping_method === 'Nhanh' ? 'fast' : 'standard'}>
                          {order.shipping_method}
                        </ShippingBadge>
                      </td>
                      <td>
                        <PaymentBadge className={order.is_prepaid ? 'paid' : 'unpaid'}>
                          {order.is_prepaid ? 'Yes' : 'No'}
                        </PaymentBadge>
                      </td>
                      <td>
                        <MoreButton aria-label="Xem thêm">...</MoreButton>
                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {totalPages > 1 && (
            <PaginationContainer>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </PaginationContainer>
          )}

          <PageInfo>
            Trang {currentPage} trên {totalPages}
          </PageInfo>
        </>
      )}
    </Container>
  );
};

export default OrderList;