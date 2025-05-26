import React, { createContext, useState, useContext, useEffect } from 'react';
import { createNewChat, sendMessageToChat, getChatContent, checkChatServiceHealth, sendMessageToStreamChat } from '../services/chatService';
import { useAuth } from './AuthContext';

// Constants
const SESSION_ID_KEY = 'chat_conversation_id';
const MAX_MESSAGES_PER_SESSION = 30;
const MESSAGE_COUNT_KEY = 'chat_message_count';
const IS_NEW_CHAT_KEY = 'chat_is_new_session';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationId, setConversationId] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState({});
  const [isNewChat, setIsNewChat] = useState(true);
  const [hasTriedLoadHistory, setHasTriedLoadHistory] = useState(false);
  const [historyLoadError, setHistoryLoadError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Load conversation_id và message_count từ localStorage khi khởi động
  useEffect(() => {
    const savedConversationId = localStorage.getItem(SESSION_ID_KEY);
    const savedMessageCount = parseInt(localStorage.getItem(MESSAGE_COUNT_KEY) || '0', 10);
    const savedIsNewChat = localStorage.getItem(IS_NEW_CHAT_KEY) === 'true';
    
    if (savedConversationId) {
      console.log('Khôi phục conversation_id từ localStorage:', savedConversationId);
      setConversationId(savedConversationId);
      setIsNewChat(savedIsNewChat);
      
      // Nếu đã có tin nhắn, không cần tải lại lịch sử
      if (messages.length === 0) {
        // Luôn gọi API để lấy lịch sử trò chuyện nếu có conversation_id
        loadChatHistory(savedConversationId);
      }
    } else {
      // Đánh dấu đã thử load (không có gì để load)
      setHasTriedLoadHistory(true);
    }
    
    if (savedMessageCount) {
      setMessageCount(savedMessageCount);
    }
  }, []);

  // Lưu conversation_id và message_count vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (conversationId) {
      console.log('Lưu conversation_id vào localStorage:', conversationId);
      localStorage.setItem(SESSION_ID_KEY, conversationId);
    }
    
    localStorage.setItem(MESSAGE_COUNT_KEY, messageCount.toString());
    localStorage.setItem(IS_NEW_CHAT_KEY, isNewChat.toString());
  }, [conversationId, messageCount, isNewChat]);

  // Hàm tải lịch sử trò chuyện từ backend
  const loadChatHistory = async (chatConversationId) => {
    try {
      setIsLoading(true);
      setHasTriedLoadHistory(true);
      setHistoryLoadError(null);
      
      const historyData = await getChatContent(chatConversationId);
      
      // Kiểm tra lỗi xác thực
      if (historyData.authError) {
        console.log('Lỗi xác thực khi tải lịch sử trò chuyện');
        setHistoryLoadError('auth');
        
        // Hiển thị thông báo lỗi xác thực và gợi ý đăng nhập lại
        const authErrorMessage = {
          id: Date.now(),
          text: "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục trò chuyện.",
          isUser: false,
          isError: true,
          isAuthError: true,
          avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
          isFirstMessage: true
        };
        
        setMessages([authErrorMessage]);
        // Xóa conversation_id trong localStorage để tạo mới khi đăng nhập lại
        localStorage.removeItem(SESSION_ID_KEY);
        setConversationId(null);
        setIsLoading(false);
        return;
      }
      
      if (historyData.error) {
        console.error('Lỗi khi tải lịch sử trò chuyện:', historyData.error);
        setHistoryLoadError('network');
        
        // Hiển thị tin nhắn lỗi với option tạo phiên mới
        const errorMessage = {
          id: Date.now(),
          text: "Không thể tải lịch sử trò chuyện. Bạn có muốn bắt đầu phiên mới không?",
          isUser: false,
          isError: true,
          needNewSession: true,
          avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
          isFirstMessage: true
        };
        setMessages([errorMessage]);
        setIsLoading(false);
        return;
      }
      
      if (historyData.messages && historyData.messages.length > 0) {
        // Giữ nguyên thứ tự tin nhắn từ API (tin nhắn cũ nhất trước, mới nhất sau)
        const orderedMessages = [...historyData.messages];
        
        // Chuyển đổi tin nhắn từ API thành định dạng hiển thị
        const formattedMessages = orderedMessages.flatMap((msg, index) => {
          const messages = [];
          
          // Thêm tin nhắn của người dùng
          const userMsgId = Date.now() + index * 2;
          messages.push({
            id: userMsgId,
            // Hỗ trợ cả định dạng mới (msg.content) và cũ (msg.user_message/question)
            text: msg.role === "user" ? msg.content : (msg.user_message || msg.question),
            isUser: true,
            avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp'
          });
          
          // Thêm tin nhắn của bot
          const botMsgId = Date.now() + index * 2 + 1;
          messages.push({
            id: botMsgId,
            // Hỗ trợ cả định dạng mới (msg.content) và cũ (msg.ai_response/answer)
            text: msg.role === "assistant" ? msg.content : (msg.ai_response || msg.answer),
            isUser: false,
            avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
            // Đánh dấu tin nhắn chào đầu tiên (tin nhắn đầu tiên trong danh sách)
            isFirstMessage: index === 0,
            // Thêm danh sách sản phẩm có sẵn từ API
            availableProducts: historyData.available_products || []
          });
          
          return messages;
        });
        
        // Cập nhật messages và messageCount
        setMessages(formattedMessages);
        setMessageCount(historyData.question_count || formattedMessages.length / 2);
        // Đánh dấu không phải phiên mới vì đã có lịch sử
        setIsNewChat(false);
        localStorage.setItem(IS_NEW_CHAT_KEY, 'false');
        console.log('✅ Đã tải thành công lịch sử trò chuyện:', formattedMessages.length, 'tin nhắn');
      } else {
        // Nếu không có tin nhắn từ API nhưng vẫn có conversation_id hợp lệ
        // Hiển thị tin nhắn chào mừng mà KHÔNG tạo conversation mới
        console.log('Session hợp lệ nhưng không có lịch sử trò chuyện, hiển thị tin nhắn chào mừng');
        createInitialWelcomeMessage();
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử trò chuyện:', error);
      setHistoryLoadError('network');
      
      // Kiểm tra lỗi xác thực
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setHistoryLoadError('auth');
        const authErrorMessage = {
          id: Date.now(),
          text: "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục trò chuyện.",
          isUser: false,
          isError: true,
          isAuthError: true,
          avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
          isFirstMessage: true
        };
        
        setMessages([authErrorMessage]);
        localStorage.removeItem(SESSION_ID_KEY);
        setConversationId(null);
      } else {
        // Hiển thị lỗi với option tạo phiên mới
        const errorMessage = {
          id: Date.now(),
          text: "Có lỗi khi tải lịch sử trò chuyện. Bạn có muốn bắt đầu phiên mới không?",
          isUser: false,
          isError: true,
          needNewSession: true,
          avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
          isFirstMessage: true
        };
        setMessages([errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Tạo tin nhắn chào mừng mà không cần gọi API
  const createInitialWelcomeMessage = () => {
    setIsLoading(true);
    
    // Tạo tin nhắn chào mừng mặc định
    const welcomeMessage = {
      id: Date.now(),
      text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
      isUser: false, 
      avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
      isFirstMessage: true
    };
    
    // Reset messages trước khi thêm tin nhắn chào mừng
    setMessages([welcomeMessage]);
    
    // Chỉ tăng unreadCount nếu chat box đang đóng
    if (!isOpen) {
      setUnreadCount(1);
    }
    
    // Reset similarProducts
    setSimilarProducts({});
    
    setIsLoading(false);
  };

  const createNewChatSession = async (shouldCallApi = true) => {
    try {
      setIsLoading(true);
      
      // Reset tất cả states
      setUnreadCount(0);
      setMessageCount(0);
      setIsNewChat(true);
      setHasTriedLoadHistory(true);
      setHistoryLoadError(null);
      localStorage.setItem(MESSAGE_COUNT_KEY, '0');
      localStorage.setItem(IS_NEW_CHAT_KEY, 'true');
      
      // Xóa conversation_id cũ
      localStorage.removeItem(SESSION_ID_KEY);
      setConversationId(null);
      
      // Reset messages và similarProducts
      setMessages([]);
      setSimilarProducts({});
      
      // Tạo conversation mới từ API
      if (shouldCallApi) {
        try {
          console.log('🔄 Tạo phiên chat mới...');
          const response = await createNewChat();
          
          // Kiểm tra nếu có lỗi xác thực (401/403)
          if (response.authError) {
            console.log('Lỗi xác thực khi tạo phiên chat mới');
            
            const authErrorMessage = {
              id: Date.now(),
              text: response.welcome_message || "Lỗi xác thực. Vui lòng đăng nhập lại để tiếp tục sử dụng dịch vụ chat.",
              isUser: false,
              isError: true,
              isAuthError: !isAuthenticated || !user,
              avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
              isFirstMessage: true
            };
            
            setMessages([authErrorMessage]);
            return;
          }
          
          if (response.conversation_id) {
            console.log('✅ Nhận conversation_id mới từ API:', response.conversation_id);
            localStorage.setItem(SESSION_ID_KEY, response.conversation_id);
            setConversationId(response.conversation_id);
            
            // Hiển thị welcome message từ API
            const welcomeMessage = {
              id: Date.now(),
              text: response.welcome_message || "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
              isUser: false,
              avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
              isFirstMessage: true
            };
            setMessages([welcomeMessage]);
          } else {
            console.log('❌ API không trả về conversation_id, lỗi kết nối');
            console.error('Chi tiết phản hồi từ API:', response);
            
            // Hiển thị tin nhắn lỗi
            const errorMessage = {
              id: Date.now(),
              text: "Không thể kết nối đến dịch vụ chat. Vui lòng thử lại sau.",
              isUser: false,
              isError: true,
              avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
              isFirstMessage: true
            };
            setMessages([errorMessage]);
          }
        } catch (error) {
          console.error('Lỗi khi gọi API tạo phiên chat mới:', error);
          
          // Hiển thị tin nhắn lỗi kết nối
          const errorMessage = {
            id: Date.now(),
            text: "Có lỗi xảy ra khi kết nối đến dịch vụ chat. Vui lòng thử lại sau.",
            isUser: false,
            isError: true,
            avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
            isFirstMessage: true
          };
          setMessages([errorMessage]);
        }
      } else {
        // Nếu không gọi API, hiển thị tin nhắn chào mừng mặc định
        const welcomeMessage = {
          id: Date.now(),
          text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
          isUser: false,
          avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
          isFirstMessage: true
        };
        setMessages([welcomeMessage]);
      }
      
      // Chỉ tăng unreadCount nếu chat box đang đóng
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

  // CẢI THIỆN: Logic mở chat với session management tốt hơn
  useEffect(() => {
    if (isOpen) {
      // Chỉ xử lý khi chat được mở và chưa có tin nhắn
      if (messages.length === 0 && !isLoading) {
        const savedConversationId = localStorage.getItem(SESSION_ID_KEY);
        
        if (savedConversationId && !hasTriedLoadHistory) {
          // Có conversation_id và chưa thử load lịch sử
          console.log('🔄 Phát hiện conversation_id, đang tải lịch sử:', savedConversationId);
          if (!conversationId) {
            setConversationId(savedConversationId);
          }
          loadChatHistory(savedConversationId);
        } else if (!savedConversationId && hasTriedLoadHistory) {
          // Không có conversation_id và đã thử load (hoặc không có gì để load)
          console.log('🆕 Không có conversation_id, tạo phiên mới');
          createNewChatSession(true);
        } else if (historyLoadError && hasTriedLoadHistory) {
          // Đã có lỗi load lịch sử, không làm gì thêm (để user tự quyết định)
          console.log('⚠️ Đã có lỗi load lịch sử, chờ user action');
        }
      }
    }
  }, [isOpen, messages.length, isLoading, hasTriedLoadHistory, historyLoadError]);

  const handleSendMessage = async (text) => {
    // Cải thiện validation để tránh empty messages
    if (!text || !text.trim()) {
      if (!selectedProduct) {
        console.log('⚠️ Không có text và không có selectedProduct, bỏ qua');
        return;
      }
    }

    // Đảm bảo không vượt quá giới hạn tin nhắn
    if (messageCount >= MAX_MESSAGES_PER_SESSION) {
      // Hiển thị thông báo và gợi ý tạo phiên mới
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

    // Chuẩn bị tin nhắn của người dùng
    const messageText = text ? text.trim() : '';
    const updatedMessages = [...messages];
    
    // Chỉ thêm user message nếu có text
    if (messageText) {
      const userMessage = {
        id: Date.now(),
        text: messageText,
        isUser: true,
        avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp'
      };
      updatedMessages.push(userMessage);
    }
    
    // Xử lý selectedProduct riêng biệt
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
    
    // Đảm bảo có ít nhất một tin nhắn được thêm
    if (updatedMessages.length === messages.length) {
      console.log('⚠️ Không có tin nhắn nào được thêm, bỏ qua');
      return;
    }
    
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Đây không còn là phiên chat mới nữa vì người dùng đã gửi tin nhắn
      setIsNewChat(false);
      localStorage.setItem(IS_NEW_CHAT_KEY, 'false');
      
      // Đảm bảo có conversation_id trước khi gửi tin nhắn
      let currentConversationId = conversationId;
      
      if (!currentConversationId) {
        console.log('Không có conversation_id, cần tạo phiên chat mới từ API');
        try {
          // Tạo phiên mới từ API
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
          
          // Hiển thị thông báo lỗi
          const errorMessage = {
            id: Date.now() + 10,
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
      
      // Tăng số lượng tin nhắn đã gửi
      const newMessageCount = messageCount + 1;
      setMessageCount(newMessageCount);
      localStorage.setItem(MESSAGE_COUNT_KEY, newMessageCount.toString());

      // Tạo tin nhắn bot placeholder để hiển thị streaming - với ID unique hơn
      const botMessageId = Date.now() + 100;
      const botMessage = {
        id: botMessageId,
        text: '',
        isUser: false,
        avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
        isStreaming: true
      };
      
      let currentMessages = [...updatedMessages, botMessage];
      setMessages(currentMessages);

      // Gửi tin nhắn đến API - sử dụng API thường để nhận availableProducts
      // Sử dụng messageText hoặc selectedProduct info
      const textToSend = messageText || (selectedProduct ? `Sản phẩm: ${selectedProduct.name}` : '');
      
      try {
        const response = await sendMessageToChat(currentConversationId, textToSend);
        
        if (response.authError) {
          // Xử lý lỗi xác thực
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            const botIndex = newMessages.findIndex(msg => msg.id === botMessageId);
            if (botIndex !== -1) {
              newMessages[botIndex] = {
                ...newMessages[botIndex],
                text: "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục trò chuyện.",
                isStreaming: false,
                isError: true,
                isAuthError: true,
                lastUpdated: Date.now()
              };
            }
            return newMessages;
          });
          return;
        }
        
        if (response.isError) {
          // Xử lý lỗi khác
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            const botIndex = newMessages.findIndex(msg => msg.id === botMessageId);
            if (botIndex !== -1) {
              newMessages[botIndex] = {
                ...newMessages[botIndex],
                text: response.ai_response || "Có lỗi xảy ra khi xử lý tin nhắn.",
                isStreaming: false,
                isError: true,
                lastUpdated: Date.now()
              };
            }
            return newMessages;
          });
          return;
        }
        
        // Xử lý response thành công
        console.log('🔍 ChatContext API Response:', response);
        console.log('🔍 Available Products từ API:', response.available_products);
        
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const botIndex = newMessages.findIndex(msg => msg.id === botMessageId);
          if (botIndex !== -1) {
            newMessages[botIndex] = {
              ...newMessages[botIndex],
              text: response.ai_response || "Không nhận được phản hồi",
              isStreaming: false,
              availableProducts: response.available_products || [],
              lastUpdated: Date.now()
            };
            
            // Kiểm tra nếu đã đạt giới hạn số câu hỏi
            if (newMessageCount >= MAX_MESSAGES_PER_SESSION) {
              console.log('Đã đạt giới hạn tin nhắn, hiển thị thông báo');
              newMessages[botIndex].isLimitReached = true;
              newMessages[botIndex].needNewSession = true;
            }
          }
          return newMessages;
        });

        // Cập nhật conversation_id nếu cần
        if (response.conversation_id && response.conversation_id !== currentConversationId) {
          console.log('Cập nhật conversation_id mới từ server:', response.conversation_id);
          setConversationId(response.conversation_id);
          localStorage.setItem(SESSION_ID_KEY, response.conversation_id);
        }

        // Tăng số lượng tin nhắn chưa đọc nếu chat box đang đóng
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
        }
        
      } catch (error) {
        console.error('Lỗi khi gửi tin nhắn:', error);
        
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const botIndex = newMessages.findIndex(msg => msg.id === botMessageId);
          if (botIndex !== -1) {
            let errorText = "Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.";
            
            // Kiểm tra loại lỗi để hiển thị thông báo phù hợp
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              errorText = "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại để tiếp tục trò chuyện.";
            }
            
            newMessages[botIndex] = {
              ...newMessages[botIndex],
              text: errorText,
              isStreaming: false,
              isError: true,
              isAuthError: error.response && (error.response.status === 401 || error.response.status === 403)
            };
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      
      // Xử lý lỗi và hiển thị thông báo lỗi
      const errorMessage = {
        id: Date.now() + 200,
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

  // Reset số lượng tin nhắn chưa đọc khi mở chat box
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const value = {
    isOpen,
    setIsOpen,
    messages,
    setMessages,
    unreadCount,
    setUnreadCount,
    conversationId,
    setConversationId,
    isLoading,
    handleSendMessage,
    createNewChatSession,
    selectedProduct,
    setSelectedProduct,
    similarProducts,
    isNewChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};