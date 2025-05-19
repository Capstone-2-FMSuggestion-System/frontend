# Chi tiết triển khai kết nối @frontend với @base_chat

Tài liệu này cung cấp các chi tiết kỹ thuật và đoạn mã nguồn cụ thể về việc triển khai kết nối giữa `@frontend` và `@base_chat`.

## 1. Cấu hình môi trường

### Cập nhật file `.env`

```
# Thêm biến môi trường cho BASE_CHAT
REACT_APP_BASE_CHAT_API_URL=http://localhost:8002/api
```

## 2. Cập nhật Service API

### `chatService.js`

```javascript
import api from './api';
import Cookies from 'js-cookie';
import { TOKEN_STORAGE } from './authService';

// URL của base_chat API, lấy từ biến môi trường hoặc mặc định
const BASE_CHAT_API_URL = process.env.REACT_APP_BASE_CHAT_API_URL || 'http://localhost:8002/api';

const chatApi = api.create({
  baseURL: BASE_CHAT_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor để gắn token vào mỗi request
chatApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_STORAGE.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token available for base_chat API request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tạo cuộc trò chuyện mới
export const createNewChat = async () => {
  try {
    const response = await chatApi.post('/newChat');
    return response.data;
  } catch (error) {
    console.error('Error creating new chat:', error);
    // Xử lý lỗi xác thực
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return {
        authError: true,
        welcome_message: "Bạn cần đăng nhập để sử dụng tính năng chat. Vui lòng đăng nhập hoặc tạo tài khoản mới."
      };
    }
    return {
      error: true,
      message: 'Không thể kết nối đến dịch vụ chat'
    };
  }
};

// Gửi tin nhắn đến cuộc trò chuyện
export const sendMessageToChat = async (conversation_id, message) => {
  try {
    const response = await chatApi.post('/chat', {
      conversation_id,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    // Xử lý lỗi xác thực
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return {
        authError: true,
        ai_response: "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục trò chuyện."
      };
    }
    throw error;
  }
};

// Lấy nội dung cuộc trò chuyện
export const getChatContent = async (conversation_id) => {
  try {
    const response = await chatApi.get(`/chatContent?conversation_id=${conversation_id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting chat content:', error);
    return {
      error: true,
      message: 'Không thể tải lịch sử trò chuyện'
    };
  }
};

// Kiểm tra trạng thái dịch vụ chat
export const checkChatServiceHealth = async () => {
  try {
    const response = await chatApi.get('/llm/status');
    return response.data;
  } catch (error) {
    console.error('Error checking chat service health:', error);
    return {
      service_available: false,
      model_available: false,
      model_message: 'Không thể kết nối đến dịch vụ chat'
    };
  }
};
```

## 3. Cập nhật ChatContext

### `ChatContext.js` - Cập nhật imports

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { createNewChat, sendMessageToChat, getChatContent, checkChatServiceHealth } from '../services/chatService';
import { useAuth } from './AuthContext';
import mockProducts from '../mock/products';

// Constants
const SESSION_ID_KEY = 'chat_conversation_id'; // Đổi tên key localStorage 
```

### Cập nhật hàm loadChatHistory

```javascript
const loadChatHistory = async (chatConversationId) => {
  try {
    setIsLoading(true);
    const historyData = await getChatContent(chatConversationId);
    
    if (historyData.error) {
      console.error('Lỗi khi tải lịch sử trò chuyện:', historyData.error);
      setIsLoading(false);
      return;
    }
    
    if (historyData.messages && historyData.messages.length > 0) {
      // Đảo ngược mảng tin nhắn để tin nhắn cũ nhất ở dưới cùng
      const reversedMessages = [...historyData.messages].reverse();
      
      // Chuyển đổi tin nhắn từ API thành định dạng hiển thị
      const formattedMessages = reversedMessages.flatMap((msg, index) => {
        const messages = [];
        
        // Thêm tin nhắn của người dùng
        const userMsgId = Date.now() + index * 2;
        messages.push({
          id: userMsgId,
          text: msg.user_message || msg.question,
          isUser: true,
          avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp'
        });
        
        // Thêm tin nhắn của bot
        const botMsgId = Date.now() + index * 2 + 1;
        messages.push({
          id: botMsgId,
          text: msg.ai_response || msg.answer,
          isUser: false,
          avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
          isFirstMessage: index === reversedMessages.length - 1
        });
        
        return messages;
      });
      
      // Cập nhật messages và messageCount
      setMessages(formattedMessages);
      setMessageCount(historyData.question_count || formattedMessages.length / 2);
      setIsNewChat(false);
      localStorage.setItem(IS_NEW_CHAT_KEY, 'false');
    } else {
      // Hiển thị tin nhắn chào mừng mà KHÔNG tạo conversation mới
      createInitialWelcomeMessage();
    }
  } catch (error) {
    console.error('Lỗi khi tải lịch sử trò chuyện:', error);
    createInitialWelcomeMessage();
  } finally {
    setIsLoading(false);
  }
};
```

### Cập nhật hàm createNewChatSession

