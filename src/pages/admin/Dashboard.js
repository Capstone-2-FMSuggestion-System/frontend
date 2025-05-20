import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaTachometerAlt, FaUsers, FaShoppingBag, FaMoneyBillWave, FaChartLine, FaSyncAlt } from 'react-icons/fa';
import AdminLayout from '../../layouts/AdminLayout';
import adminService from '../../services/adminService';
import RevenueChart from '../../components/admin/RevenueChart';
import RevenueSummary from '../../components/admin/RevenueSummary';
import { normalizeRevenueData } from '../../utils/revenueAnalytics';
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
  max-height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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

const TableContainer = styled.div`
  overflow-y: auto;
  max-height: 450px;
`;

const RecentOrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    font-weight: 600;
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 1;
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

const ChartContent = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const RevenueSummaryContainer = styled.div`
  margin-bottom: 10px;
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
  const [loadError, setLoadError] = useState(null);
  const [normalizedRevenueData, setNormalizedRevenueData] = useState([]);

  // Extract fetchDashboardData to a separate function so we can reuse it
  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // Lấy đồng thời tất cả dữ liệu cần thiết cho dashboard
      const [stats, recentOrdersResponse, revenueResponse] = await Promise.all([
        adminService.getDashboardStats(forceRefresh),
        adminService.getRecentOrders(5, forceRefresh),
        adminService.getRevenueOverview(timeRange, forceRefresh)
      ]);

      // Kiểm tra và đảm bảo dữ liệu nhận được có định dạng đúng
      const validatedData = {
        totalOrders: stats?.total_orders ?? 0,
        totalRevenue: stats?.total_revenue ?? 0,
        totalCustomers: stats?.total_users ?? 0,
        totalProducts: stats?.total_products ?? 0,
        recentOrders: Array.isArray(recentOrdersResponse?.orders) ? recentOrdersResponse.orders : [],
        revenueData: Array.isArray(revenueResponse?.data) ? revenueResponse.data : []
      };

      setDashboardData(validatedData);
      
      // Chuẩn hóa dữ liệu doanh thu để sử dụng trong các phân tích
      const normalized = normalizeRevenueData(validatedData.revenueData, timeRange);
      setNormalizedRevenueData(normalized);
      
      // Kiểm tra nếu không có dữ liệu doanh thu
      if (!validatedData.revenueData || validatedData.revenueData.length === 0) {
        console.warn('Không có dữ liệu doanh thu cho khoảng thời gian:', timeRange);
      }
      
      return true;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu dashboard:', error);
      setLoadError(error.message || 'Không thể tải dữ liệu dashboard');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, timeRange]);

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
    if (!value || isNaN(value)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleTimeRangeChange = (range) => {
    if (range === timeRange) return; // Không làm gì nếu chọn cùng một khoảng thời gian
    setTimeRange(range);
    // fetchDashboardData sẽ được gọi tự động qua useEffect khi timeRange thay đổi
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
      ) : loadError ? (
        <div style={{ color: '#f44336', padding: '20px', textAlign: 'center' }}>
          <p>Không thể tải dữ liệu: {loadError}</p>
          <button 
            onClick={handleRefreshData}
            style={{ 
              padding: '8px 16px', 
              background: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        </div>
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
                <StatValue>{formatCurrency(dashboardData.totalRevenue ?? 0)}</StatValue>
                <StatLabel>Tổng doanh thu</StatLabel>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIcon bgColor="rgba(255, 152, 0, 0.1)" iconColor="#FF9800">
                <FaUsers />
              </StatIcon>
              <StatContent>
                <StatValue>{dashboardData.totalCustomers ?? 0}</StatValue>
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
              
              <ChartContent>
                <RevenueSummaryContainer>
                  <RevenueSummary 
                    revenueData={normalizedRevenueData}
                    timeRange={timeRange}
                  />
                </RevenueSummaryContainer>
                
                <RevenueChart
                  revenueData={dashboardData.revenueData}
                  timeRange={timeRange}
                  loading={isLoading}
                />
              </ChartContent>
            </ChartCard>

            <ChartCard>
              <ChartHeader>
                <h2>Đơn hàng gần đây</h2>
              </ChartHeader>
              <TableContainer>
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
                    {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                      dashboardData.recentOrders.map(order => (
                        <tr key={order.order_id}>
                          <td>#{order.order_id}</td>
                          <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                          <td>{order.receiver_name || order.user_name || 'Khách hàng'}</td>
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
              </TableContainer>
            </ChartCard>
          </ChartContainer>
        </>
      )}
    </DashboardContainer>
  );
};

export default Dashboard;