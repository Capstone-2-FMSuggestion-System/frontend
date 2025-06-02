import React from 'react';
import { useChat } from '../../../context/ChatContext';
import { useAuth } from '../../../context/AuthContext';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';
import ProductList from '../ProductList/ProductList';
import { MessageContainer, Avatar, Message, NewSessionButton, ProcessingTime, MessageWrapper, TypingIndicator, TypingDot } from './ChatBubble.styles';

const ChatBubble = ({ message, isUser, avatar, isError, isAuthError, needNewSession, processingTime, isStreaming, availableProducts, productsTimestamp }) => {
  const { createNewChatSession } = useChat();
  const { logout } = useAuth();
  
  // Debug và validate available products - phải ở đầu component
  React.useEffect(() => {
    if (availableProducts && availableProducts.length > 0) {
      console.log('🔍 ChatBubble: Sản phẩm được truyền vào:', {
        count: availableProducts.length,
        products: availableProducts.map(p => ({
          id: p.id,
          product_id: p.product_id,
          name: p.name,
          hasCorrectStructure: !!(p.id && p.name && p.price)
        }))
      });
    }
  }, [availableProducts]);
  
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

  const handleImageError = (e) => {
    if (e) {
      e.stopPropagation();
      // Fallback avatar cho người dùng hoặc bot
      const fallbackAvatar = isUser 
        ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMTgiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj4KICA8cGF0aCBkPSJNMTIgMmMxLjEgMCAyIC45IDIgMnMtLjkgMi0yIDItMi0uOS0yLTIgLjktMiAyLTJ6bTkgOXYtMmwtNi00djNoLTZ2LTNsLTYgNHYyaDIxem0tMyAyaC0xMmMtLjU1IDAtMSAuNDUtMSAxdjdjMCAuNTUuNDUgMSAxIDFoMTJjLjU1IDAgMS0uNDUgMS0xdi03YzAtLjU1LS40NS0xLTEtMXoiLz4KPC9zdmc+Cjwvc3ZnPgo8L3N2Zz4K'
        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMTgiIGZpbGw9IiM0Mjg1RjQiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj4KICA8cGF0aCBkPSJNOSAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo8L3N2Zz4K';
      e.target.src = fallbackAvatar;
    }
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
        src={avatar || (isUser 
          ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMTgiIGZpbGw9IiM2NjdlZWEiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj4KICA8cGF0aCBkPSJNMTIgMmMxLjEgMCAyIC45IDIgMnMtLjkgMi0yIDItMi0uOS0yLTIgLjktMiAyLTJ6bTkgOXYtMmwtNi00djNoLTZ2LTNsLTYgNHYyaDIxem0tMyAyaC0xMmMtLjU1IDAtMSAuNDUtMSAxdjdjMCAuNTUuNDUgMSAxIDFoMTJjLjU1IDAgMS0uNDUgMS0xdi03YzAtLjU1LS40NS0xLTEtMXoiLz4KPC9zdmc+Cjwvc3ZnPgo8L3N2Zz4K'
          : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMTgiIGZpbGw9IiM0Mjg1RjQiLz4KPHN2ZyB4PSI2IiB5PSI2IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iY3VycmVudENvbG9yIj4KICA8cGF0aCBkPSJNOSAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo8L3N2Zz4K'
        )} 
        isUser={isUser} 
        onClick={handleAvatarClick} 
        onLoad={handleImageLoad}
        onError={handleImageError}
        onMouseDown={handleClick}
        alt={isUser ? "User Avatar" : "Bot Avatar"}
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