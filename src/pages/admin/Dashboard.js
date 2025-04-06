import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTachometerAlt, FaUsers, FaShoppingBag, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import AdminLayout from '../../layouts/AdminLayout';

const DashboardContainer = styled.div`
  padding: 20px;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
  padding: 21px;  /* 20px; */
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
  font-size: 15px; /* 14px; */
`;

const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 31px; /* 30px; */
  
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
    color:rgba(255, 153, 0, 0.82);
  }
  
  .status-processing {
    color:rgb(36, 134, 214);
  }
  
  .status-completed {
    color:rgb(69, 190, 73);
  }
  
  .status-cancelled {
    color: #F44336;
  }
`;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 256,
    totalRevenue: 25000000,
    totalCustomers: 183,
    totalProducts: 124,
    recentOrders: [
      { id: 1, date: '2023-07-25', customer: 'John Doe', total: 850000, status: 'completed' },
      { id: 2, date: '2023-07-24', customer: 'Jane Smith', total: 1250000, status: 'processing' },
      { id: 3, date: '2023-07-24', customer: 'Robert Johnson', total: 560000, status: 'pending' },
      { id: 4, date: '2023-07-23', customer: 'Emily Davis', total: 920000, status: 'cancelled' },
      { id: 5, date: '2023-07-23', customer: 'Michael Brown', total: 450000, status: 'completed' },
    ]
  });
  
  // Normally, you would fetch this data from API
  useEffect(() => {
    // Example of fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        // const response = await adminService.getDashboardData();
        // setDashboardData(response);
      } catch (error) {
        console.error('Failed to fetch dashboards data:', error);
      }
    };
    
    // Uncomment to use actual data
    // fetchDashboardData();
  }, []);
  
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  return (
      <DashboardContainer>
        <StatsGrid>
          <StatCard>
            <StatIcon bgColor="rgba(57, 151, 60, 0.1)" iconColor="#4CAF50">
              <FaShoppingBag />
            </StatIcon>
            <StatContent>
              <StatValue>{dashboardData.totalOrders}</StatValue>
              <StatLabel>Total Orders</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon bgColor="rgba(33, 150, 243, 0.1)" iconColor="#2196F3">
              <FaMoneyBillWave />
            </StatIcon>
            <StatContent>
              <StatValue>{formatCurrency(dashboardData.totalRevenue)}</StatValue>
              <StatLabel>Total Revenue</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon bgColor="rgba(255, 153, 0, 0.22)" iconColor="#FF9800">
              <FaUsers />
            </StatIcon>
            <StatContent>
              <StatValue>{dashboardData.totalCustomers}</StatValue>
              <StatLabel>Total Customers</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon bgColor="rgba(244, 67, 54, 0.1)" iconColor="#F44336">
              <FaShoppingBag />
            </StatIcon>
            <StatContent>
              <StatValue>{dashboardData.totalProducts}</StatValue>
              <StatLabel>Total Products</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>
        
        <ChartContainer>
          <ChartCard>
            <ChartHeader>
              <h2><FaChartLine /> Revenue Overview</h2>
            </ChartHeader>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* This would be a chart in a real application */}
              <p>Revenue chart would be displayed here</p>
            </div>
          </ChartCard>
          
          <ChartCard>
            <ChartHeader>
              <h2>Recent Orders</h2>
            </ChartHeader>
            <RecentOrdersTable>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td className={`status-${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </RecentOrdersTable>
          </ChartCard>
        </ChartContainer>
      </DashboardContainer>
  );
};

export default Dashboard;