import React, { useRef, useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useChat } from '../../../context/ChatContext';
import ChatHeader from '../ChatHeader/ChatHeader';
import ChatInput from '../ChatInput/ChatInput';
import MessagesContainer from '../MessagesContainer/MessagesContainer';
import { 
  ChatContainer, 
  ChatHeader as ChatHeaderStyles, 
  ChatBody, 
  ChatFooter,
  CloseButton,
  ChatTitle,
  ChatInputContainer,
  ChatInput as ChatInputStyles,
  SendButton,
  LoadingIndicator,
  NewChatButton
} from './ChatWindow.styles';
import { FaTimes, FaChevronRight, FaArrowCircleUp, FaPlus } from 'react-icons/fa';

const Container = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 450px; /* Mở rộng từ 350px lên 450px */
  z-index: 1000;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  border-radius: 15px;
  background: white;
  overflow: hidden;
  opacity: ${props => props.isOpen ? 1 : 0};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(20px)'};
  transition: all 0.3s ease-in-out;
  pointer-events: ${props => props.isOpen ? 'all' : 'none'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

// Constants from ChatContext
const CONVERSATION_ID_KEY = 'chat_conversation_id';

const ChatWindow = () => {
  const { 
    isOpen, 
    setIsOpen, 
    messages, 
    isLoading, 
    handleSendMessage, 
    createNewChatSession,
    similarProducts,
    setConversationId
  } = useChat();
  
  const chatContainerRef = useRef();

  // Xử lý sự kiện click bên ngoài để đóng chat window
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Kiểm tra xem sự kiện click có xuất phát từ ChatButton không
      const isChatButtonClick = event.target.closest('button') && 
                               (event.target.closest('button').querySelector('svg') || 
                                event.target.tagName === 'svg' || 
                                event.target.closest('svg'));
      
      // Chỉ đóng khi click bên ngoài chat window, không phải từ chat button và chat window đang mở
      if (chatContainerRef.current && 
          !chatContainerRef.current.contains(event.target) && 
          !isChatButtonClick &&
          isOpen) {
        setIsOpen(false);
      }
    };
  
    // Thêm event listener khi component được mount và chat window đang mở
    if (isOpen) {
      // Sử dụng setTimeout để đảm bảo event listener được thêm sau khi DOM đã cập nhật
      setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick);
      }, 0);
    }
  
    // Cleanup event listener khi component unmount hoặc chat window đóng
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, setIsOpen]);

  const startNewChat = () => {
    // Xóa conversation_id từ localStorage để đảm bảo tạo phiên mới hoàn toàn
    localStorage.removeItem(CONVERSATION_ID_KEY);
    // Đặt conversationId trong state về null
    setConversationId(null);
    createNewChatSession(true);
  };

  return (
    <Container 
      isOpen={isOpen} 
      ref={chatContainerRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <ChatHeader 
        onClose={() => setIsOpen(false)} 
        onNewChat={startNewChat} 
      />
      <MessagesContainer 
        messages={messages} 
        isLoading={isLoading} 
        similarProducts={similarProducts}
      />
      <ChatInput onSend={handleSendMessage} />
    </Container>
  );
};

export default ChatWindow;