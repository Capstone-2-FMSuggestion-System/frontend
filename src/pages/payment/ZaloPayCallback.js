import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FaSpinner } from 'react-icons/fa';
import MainLayout from '../../layouts/MainLayout';
import zaloPayService from '../../services/zaloPayService';

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 40px 0;
  
  svg {
    font-size: 48px;
    color: #4CAF50;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Message = styled.p`
  font-size: 16px;
  margin: 20px 0;
  color: #666;
`;

const ZaloPayCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Đang xử lý thanh toán...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get callback data from URL parameters
                const params = new URLSearchParams(location.search);
                const callbackData = {
                    orderId: params.get('orderId'),
                    status: params.get('status'),
                    amount: params.get('amount'),
                    transId: params.get('transId'),
                    mac: params.get('mac')
                };

                // Handle callback
                const response = await zaloPayService.handleCallback(callbackData);

                if (response.success) {
                    setStatus('success');
                    setMessage('Thanh toán thành công! Đơn hàng của bạn đang được xử lý.');
                    // Redirect to success page after 3 seconds
                    setTimeout(() => {
                        navigate('/payment-success', { state: { order: response.order } });
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage('Thanh toán thất bại. Vui lòng thử lại sau.');
                }
            } catch (error) {
                console.error('Error handling ZaloPay callback:', error);
                setStatus('error');
                setMessage('Có lỗi xảy ra. Vui lòng liên hệ hỗ trợ.');
            }
        };

        handleCallback();
    }, [location, navigate]);

    return (
        <MainLayout>
            <Container>
                <LoadingSpinner>
                    <FaSpinner />
                </LoadingSpinner>
                <Message>{message}</Message>
            </Container>
        </MainLayout>
    );
};

export default ZaloPayCallback; 