import React from 'react';
import { useChat } from '../../../context/ChatContext';
import { useAuth } from '../../../context/AuthContext';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';
import ProductList from '../ProductList/ProductList';
import { MessageContainer, Avatar, Message, NewSessionButton, ProcessingTime, MessageWrapper, TypingIndicator, TypingDot } from './ChatBubble.styles';

const ChatBubble = ({ message, isUser, avatar, isError, isAuthError, needNewSession, processingTime, isStreaming, availableProducts }) => {
  const { createNewChatSession } = useChat();
  const { logout } = useAuth();
  
  // Validation: Không render nếu message trống và không phải streaming
  if (!isStreaming && !message && !isError && !needNewSession && !isAuthError) {
    console.log('⚠️ ChatBubble: Message trống, không render');
    return null;
  }
  
  const handleClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Ngăn sự kiện lan toả lên
    }
  };

  const handleImageLoad = (e) => {
    if (e) e.stopPropagation();
  };

  const handleAvatarClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  
  const handleNewSessionClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Xóa session_id khỏi localStorage (sử dụng đúng key)
    localStorage.removeItem('chat_conversation_id');
    createNewChatSession();
  };
  
  const handleLoginAgainClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Đăng xuất người dùng hiện tại và chuyển hướng đến trang đăng nhập
    logout();
    window.location.href = '/login';
  };

  return (
    <MessageContainer isUser={isUser} onClick={handleClick} onMouseDown={handleClick}>
      <Avatar 
        src={avatar} 
        isUser={isUser} 
        onClick={handleAvatarClick} 
        onLoad={handleImageLoad}
        onMouseDown={handleClick}
      />
      <MessageWrapper>
        <Message 
          isUser={isUser} 
          data-is-error={isError} 
          onClick={handleClick}
          onMouseDown={handleClick}
        >
          {isStreaming && !isUser && !message ? (
            <TypingIndicator>
              <TypingDot delay={0} />
              <TypingDot delay={0.2} />
              <TypingDot delay={0.4} />
            </TypingIndicator>
          ) : (
            !isUser && message ? (
              <MarkdownRenderer content={message} />
            ) : (
              message
            )
          )}
        </Message>
        
        {/* Hiển thị danh sách sản phẩm có sẵn nếu có */}
        {console.log('🔍 ChatBubble availableProducts:', availableProducts)}
        {availableProducts && availableProducts.length > 0 && !isUser && (
          <ProductList 
            products={availableProducts}
            onViewDetail={(product) => {
              // Mở trang chi tiết sản phẩm trong tab mới
              window.open(`/products/${product.id}`, '_blank');
            }}
          />
        )}
        
        {processingTime && !isUser && (
          <ProcessingTime isUser={isUser}>
            Phản hồi trong {processingTime.toFixed(2)}s
          </ProcessingTime>
        )}
        
        {needNewSession && !isUser && (
          <NewSessionButton 
            onClick={handleNewSessionClick}
            onMouseDown={handleClick}
          >
            Bắt đầu phiên mới
          </NewSessionButton>
        )}
        
        {isAuthError && !isUser && (
          <NewSessionButton 
            onClick={handleLoginAgainClick}
            onMouseDown={handleClick}
            style={{ backgroundColor: '#dc3545' }}
          >
            Đăng nhập lại
          </NewSessionButton>
        )}
      </MessageWrapper>
    </MessageContainer>
  );
};

export default ChatBubble;