import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaQuestionCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const IconContainer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 16px;
  
  ${props => {
        switch (props.type) {
            case 'warning':
                return `
          background-color: #fef2f2;
          color: #dc2626;
        `;
            case 'danger':
                return `
          background-color: #fef2f2;
          color: #dc2626;
        `;
            case 'success':
                return `
          background-color: #f0f9ff;
          color: #0ea5e9;
        `;
            case 'info':
                return `
          background-color: #eff6ff;
          color: #3b82f6;
        `;
            default:
                return `
          background-color: #f3f4f6;
          color: #6b7280;
        `;
        }
    }}
  
  svg {
    font-size: 20px;
  }
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #111827;
`;

const Message = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
  padding-left: 64px;
  line-height: 1.5;
`;

const OrderDetails = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
`;

const OrderDetail = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
    font-weight: 600;
    font-size: 16px;
    color: #111827;
    border-top: 1px solid #e5e7eb;
    padding-top: 8px;
    margin-top: 8px;
  }
`;

const DetailLabel = styled.span`
  font-weight: 500;
  color: #4b5563;
`;

const DetailValue = styled.span`
  color: #111827;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background: white;
  border: 2px solid #d1d5db;
  color: #374151;
  
  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const ConfirmButton = styled(Button)`
  ${props => {
        switch (props.variant) {
            case 'danger':
                return `
          background: #ef4444;
          color: white;
          
          &:hover:not(:disabled) {
            background: #dc2626;
          }
        `;
            case 'success':
                return `
          background: #4CAF50;
          color: white;
          
          &:hover:not(:disabled) {
            background: #45a049;
          }
        `;
            case 'primary':
                return `
          background: #3b82f6;
          color: white;
          
          &:hover:not(:disabled) {
            background: #2563eb;
          }
        `;
            default:
                return `
          background: #6b7280;
          color: white;
          
          &:hover:not(:disabled) {
            background: #4b5563;
          }
        `;
        }
    }}
`;

const getIcon = (type) => {
    switch (type) {
        case 'warning':
            return <FaExclamationTriangle />;
        case 'danger':
            return <FaExclamationTriangle />;
        case 'success':
            return <FaCheckCircle />;
        case 'info':
            return <FaInfoCircle />;
        default:
            return <FaQuestionCircle />;
    }
};

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'warning',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    confirmVariant = 'primary',
    orderDetails = null,
    loading = false
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <ModalOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <ModalContent
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ModalHeader>
                            <IconContainer type={type}>
                                {getIcon(type)}
                            </IconContainer>
                            <Title>{title}</Title>
                        </ModalHeader>

                        <Message>{message}</Message>

                        {orderDetails && (
                            <OrderDetails>
                                <OrderDetail>
                                    <DetailLabel>Mã đơn hàng:</DetailLabel>
                                    <DetailValue>#{orderDetails.orderId}</DetailValue>
                                </OrderDetail>
                                <OrderDetail>
                                    <DetailLabel>Ngày tạo:</DetailLabel>
                                    <DetailValue>{orderDetails.createdAt}</DetailValue>
                                </OrderDetail>
                                <OrderDetail>
                                    <DetailLabel>Trạng thái:</DetailLabel>
                                    <DetailValue>{orderDetails.status}</DetailValue>
                                </OrderDetail>
                                <OrderDetail>
                                    <DetailLabel>Tổng tiền:</DetailLabel>
                                    <DetailValue>{orderDetails.totalAmount}</DetailValue>
                                </OrderDetail>
                            </OrderDetails>
                        )}

                        <ButtonGroup>
                            <CancelButton onClick={onClose} disabled={loading}>
                                {cancelText}
                            </CancelButton>
                            <ConfirmButton
                                variant={confirmVariant}
                                onClick={onConfirm}
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : confirmText}
                            </ConfirmButton>
                        </ButtonGroup>
                    </ModalContent>
                </ModalOverlay>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal; 