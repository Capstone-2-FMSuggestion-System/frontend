import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import payosService from '../../services/payosService';

const Container = styled.div`
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
  font-size: 28px;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
`;

const Button = styled.button`
  background-color: ${props => props.secondary ? '#6c757d' : '#4CAF50'};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  margin: 0 10px;
  
  &:hover {
    background-color: ${props => props.secondary ? '#5a6268' : '#45a049'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    margin-right: 8px;
  }
`;

const StatusIcon = styled.div`
  font-size: 80px;
  margin-bottom: 30px;
  
  &.success {
    color: #4CAF50;
  }
  
  &.error {
    color: #f44336;
  }
  
  &.processing {
    color: #2196f3;
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
`;

const OrderInfo = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
  
  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 18px;
    color: #333;
  }
  
  p {
    margin: 5px 0;
    display: flex;
    justify-content: space-between;
    
    span:last-child {
      font-weight: 500;
    }
  }
`;

const PayOSCallback = () => {
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Đang xử lý thanh toán...');
    const [orderCode, setOrderCode] = useState('');
    const [orderAmount, setOrderAmount] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Lấy các tham số từ URL
                const params = new URLSearchParams(location.search);
                const code = params.get('orderCode');
                const status = params.get('status');
                const amount = params.get('amount');

                setOrderCode(code || '');
                if (amount) {
                    setOrderAmount(parseInt(amount) / 100); // Convert từ xu sang đồng
                }

                // Nếu không có mã đơn hàng, hiển thị lỗi
                if (!code) {
                    setStatus('error');
                    setMessage('Không tìm thấy thông tin đơn hàng. Vui lòng kiểm tra lại.');
                    return;
                }

                // Kiểm tra trạng thái từ URL
                if (status === 'success') {
                    // Gọi API để xác nhận và cập nhật trạng thái thanh toán
                    const callbackData = {
                        orderCode: code,
                        status: status
                    };

                    const response = await payosService.handleCallback(callbackData);

                    if (response && response.status === 'success') {
                        setStatus('success');
                        setMessage('Thanh toán thành công! Đơn hàng của bạn đang được xử lý và sẽ được giao trong thời gian sớm nhất.');
                    } else {
                        setStatus('error');
                        setMessage('Đã xảy ra lỗi khi xác nhận thanh toán. Vui lòng liên hệ hỗ trợ.');
                    }
                } else {
                    setStatus('error');
                    setMessage('Thanh toán không thành công hoặc đã bị hủy.');
                }
            } catch (error) {
                console.error('Error handling PayOS callback:', error);
                setStatus('error');
                setMessage('Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng thử lại sau.');
            }
        };

        handleCallback();
    }, [location]);

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleViewOrders = () => {
        navigate('/account/orders');
    };

    return (
        <Container>
            {status === 'processing' ? (
                <>
                    <StatusIcon className="processing">
                        <FaSpinner />
                    </StatusIcon>
                    <Title>Đang xử lý</Title>
                    <Message>{message}</Message>
                </>
            ) : status === 'success' ? (
                <>
                    <StatusIcon className="success">
                        <FaCheckCircle />
                    </StatusIcon>
                    <Title>Thanh toán thành công</Title>
                    <Message>{message}</Message>

                    {orderCode && (
                        <OrderInfo>
                            <h3>Thông tin đơn hàng</h3>
                            <p>
                                <span>Mã đơn hàng:</span>
                                <span>{orderCode}</span>
                            </p>
                            {orderAmount > 0 && (
                                <p>
                                    <span>Số tiền:</span>
                                    <span>{orderAmount.toLocaleString('vi-VN')} VNĐ</span>
                                </p>
                            )}
                            <p>
                                <span>Phương thức:</span>
                                <span>PayOS</span>
                            </p>
                            <p>
                                <span>Thời gian:</span>
                                <span>{new Date().toLocaleString('vi-VN')}</span>
                            </p>
                        </OrderInfo>
                    )}

                    <ButtonGroup>
                        <Button onClick={handleViewOrders}>
                            <FaShoppingBag /> Xem đơn hàng
                        </Button>
                        <Button secondary onClick={handleBackToHome}>
                            <FaArrowLeft /> Quay lại trang chủ
                        </Button>
                    </ButtonGroup>
                </>
            ) : (
                <>
                    <StatusIcon className="error">
                        <FaTimesCircle />
                    </StatusIcon>
                    <Title>Thanh toán thất bại</Title>
                    <Message>{message}</Message>
                    <ButtonGroup>
                        <Button secondary onClick={handleBackToHome}>
                            <FaArrowLeft /> Quay lại trang chủ
                        </Button>
                    </ButtonGroup>
                </>
            )}
        </Container>
    );
};

export default PayOSCallback; 