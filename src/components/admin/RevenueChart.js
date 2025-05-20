import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import styled from 'styled-components';

// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 10;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 350px;
  width: 100%;
  color: #666;
  font-style: italic;
`;

const ChartTypeSelector = styled.div`
  display: flex;
  margin-bottom: 10px;
  justify-content: flex-end;
`;

const ChartTypeButton = styled.button`
  padding: 6px 12px;
  background-color: ${props => props.active ? '#4CAF50' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border: 1px solid ${props => props.active ? '#4CAF50' : '#ddd'};
  border-radius: 4px;
  margin-right: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#45a049' : '#f5f5f5'};
  }

  &:last-child {
    margin-right: 0;
  }
`;

/**
 * Component biểu đồ doanh thu
 * @param {Object} props - Props
 * @param {Array} props.revenueData - Dữ liệu doanh thu
 * @param {string} props.timeRange - Khoảng thời gian (daily, weekly, monthly, yearly)
 * @param {boolean} props.loading - Đang tải dữ liệu
 */
const RevenueChart = ({ revenueData = [], timeRange = 'monthly', loading = false }) => {
  const [chartType, setChartType] = useState('line');

  // Kiểm tra nếu không có dữ liệu
  if (!loading && (!revenueData || !Array.isArray(revenueData) || revenueData.length === 0)) {
    return <NoDataMessage>Không có dữ liệu doanh thu để hiển thị</NoDataMessage>;
  }

  // Giới hạn số lượng điểm dữ liệu để tránh biểu đồ quá dài
  let processedRevenueData = revenueData;
  if (revenueData.length > 12) {
    // Nếu có quá nhiều điểm dữ liệu, chúng ta có thể giới hạn số lượng hiển thị
    const step = Math.ceil(revenueData.length / 12);
    processedRevenueData = revenueData.filter((_, index) => index % step === 0);
  }

  // Cấu hình nhãn theo timeRange
  const timeRangeLabels = {
    daily: 'Ngày',
    weekly: 'Tuần',
    monthly: 'Tháng',
    yearly: 'Năm'
  };
  
  // Định dạng nhãn theo loại thời gian
  const formatLabel = (label, timeRange) => {
    if (!label) return '';
    
    try {
      switch(timeRange) {
        case 'daily':
          // Định dạng: 'DD/MM'
          if (label.includes('-')) {
            const date = new Date(label);
            return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
          }
          return label;
        case 'weekly':
          // Nếu label là 'Week X of YYYY', chỉ giữ lại 'Tuần X'
          if (label.includes('Week')) {
            return label.replace(/Week (\d+) of \d+/i, 'Tuần $1');
          }
          return label;
        case 'monthly':
          // Định dạng: 'MM/YYYY'
          if (label.includes('-')) {
            const [year, month] = label.split('-');
            return `${month}/${year}`;
          }
          return label;
        case 'yearly':
          // Giữ nguyên năm
          return label;
        default:
          return label;
      }
    } catch (error) {
      console.error('Lỗi khi định dạng nhãn:', error);
      return label;
    }
  };

  // Chuyển đổi dữ liệu nhận được từ API, đảm bảo xử lý các trường hợp null hoặc undefined
  const labels = processedRevenueData.map(item => formatLabel(item.period || item.label || '', timeRange));
  const revenueValues = processedRevenueData.map(item => Number(item.revenue ?? item.value ?? 0));
  const ordersCount = processedRevenueData.map(item => Number(item.orders_count ?? 0));

  // Màu sắc cho biểu đồ
  const chartColors = {
    revenue: {
      line: {
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      },
      bar: {
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        hoverBackgroundColor: 'rgba(75, 192, 192, 0.9)'
      }
    },
    orders: {
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)'
    }
  };

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: revenueValues,
        tension: 0.3,
        fill: chartType === 'line' ? 0.2 : false,
        ...(chartType === 'line' ? chartColors.revenue.line : chartColors.revenue.bar)
      },
      {
        label: 'Số đơn hàng',
        data: ordersCount,
        borderColor: chartColors.orders.borderColor,
        backgroundColor: chartColors.orders.backgroundColor,
        tension: 0.3,
        yAxisID: 'y1',
        type: 'line',
        hidden: !ordersCount.some(count => count > 0)
      }
    ]
  };

  // Cấu hình biểu đồ
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 5,
        bottom: 5
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Doanh thu (VNĐ)',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          callback: (value) => {
            return new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value);
          },
          maxTicksLimit: 8
        },
        beginAtZero: true
      },
      y1: {
        type: 'linear',
        display: ordersCount.some(count => count > 0),
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: 'Số đơn hàng',
          font: {
            weight: 'bold'
          }
        },
        beginAtZero: true,
        ticks: {
          maxTicksLimit: 8
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          maxTicksLimit: 12
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Tổng quan doanh thu theo ${timeRangeLabels[timeRange] || timeRange}`,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.datasetIndex === 0) {
              // Format doanh thu
              label += new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                minimumFractionDigits: 0
              }).format(context.parsed.y);
            } else {
              // Format số đơn hàng
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    animation: {
      duration: 1000
    },
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  const handleChangeChartType = (type) => {
    setChartType(type);
  };

  return (
    <ChartContainer>
      {loading && <LoadingOverlay>Đang tải dữ liệu...</LoadingOverlay>}
      <ChartTypeSelector>
        <ChartTypeButton 
          active={chartType === 'line'} 
          onClick={() => handleChangeChartType('line')}
        >
          Biểu đồ đường
        </ChartTypeButton>
        <ChartTypeButton 
          active={chartType === 'bar'} 
          onClick={() => handleChangeChartType('bar')}
        >
          Biểu đồ cột
        </ChartTypeButton>
      </ChartTypeSelector>
      <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
        {chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </ChartContainer>
  );
};

export default RevenueChart; 