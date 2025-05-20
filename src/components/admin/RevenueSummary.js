import React from 'react';
import styled from 'styled-components';
import { FaChartLine, FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';
import { calculateTotalRevenue, calculateAverageRevenue, findHighestRevenuePeriod, analyzeRevenueTrend } from '../../utils/revenueAnalytics';

const SummaryContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const SummaryCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const SummaryTitle = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const SummaryValue = styled.div`
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const SummaryTrend = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  color: ${props => props.isPositive ? '#4CAF50' : props.isNegative ? '#F44336' : '#666'};
  
  svg {
    margin-right: 5px;
  }
`;

const SummarySubtext = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 4px;
`;

/**
 * Component hiển thị tổng quan về doanh thu
 * @param {Object} props - Props
 * @param {Array} props.revenueData - Dữ liệu doanh thu
 * @param {string} props.timeRange - Khoảng thời gian (daily, weekly, monthly, yearly)
 */
const RevenueSummary = ({ revenueData = [], timeRange = 'monthly' }) => {
  // Tính toán các chỉ số tổng quan
  const totalRevenue = calculateTotalRevenue(revenueData);
  const averageRevenue = calculateAverageRevenue(revenueData);
  const highestPeriod = findHighestRevenuePeriod(revenueData);
  const trend = analyzeRevenueTrend(revenueData);
  
  // Định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  // Xác định nhãn khoảng thời gian
  const timeRangeLabels = {
    daily: 'ngày',
    weekly: 'tuần',
    monthly: 'tháng',
    yearly: 'năm'
  };
  
  return (
    <SummaryContainer>
      <SummaryCard>
        <SummaryTitle>Tổng doanh thu</SummaryTitle>
        <SummaryValue>{formatCurrency(totalRevenue)}</SummaryValue>
        <SummarySubtext>
          {revenueData.length} {timeRangeLabels[timeRange] || 'kỳ'} gần nhất
        </SummarySubtext>
      </SummaryCard>
      
      <SummaryCard>
        <SummaryTitle>Doanh thu trung bình</SummaryTitle>
        <SummaryValue>{formatCurrency(averageRevenue)}</SummaryValue>
        <SummarySubtext>
          Trung bình/{timeRangeLabels[timeRange] || 'kỳ'}
        </SummarySubtext>
      </SummaryCard>
      
      <SummaryCard>
        <SummaryTitle>Cao nhất</SummaryTitle>
        <SummaryValue>
          {highestPeriod ? formatCurrency(highestPeriod.revenue) : 'Không có dữ liệu'}
        </SummaryValue>
        {highestPeriod && (
          <SummarySubtext>
            {highestPeriod.formatted_period || highestPeriod.period}
          </SummarySubtext>
        )}
      </SummaryCard>
      
      <SummaryCard>
        <SummaryTitle>Xu hướng doanh thu</SummaryTitle>
        <SummaryTrend 
          isPositive={trend.trend === 'increasing'} 
          isNegative={trend.trend === 'decreasing'}
        >
          {trend.trend === 'increasing' && <FaArrowUp />}
          {trend.trend === 'decreasing' && <FaArrowDown />}
          {trend.trend === 'unchanged' && <FaEquals />}
          
          {trend.trend === 'increasing' && 'Tăng '}
          {trend.trend === 'decreasing' && 'Giảm '}
          {trend.trend === 'unchanged' && 'Không đổi '}
          
          {trend.trend !== 'unchanged' && `${trend.percentage.toFixed(1)}%`}
        </SummaryTrend>
        <SummarySubtext>
          So sánh dữ liệu đầu và cuối kỳ
        </SummarySubtext>
      </SummaryCard>
    </SummaryContainer>
  );
};

export default RevenueSummary; 