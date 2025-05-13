import React from 'react';
import styled from 'styled-components';

const SummaryContainer = styled.div`
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.01);
  }
  
  &:last-child {
    margin-bottom: 0;
    font-weight: 700;
    font-size: 18px;
    padding-top: 10px;
    border-top: 1px dashed #eee;
  }
`;

const SummaryLabel = styled.span`
  color: #666;
`;

const SummaryValue = styled.span`
  font-weight: ${props => props.bold ? '600' : 'normal'};
  color: ${props => props.highlight ? '#4CAF50' : '#333'};
`;

const DiscountValue = styled(SummaryValue)`
  color: #F44336;
`;

const OrderSummary = ({ subtotal = 0, shippingFee = 0, discount = 0, total = 0 }) => {
  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '0đ';
    return value.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <SummaryContainer>
      <SummaryRow>
        <SummaryLabel>Tạm tính:</SummaryLabel>
        <SummaryValue>{formatCurrency(subtotal)}</SummaryValue>
      </SummaryRow>
      <SummaryRow>
        <SummaryLabel>Phí vận chuyển:</SummaryLabel>
        <SummaryValue>{formatCurrency(shippingFee)}</SummaryValue>
      </SummaryRow>
      {discount > 0 && (
        <SummaryRow>
          <SummaryLabel>Giảm giá:</SummaryLabel>
          <DiscountValue>-{formatCurrency(discount)}</DiscountValue>
        </SummaryRow>
      )}
      <SummaryRow>
        <SummaryLabel>Tổng cộng:</SummaryLabel>
        <SummaryValue bold highlight>{formatCurrency(total)}</SummaryValue>
      </SummaryRow>
    </SummaryContainer>
  );
};

export default OrderSummary;