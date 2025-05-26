import React, { useRef, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import ChatBubble from '../ChatBubble/ChatBubble';
import ProductBubble from '../ProductBubble/ProductBubble';
import SimilarProducts from '../SimilarProducts/SimilarProducts';
import {
  Container,
  LoadingContainer,
  TypingIndicator,
  TypingAvatar,
  TypingDots,
  Dot,
  EmptyStateMessage
} from './MessagesContainer.styles';

const MessagesContainer = ({ messages, isLoading, similarProducts }) => {
  const messagesEndRef = useRef();
  const containerRef = useRef();
  
  // Cuộn đến tin nhắn cuối khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);
  
  // Thêm event listener cho tất cả sự kiện chuột
  useEffect(() => {
    const stopPropagation = (e) => {
      // KHÔNG chặn events từ ProductList buttons
      if (e.target.closest('.product-list-container') || 
          e.target.tagName === 'BUTTON' || 
          e.target.closest('button')) {
        console.log('🚫 MessagesContainer: Không chặn event từ ProductList/Button');
        return;
      }
      e.stopPropagation();
    };

    const container = containerRef.current;
    if (container) {
      // Bắt tất cả sự kiện có thể gây ra đóng cửa sổ
      container.addEventListener('click', stopPropagation, true);
      container.addEventListener('mousedown', stopPropagation, true);
      container.addEventListener('mouseup', stopPropagation, true);
      container.addEventListener('touchstart', stopPropagation, true);
      container.addEventListener('touchend', stopPropagation, true);
      container.addEventListener('pointerdown', stopPropagation, true);
      container.addEventListener('pointerup', stopPropagation, true);
    }

    return () => {
      if (container) {
        container.removeEventListener('click', stopPropagation, true);
        container.removeEventListener('mousedown', stopPropagation, true);
        container.removeEventListener('mouseup', stopPropagation, true);
        container.removeEventListener('touchstart', stopPropagation, true);
        container.removeEventListener('touchend', stopPropagation, true);
        container.removeEventListener('pointerdown', stopPropagation, true);
        container.removeEventListener('pointerup', stopPropagation, true);
      }
    };
  }, []);
  
  const handleContainerClick = (e) => {
    // KHÔNG chặn events từ ProductList buttons
    if (e.target.closest('.product-list-container') || 
        e.target.tagName === 'BUTTON' || 
        e.target.closest('button')) {
      console.log('🚫 MessagesContainer handleContainerClick: Không chặn event từ ProductList/Button');
      return;
    }
    e.stopPropagation(); // Ngăn sự kiện lan toả lên
    e.preventDefault(); // Ngăn hành vi mặc định
  };
  
  const handleAllEvents = (e) => {
    // KHÔNG chặn events từ ProductList buttons
    if (e && (e.target.closest('.product-list-container') || 
              e.target.tagName === 'BUTTON' || 
              e.target.closest('button'))) {
      console.log('🚫 MessagesContainer handleAllEvents: Không chặn event từ ProductList/Button');
      return;
    }
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
  };
  
  // Kiểm tra xem một tin nhắn có nên hiển thị sản phẩm gợi ý hay không
  const shouldShowSimilarProducts = (message) => {
    // Chỉ hiển thị sản phẩm gợi ý cho tin nhắn bot (không phải tin nhắn người dùng)
    if (message.isUser) return false;
    
    // Luôn hiển thị nếu là tin nhắn đầu tiên
    if (message.isFirstMessage) return true;
    
    // Hiển thị nếu có sản phẩm gợi ý từ server
    return similarProducts && similarProducts[message.id] && similarProducts[message.id].length > 0;
  };
  
  return (
    <Container 
      onClick={handleContainerClick}
      onMouseDown={handleAllEvents}
      onMouseUp={handleAllEvents}
      onTouchStart={handleAllEvents}
      onTouchEnd={handleAllEvents}
      onPointerDown={handleAllEvents}
      onPointerUp={handleAllEvents}
      ref={containerRef}
    >
      {messages && messages.length > 0 ? (
        messages.map((msg, index) => (
          <React.Fragment key={msg.id}>
            {msg.isProduct ? (
              <ProductBubble
                product={msg.product}
                isUser={msg.isUser}
                avatar={msg.avatar}
              />
            ) : (
              <ChatBubble
                message={msg.text}
                isUser={msg.isUser}
                avatar={msg.avatar}
                isError={msg.isError}
                isAuthError={msg.isAuthError}
                needNewSession={msg.needNewSession}
                processingTime={msg.processingTime}
                isStreaming={msg.isStreaming}
                availableProducts={msg.availableProducts}
                productsTimestamp={msg.productsTimestamp}
              />
            )}
            
            {/* Chỉ hiển thị sản phẩm tương tự trong một số trường hợp cụ thể */}
            {shouldShowSimilarProducts(msg) && similarProducts && similarProducts[msg.id] && (
              <SimilarProducts 
                products={similarProducts[msg.id]} 
                messageId={msg.id}
              />
            )}
          </React.Fragment>
        ))
      ) : (
        <EmptyStateMessage>
          Chào mừng bạn đến với dịch vụ hỗ trợ trực tuyến của chúng tôi. Tin nhắn sẽ hiển thị ở đây.
        </EmptyStateMessage>
      )}
      
      {/* Typing indicator đã được chuyển vào ChatBubble với isStreaming */}
      
      <div ref={messagesEndRef} />
    </Container>
  );
};

export default MessagesContainer; 