```javascript
const createNewChatSession = async (shouldCallApi = true) => {
  try {
    setIsLoading(true);
    
    setUnreadCount(0);
    setMessageCount(0);
    setIsNewChat(true);
    localStorage.setItem(MESSAGE_COUNT_KEY, '0');
    localStorage.setItem(IS_NEW_CHAT_KEY, 'true');
    
    // Tạo tin nhắn chào mừng mặc định
    const tempWelcomeMessage = {
      id: Date.now(),
      text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
      isUser: false, 
      avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
      isFirstMessage: true
    };
    
    setMessages([tempWelcomeMessage]);
    
    // Thêm sản phẩm gợi ý ngẫu nhiên cho tin nhắn chào mừng
    const randomProducts = getRandomProducts(3);
    setSimilarProducts({
      [tempWelcomeMessage.id]: randomProducts
    });
    
    if (shouldCallApi) {
      try {
        console.log('Gọi API tạo phiên mới');
        const response = await createNewChat();
        
        if (response.authError) {
          console.log('Lỗi xác thực khi tạo phiên chat mới');
          
          if (isAuthenticated && user) {
            const authErrorMessage = {
              id: tempWelcomeMessage.id,
              text: "Đã xảy ra lỗi khi kết nối đến dịch vụ chat. Vui lòng thử lại sau.",
              isUser: false,
              isError: true,
              avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
              isFirstMessage: true
            };
            
            setMessages([authErrorMessage]);
          } else {
            // Thông báo đăng nhập nếu chưa đăng nhập
            const authErrorMessage = {
              id: tempWelcomeMessage.id,
              text: response.welcome_message || "Bạn không có quyền truy cập vào chức năng này. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.",
              isUser: false,
              isError: true,
              isAuthError: true,
              avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
              isFirstMessage: true
            };
            
            setMessages([authErrorMessage]);
          }
          return;
        }
        
        if (response.conversation_id) {
          console.log('Nhận conversation_id mới từ API:', response.conversation_id);
          localStorage.setItem(SESSION_ID_KEY, response.conversation_id);
          setConversationId(response.conversation_id);
          
          if (response.welcome_message) {
            const welcomeMessage = {
              id: tempWelcomeMessage.id,
              text: response.welcome_message,
              isUser: false,
              avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
              isFirstMessage: true
            };
            setMessages([welcomeMessage]);
          }
        } else {
          console.log('API không trả về conversation_id, lỗi kết nối');
          console.error('Chi tiết phản hồi từ API:', response);
        }
      } catch (error) {
        console.error('Lỗi khi gọi API tạo phiên chat mới:', error);
      }
    }
    
    if (!isOpen) {
      setUnreadCount(1);
    }
  } catch (error) {
    console.error('Lỗi khi tạo phiên chat mới:', error);
    createInitialWelcomeMessage();
  } finally {
    setIsLoading(false);
  }
};
```

### Cập nhật hàm handleSendMessage

