import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaShoppingBag, FaSearch, FaFilter } from 'react-icons/fa';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button/Button';
import { AuthContext } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import OrderList from '../../components/order-management/OrderList/OrderList';

const OrdersContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
  animation: fadeIn 0.5s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const OrdersTitle = styled.h1`
  font-size: 28px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 12px;
    color: #4CAF50;
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

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #666;
  }
`;

const EmptyOrders = styled.div`
  text-align: center;
  padding: 30px;
  
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

const Orders = () => {
  const { currentUser } = useContext(AuthContext);
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
        const response = await orderService.getUserOrders();

        if (Array.isArray(response) && response.length > 0) {
          // Sắp xếp theo đơn hàng mới nhất (createdAt giảm dần)
          let sortedOrders = [...response].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });

          // Lọc theo tìm kiếm và trạng thái
          if (searchTerm) {
            sortedOrders = sortedOrders.filter(order =>
              (order.orderId && order.orderId.toString().includes(searchTerm)) ||
              (order.items && order.items.some(item =>
                item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
              ))
            );
          }

          if (statusFilter !== 'all') {
            sortedOrders = sortedOrders.filter(order => order.status === statusFilter);
          }

          // Tính toán phân trang với 3 đơn hàng mỗi trang
          const itemsPerPage = 3;
          const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

          setOrders(paginatedOrders);
          setTotalPages(totalPages);
        } else {
          setOrders([]);
          setTotalPages(1);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        setOrders([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser, currentPage, searchTerm, statusFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      setSearchTerm(e.target.value);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setCurrentPage(1);
    setStatusFilter(e.target.value);
  };

  return (
    <MainLayout>
      <OrdersContainer>
        <OrdersTitle>
          <FaShoppingBag />
          Đơn hàng của tôi
        </OrdersTitle>

        <CardContainer>
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
                  onChange={handleSearchChange}
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
              orders={orders}
              loading={loading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              emptyIcon={<FaShoppingBag />}
            />
          </CardBody>
        </CardContainer>
      </OrdersContainer>
    </MainLayout>
  );
};

export default Orders;