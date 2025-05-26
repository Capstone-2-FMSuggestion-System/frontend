import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaPaperclip } from 'react-icons/fa';
import { useChat } from '../../../context/ChatContext';

const InputContainer = styled.div`
  padding: 16px;
  border-top: 1px solid #e9ecef;
  background: white;
  flex-shrink: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  resize: none;
  outline: none;
  font-size: 14px;
  line-height: 1.4;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;
  
  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
  
  &::placeholder {
    color: #6c757d;
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? '#007bff' : '#f8f9fa'};
  color: ${props => props.primary ? 'white' : '#007bff'};
  border: ${props => props.primary ? 'none' : '1px solid #007bff'};
  border-radius: 12px;
  padding: 0 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  min-width: 44px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.primary ? '#0056b3' : '#e9ecef'};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SelectedProductContainer = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProductImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
`;

const ProductName = styled.span`
  font-size: 14px;
  flex: 1;
  color: #333;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 16px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #dc3545;
    background: rgba(220, 53, 69, 0.1);
  }
`;

const ChatInput = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const { selectedProduct, setSelectedProduct } = useChat();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (message.trim() || selectedProduct) {
      onSend(message);
      setMessage('');
    }
  };

  const handleOpenProductSelector = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const event = new CustomEvent('openProductSelector');
    window.dispatchEvent(event);
  };

  const handleRemoveProduct = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedProduct(null);
  };

  const handleTextAreaClick = (e) => {
    e.stopPropagation();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(e);
    }
  };
  
  return (
    <InputContainer onClick={(e) => e.stopPropagation()}>
      <Form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        {selectedProduct && (
          <SelectedProductContainer onClick={(e) => e.stopPropagation()}>
            <ProductImage 
              src={selectedProduct.image || 'https://via.placeholder.com/30?text=Không+có+hình'} 
              alt={selectedProduct.name} 
              onClick={(e) => e.stopPropagation()}
            />
            <ProductName onClick={(e) => e.stopPropagation()}>{selectedProduct.name}</ProductName>
            <RemoveButton onClick={handleRemoveProduct} type="button">
              ✕
            </RemoveButton>
          </SelectedProductContainer>
        )}
        
        <InputWrapper onClick={(e) => e.stopPropagation()}>
          <TextArea
            rows="3"
            placeholder="Nhập tin nhắn của bạn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onClick={handleTextAreaClick}
            onKeyPress={handleKeyPress}
            onMouseDown={(e) => e.stopPropagation()}
          />
          
          <ButtonsWrapper onClick={(e) => e.stopPropagation()}>
            {/* <ActionButton 
              type="button" 
              onClick={handleOpenProductSelector}
              title="Đính kèm sản phẩm"
            >
              <FaPaperclip />
            </ActionButton> */}
            <ActionButton type="submit" primary title="Gửi" onClick={(e) => e.stopPropagation()}>
              <FaPaperPlane />
            </ActionButton>
          </ButtonsWrapper>
        </InputWrapper>
      </Form>
    </InputContainer>
  );
};

export default ChatInput;