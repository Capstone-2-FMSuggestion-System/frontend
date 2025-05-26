import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import payosService from '../../services/payosService';
import orderService from '../../services/orderService';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
`;

const LoadingText = styled.h2`
  margin-top: 20px;
  color: #333;
  font-size: 24px;
`;

const Spinner = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4CAF50;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCartAfterPayment } = useContext(CartContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Lấy các tham số từ URL
        const orderCode = searchParams.get('orderCode');
        const status = searchParams.get('status');

        console.log('Payment callback received', { orderCode, status });

        if (!orderCode) {
          setError('Không tìm thấy mã đơn hàng từ PayOS');
          return;
        }

        // Kiểm tra trạng thái thanh toán từ server
        const statusResponse = await payosService.checkStatus(orderCode);
        console.log('Payment status response:', statusResponse);

        // Nếu thanh toán thành công
        if (status === 'PAID' || (statusResponse.data && statusResponse.data.status === 'PAID')) {
          // Cập nhật status đơn hàng thành processing
          try {
            if (statusResponse.data && statusResponse.data.order_id) {
              await orderService.updateOrderStatus(statusResponse.data.order_id, 'processing');
              console.log(`Updated order ${statusResponse.data.order_id} status to processing after PayOS payment`);
            }
          } catch (error) {
            console.warn('Failed to update order status after payment:', error);
          }

          // Xóa giỏ hàng
          clearCartAfterPayment();

          // Lấy thông tin chi tiết về đơn hàng từ API để đảm bảo có thông tin giảm giá
          let orderDetails = statusResponse.data || {};
          const subtotal = Number(orderDetails.subtotal || orderDetails.amount || 0);
          const discountAmount = Number(orderDetails.discount_amount || 0);

          // Đảm bảo tổng tiền không âm sau khi giảm giá
          const finalAmount = Math.max(0, subtotal - discountAmount);

          // Chuyển đến trang thành công
          navigate('/payment-success', {
            state: {
              order: {
                id: orderCode,
                paymentMethod: 'payos',
                subtotal: subtotal,
                discount_amount: discountAmount,
                total: finalAmount,
                coupon_code: orderDetails.coupon_code || null,
                status: 'Đã thanh toán'
              }
            }
          });
        } else if (status === 'CANCELLED') {
          // Nếu người dùng hủy thanh toán, chuyển về trang giỏ hàng
          navigate('/cart', {
            state: {
              paymentCancelled: true,
              message: 'Bạn đã hủy thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'
            }
          });
        } else {
          // Các trường hợp khác (PROCESSING, EXPIRED)
          navigate('/cart', {
            state: {
              paymentFailed: true,
              message: 'Thanh toán không thành công hoặc đã hết hạn. Vui lòng thử lại.'
            }
          });
        }
      } catch (error) {
        console.error('Error processing payment callback:', error);
        setError(error.message || 'Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams, navigate, clearCartAfterPayment]);

  if (error) {
    return (
      <LoadingContainer>
        <h2>Lỗi xử lý thanh toán</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/cart')}>Quay lại giỏ hàng</button>
      </LoadingContainer>
    );
  }

  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>Đang xử lý thanh toán, vui lòng đợi...</LoadingText>
    </LoadingContainer>
  );
};

export default PaymentCallback; 