```javascript
const handleSendMessage = async (text) => {
  if (!text.trim() && !selectedProduct) return;

  // Kiểm tra giới hạn tin nhắn
  if (messageCount >= MAX_MESSAGES_PER_SESSION) {
    const limitMessage = {
      id: Date.now(),
      text: "Bạn đã đạt giới hạn 30 câu hỏi cho phiên trò chuyện này. Vui lòng bắt đầu phiên mới để tiếp tục.",
      isUser: false,
      isError: true,
      needNewSession: true,
      avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp'
    };
    setMessages([...messages, limitMessage]);
    return;
  }

  // Thêm tin nhắn người dùng
  const userMessage = {
    id: Date.now(),
    text,
    isUser: true,
    avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp'
  };
  
  const updatedMessages = [...messages, userMessage];
  if (selectedProduct) {
    const productMessage = {
      id: Date.now() + 1,
      product: selectedProduct,
      isUser: true,
      isProduct: true,
      avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp'
    };
    updatedMessages.push(productMessage);
    setSelectedProduct(null);
  }
  
  setMessages(updatedMessages);
  setIsLoading(true);

  try {
    setIsNewChat(false);
    localStorage.setItem(IS_NEW_CHAT_KEY, 'false');
    
    let currentConversationId = conversationId;
    
    if (!currentConversationId) {
      console.log('Không có conversation_id, cần tạo phiên chat mới từ API');
      try {
        const response = await createNewChat();
        
        if (response.conversation_id) {
          currentConversationId = response.conversation_id;
          setConversationId(currentConversationId);
          localStorage.setItem(SESSION_ID_KEY, currentConversationId);
          console.log('Đã tạo conversation_id mới từ API:', currentConversationId);
        } else {
          console.error('Không thể tạo conversation_id mới từ API');
          throw new Error('Không thể tạo conversation_id mới');
        }
      } catch (error) {
        console.error('Lỗi khi tạo conversation_id mới:', error);
        
        const errorMessage = {
          id: Date.now() + 2,
          text: "Xin lỗi, đã xảy ra lỗi khi kết nối đến dịch vụ chat. Vui lòng thử lại sau.",
          isUser: false,
          isError: true,
          avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp'
        };
        
        setMessages([...updatedMessages, errorMessage]);
        setIsLoading(false);
        return;
      }
    }

    console.log('Gửi tin nhắn với conversation_id:', currentConversationId);
    
    const newMessageCount = messageCount + 1;
    setMessageCount(newMessageCount);
    localStorage.setItem(MESSAGE_COUNT_KEY, newMessageCount.toString());

    // Gửi tin nhắn đến API
    const response = await sendMessageToChat(currentConversationId, text);
    
    // Kiểm tra lỗi xác thực
    if (response.authError) {
      console.log('Lỗi xác thực khi gửi tin nhắn');
      if (isAuthenticated && user) {
        const authErrorMessage = {
          id: Date.now() + 2,
          text: "Đã xảy ra lỗi khi kết nối đến dịch vụ chat. Vui lòng thử lại sau.",
          isUser: false,
          isError: true,
          avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp'
        };
        setMessages([...updatedMessages, authErrorMessage]);
      } else {
        const authErrorMessage = {
          id: Date.now() + 2,
          text: response.ai_response || "Bạn không có quyền truy cập vào chức năng này. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.",
          isUser: false,
          isError: true,
          isAuthError: true,
          avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp'
        };
        setMessages([...updatedMessages, authErrorMessage]);
      }
      return;
    }
    
    // Xử lý conversation_id từ response
    if (response.conversation_id) {
      if (response.conversation_id !== currentConversationId) {
        console.log('Cập nhật conversation_id mới từ server:', response.conversation_id);
        setConversationId(response.conversation_id);
        localStorage.setItem(SESSION_ID_KEY, response.conversation_id);
        setMessageCount(1);
        localStorage.setItem(MESSAGE_COUNT_KEY, '1');
      }
    }

    // Thêm phản hồi từ chatbot
    const botMessage = {
      id: Date.now() + 2,
      text: response.ai_response,
      isUser: false,
      avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
      created_at: response.created_at
    };
    
    if (newMessageCount >= MAX_MESSAGES_PER_SESSION) {
      console.log('Đã đạt giới hạn tin nhắn, hiển thị thông báo');
      botMessage.isLimitReached = true;
      botMessage.needNewSession = true;
    }
    
    const newMessages = [...updatedMessages, botMessage];
    setMessages(newMessages);

    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
    }
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn:', error);
    
    const errorMessage = {
      id: Date.now() + 2,
      text: "Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.",
      isUser: false,
      isError: true,
      avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp'
    };
    
    setMessages([...updatedMessages, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};
```

## 4. Cập nhật ChatWindow.js

```javascript
// Constants from ChatContext
const CONVERSATION_ID_KEY = 'chat_conversation_id';

const startNewChat = () => {
  // Xóa conversation_id từ localStorage để đảm bảo tạo phiên mới hoàn toàn
  localStorage.removeItem(CONVERSATION_ID_KEY);
  // Đặt conversationId trong state về null
  setConversationId(null);
  createNewChatSession(true);
};
```

## 5. Quản lý cấu hình và chạy hệ thống

### File cấu hình kết nối services

```
# @backend               -> http://localhost:8000
# @base_chat             -> http://localhost:8002
# @frontend (React)      -> http://localhost:3000
```

### Quy trình khởi động toàn bộ hệ thống

1. Khởi động @backend:
   ```
   cd ../backend
   python3 main.py
   ```

2. Khởi động @base_chat:
   ```
   cd ../base_chat
   python3 main.py
   ```

3. Khởi động @frontend:
   ```
   cd frontend
   npm start
   ```

## 6. Điểm lưu ý và giải pháp tiềm ẩn

### Quản lý token

Hệ thống sử dụng cookies để lưu trữ token JWT. Khi người dùng đăng nhập qua @backend, token được lưu vào cookies và sau đó được chatService truy xuất và gửi trong header Authorization.

### Xử lý token hết hạn

```javascript
const authErrorMessage = {
  id: Date.now() + 2,
  text: response.ai_response || "Bạn không có quyền truy cập vào chức năng này. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.",
  isUser: false,
  isError: true,
  isAuthError: true,
  avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp'
};
setMessages([...updatedMessages, authErrorMessage]);
```

### Kiểm tra trạng thái máy chủ

```javascript
const healthStatus = await checkChatServiceHealth();
if (!healthStatus.service_available) {
  // Hiển thị thông báo lỗi kết nối
}
```

## 7. Hiệu năng và tối ưu hóa

1. **Tránh gọi API không cần thiết**
   - Không tạo cuộc trò chuyện mới khi khởi động, chỉ tạo khi người dùng tương tác
   - Sử dụng localStorage để lưu trữ conversation_id

2. **Xử lý lỗi**
   - Mỗi API call đều được bao bọc trong try/catch
   - Cung cấp thông báo lỗi hữu ích
   - Xử lý riêng cho lỗi xác thực (401/403)

3. **Quản lý state**
   - Sử dụng Context API cho quản lý state chat
   - Cache lại conversation_id và message_count trong localStorage 