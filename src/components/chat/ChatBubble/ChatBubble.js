import React from 'react';
import { useChat } from '../../../context/ChatContext';
import { useAuth } from '../../../context/AuthContext';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';
import ProductList from '../ProductList/ProductList';
import { MessageContainer, Avatar, Message, NewSessionButton, ProcessingTime, MessageWrapper, TypingIndicator, TypingDot } from './ChatBubble.styles';

const ChatBubble = ({ message, isUser, avatar, isError, isAuthError, needNewSession, processingTime, isStreaming, availableProducts, productsTimestamp }) => {
  const { createNewChatSession } = useChat();
  const { logout } = useAuth();
  
  // Validation: Không render nếu message trống và không phải streaming
  if (!isStreaming && !message && !isError && !needNewSession && !isAuthError) {
    console.log('⚠️ ChatBubble: Message trống, không render');
    return null;
  }
  
  const handleClick = (e) => {
    // Không chặn events từ ProductList và buttons
    if (e && (
      e.target.closest('.product-list-container') ||
      e.target.tagName === 'BUTTON' ||
      e.target.closest('button')
    )) {
      console.log('🚫 ChatBubble: Không chặn event từ ProductList/Button');
      return;
    }
    if (e) {
      e.preventDefault();
      e.stopPropagation();
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
    localStorage.removeItem('chat_conversation_id');
    createNewChatSession();
  };
  
  const handleLoginAgainClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
              <>
                <MarkdownRenderer content={message} />
                {/* Debug log để theo dõi available products */}
                {(() => {
                  if (availableProducts && availableProducts.length > 0) {
                    console.log('🔍 ChatBubble: Hiển thị', availableProducts.length, 'sản phẩm có sẵn');
                  }
                  return null;
                })()}
                {/* Hiển thị danh sách sản phẩm ngay sau nội dung tin nhắn */}
                {availableProducts && availableProducts.length > 0 && (
                  <ProductList 
                    key={`products-${productsTimestamp || Date.now()}`}
                    products={availableProducts}
                    onViewDetail={(product) => {
                      const productId = product.product_id || product.id;
                      console.log('🔍 ChatBubble onViewDetail:', { product, productId });
                      window.open(`/products/${productId}`, '_blank');
                    }}
                  />
                )}
              </>
            ) : (
              message
            )
          )}
        </Message>
        
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