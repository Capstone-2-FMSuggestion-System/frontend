import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTachometerAlt, FaUsers, FaShoppingBag, FaMoneyBillWave, FaChartLine, FaSyncAlt } from 'react-icons/fa';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import RevenueChart from '../../components/admin/RevenueChart';
import { toast } from 'react-toastify';

const DashboardContainer = styled.div`
  padding: 20px;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DashboardTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  color: #333;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #45a049;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  svg {
    transition: transform 0.5s ease;
    transform: ${props => props.isLoading ? 'rotate(360deg)' : 'rotate(0)'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.bgColor || '#f5f5f5'};
  color: ${props => props.iconColor || '#4CAF50'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 20px;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 14px;
`;

const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
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

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const TimeRangeButton = styled.button`
  padding: 6px 12px;
  background-color: ${props => props.active ? '#4CAF50' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid ${props => props.active ? '#4CAF50' : '#ddd'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#45a049' : '#f5f5f5'};
  }
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const RecentOrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    font-weight: 600;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  .status-pending {
    color: #FF9800;
  }
  
  .status-processing {
    color: #2196F3;
  }
  
  .status-completed {
    color: #4CAF50;
  }
  
  .status-cancelled {
    color: #F44336;
  }
`;

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('monthly');
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentOrders: [],
    revenueData: []
  });

  // Extract fetchDashboardData to a separate function so we can reuse it
  const fetchDashboardData = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      // Lấy thống kê dashboard
      const stats = await adminService.getDashboardStats(forceRefresh);
      // Lấy đơn hàng gần đây
      const recentOrdersResponse = await adminService.getRecentOrders(5, forceRefresh);
      // Lấy dữ liệu doanh thu
      const revenueResponse = await adminService.getRevenueOverview(timeRange, forceRefresh);

      setDashboardData({
        totalOrders: stats.total_orders,
        totalRevenue: stats.total_revenue,
        totalCustomers: stats.total_customers,
        totalProducts: stats.total_products,
        recentOrders: recentOrdersResponse.orders || [],
        revenueData: revenueResponse.revenue_periods || []
      });
      return true;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu dashboard:', error);
      // Giữ nguyên dữ liệu cũ nếu có lỗi
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const handleRefreshData = async () => {
    if (isRefreshing) return; // Prevent multiple refreshes at once

    setIsRefreshing(true);
    toast.info("Đang làm mới dữ liệu...");

    try {
      // Bypass cache by adding timestamp to requests (implemented in adminService)
      const success = await fetchDashboardData(true);

      if (success) {
        toast.success("Dữ liệu đã được cập nhật");
      } else {
        toast.error("Không thể cập nhật dữ liệu");
      }
    } catch (error) {
      console.error("Lỗi khi làm mới dữ liệu:", error);
      toast.error("Không thể cập nhật dữ liệu: " + error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Dashboard</DashboardTitle>
        <RefreshButton
          onClick={handleRefreshData}
          disabled={isLoading || isRefreshing}
          isLoading={isRefreshing}
        >
          <FaSyncAlt className={isRefreshing ? "spin-animation" : ""} />
          {isRefreshing ? "Đang làm mới..." : "Làm mới dữ liệu"}
        </RefreshButton>
      </DashboardHeader>

      {isLoading && !isRefreshing ? (
        <LoadingIndicator>Đang tải dữ liệu dashboard...</LoadingIndicator>
      ) : (
        <>
          <StatsGrid>
            <StatCard>
              <StatIcon bgColor="rgba(76, 175, 80, 0.1)" iconColor="#4CAF50">
                <FaShoppingBag />
              </StatIcon>
              <StatContent>
                <StatValue>{dashboardData.totalOrders}</StatValue>
                <StatLabel>Tổng đơn hàng</StatLabel>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIcon bgColor="rgba(33, 150, 243, 0.1)" iconColor="#2196F3">
                <FaMoneyBillWave />
              </StatIcon>
              <StatContent>
                <StatValue>{formatCurrency(dashboardData.totalRevenue)}</StatValue>
                <StatLabel>Tổng doanh thu</StatLabel>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIcon bgColor="rgba(255, 152, 0, 0.1)" iconColor="#FF9800">
                <FaUsers />
              </StatIcon>
              <StatContent>
                <StatValue>{dashboardData.totalCustomers}</StatValue>
                <StatLabel>Tổng khách hàng</StatLabel>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIcon bgColor="rgba(244, 67, 54, 0.1)" iconColor="#F44336">
                <FaShoppingBag />
              </StatIcon>
              <StatContent>
                <StatValue>{dashboardData.totalProducts}</StatValue>
                <StatLabel>Tổng sản phẩm</StatLabel>
              </StatContent>
            </StatCard>
          </StatsGrid>

          <ChartContainer>
            <ChartCard>
              <ChartHeader>
                <h2><FaChartLine /> Tổng quan doanh thu</h2>
                <TimeRangeSelector>
                  <TimeRangeButton
                    active={timeRange === 'daily'}
                    onClick={() => handleTimeRangeChange('daily')}
                  >
                    Ngày
                  </TimeRangeButton>
                  <TimeRangeButton
                    active={timeRange === 'weekly'}
                    onClick={() => handleTimeRangeChange('weekly')}
                  >
                    Tuần
                  </TimeRangeButton>
                  <TimeRangeButton
                    active={timeRange === 'monthly'}
                    onClick={() => handleTimeRangeChange('monthly')}
                  >
                    Tháng
                  </TimeRangeButton>
                  <TimeRangeButton
                    active={timeRange === 'yearly'}
                    onClick={() => handleTimeRangeChange('yearly')}
                  >
                    Năm
                  </TimeRangeButton>
                </TimeRangeSelector>
              </ChartHeader>
              <RevenueChart
                revenueData={dashboardData.revenueData}
                timeRange={timeRange}
                loading={isLoading}
              />
            </ChartCard>

            <ChartCard>
              <ChartHeader>
                <h2>Đơn hàng gần đây</h2>
              </ChartHeader>
              <RecentOrdersTable>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày</th>
                    <th>Khách hàng</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentOrders.length > 0 ? (
                    dashboardData.recentOrders.map(order => (
                      <tr key={order.order_id}>
                        <td>#{order.order_id}</td>
                        <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                        <td>{order.customer_name || order.customer?.name || order.customerName || 'Khách hàng'}</td>
                        <td>{formatCurrency(order.total_amount)}</td>
                        <td className={`status-${order.status.toLowerCase()}`}>
                          {order.status.toUpperCase() === 'PENDING' && 'Chờ xử lý'}
                          {order.status.toUpperCase() === 'PROCESSING' && 'Đang xử lý'}
                          {order.status.toUpperCase() === 'COMPLETED' && 'Hoàn thành'}
                          {order.status.toUpperCase() === 'CANCELLED' && 'Đã hủy'}
                          {order.status.toUpperCase() === 'DELIVERED' && 'Đã giao hàng'}
                          {!['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'DELIVERED'].includes(order.status.toUpperCase()) && order.status}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>Không có đơn hàng nào</td>
                    </tr>
                  )}
                </tbody>
              </RecentOrdersTable>
            </ChartCard>
          </ChartContainer>
        </>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;