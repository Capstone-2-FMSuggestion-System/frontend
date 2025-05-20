import React, { createContext, useState, useContext, useEffect } from 'react';
import { createNewChat, sendMessageToChat, getChatContent, checkChatServiceHealth } from '../services/chatService';
import { useAuth } from './AuthContext';
import mockProducts from '../mock/products';

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
      // Chỉ tạo phiên chat mới khi KHÔNG có conversation_id trong localStorage
      // VÀ là lần đầu tiên mở ứng dụng (không phải refresh)
      // console.log('Không tìm thấy conversation_id trong localStorage, cần tạo mới trong lần mở chat đầu tiên');
      // QUAN TRỌNG: KHÔNG tạo conversation mới ở đây, chỉ tạo khi người dùng mở chat
      // createNewChatSession(true); - LOẠI BỎ DÒNG NÀY
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
      const historyData = await getChatContent(chatConversationId);
      
      // Kiểm tra lỗi xác thực
      if (historyData.authError) {
        console.log('Lỗi xác thực khi tải lịch sử trò chuyện');
        
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
        // QUAN TRỌNG: KHÔNG tạo conversation mới khi có lỗi, chỉ xóa loading
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
            // Đánh dấu tin nhắn chào đầu tiên (bây giờ là tin nhắn cuối sau khi đảo ngược)
            isFirstMessage: index === reversedMessages.length - 1
          });
          
          return messages;
        });
        
        // Cập nhật messages và messageCount
        setMessages(formattedMessages);
        setMessageCount(historyData.question_count || formattedMessages.length / 2);
        // Đánh dấu không phải phiên mới vì đã có lịch sử
        setIsNewChat(false);
        localStorage.setItem(IS_NEW_CHAT_KEY, 'false');
      } else {
        // Nếu không có tin nhắn từ API nhưng vẫn có conversation_id hợp lệ
        // Hiển thị tin nhắn chào mừng mà KHÔNG tạo conversation mới
        console.log('Session hợp lệ nhưng không có lịch sử trò chuyện, hiển thị tin nhắn chào mừng');
        createInitialWelcomeMessage();
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử trò chuyện:', error);
      
      // Kiểm tra lỗi xác thực
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
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
        // QUAN TRỌNG: KHÔNG tạo conversation mới khi có lỗi, chỉ hiển thị chào mừng
        createInitialWelcomeMessage();
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
      isFirstMessage: true // Đánh dấu là tin nhắn đầu tiên
    };
    
    // Reset messages trước khi thêm tin nhắn chào mừng
    setMessages([welcomeMessage]);
    
    // Chỉ tăng unreadCount nếu chat box đang đóng
    if (!isOpen) {
      setUnreadCount(1);
    }
    
    // Chỉ thêm sản phẩm gợi ý cho tin nhắn chào mừng nếu là phiên chat mới
    if (isNewChat) {
      const randomProducts = getRandomProducts(3);
      setSimilarProducts({
        [welcomeMessage.id]: randomProducts
      });
    } else {
      // Không thêm sản phẩm nếu không phải phiên chat mới
      setSimilarProducts({});
    }
    
    setIsLoading(false);
  };

  const createNewChatSession = async (shouldCallApi = true) => {
    try {
      setIsLoading(true);
      
      // Reset unreadCount và messageCount khi tạo cuộc trò chuyện mới
      setUnreadCount(0);
      setMessageCount(0);
      setIsNewChat(true); // Đánh dấu là phiên chat mới
      localStorage.setItem(MESSAGE_COUNT_KEY, '0');
      localStorage.setItem(IS_NEW_CHAT_KEY, 'true');
      
      // Tạo tin nhắn chào mừng mặc định
      const tempWelcomeMessage = {
        id: Date.now(),
        text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?",
        isUser: false, 
        avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
        isFirstMessage: true // Đánh dấu là tin nhắn đầu tiên
      };
      
      // Reset messages trước khi thêm tin nhắn chào mừng
      setMessages([tempWelcomeMessage]);
      
      // Thêm sản phẩm gợi ý ngẫu nhiên cho tin nhắn chào mừng vì là phiên chat mới
      const randomProducts = getRandomProducts(3);
      setSimilarProducts({
        [tempWelcomeMessage.id]: randomProducts
      });
      
      // Tạo conversation mới từ API
      if (shouldCallApi) {
        try {
          console.log('Gọi API tạo phiên mới');
          const response = await createNewChat();
          
          // Kiểm tra nếu có lỗi xác thực (401/403)
          if (response.authError) {
            console.log('Lỗi xác thực khi tạo phiên chat mới');
            
            // Nếu người dùng đã đăng nhập, hiển thị thông báo lỗi khác
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
              // Nếu chưa đăng nhập, hiển thị thông báo đăng nhập
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
            // Lưu conversation_id mới vào state và localStorage
            localStorage.setItem(SESSION_ID_KEY, response.conversation_id);
            setConversationId(response.conversation_id);
            
            // Cập nhật tin nhắn chào mừng nếu API trả về welcome_message
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
          // QUAN TRỌNG: Không tạo conversation_id tạm thời nữa, chỉ giữ trạng thái hiện tại
        }
      }
      
      // Chỉ tăng unreadCount nếu chat box đang đóng
      if (!isOpen) {
        setUnreadCount(1);
      }
    } catch (error) {
      console.error('Lỗi khi tạo phiên chat mới:', error);
      // Vẫn tạo tin nhắn chào mừng mặc định khi có lỗi
      createInitialWelcomeMessage();
    } finally {
      setIsLoading(false);
    }
  };

  // Lấy sản phẩm ngẫu nhiên từ mock data (chỉ sử dụng khi không có API)
  const getRandomProducts = (count = 3) => {
    const shuffled = [...mockProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Hiển thị một tin nhắn chào mừng khi mở khung chat và chưa có tin nhắn nào
  useEffect(() => {
    if (isOpen) {
      // Nếu chat được mở
      if (messages.length === 0) {
        // Và không có tin nhắn nào
        if (!isLoading) {
          // Và không đang tải
          const savedConversationId = localStorage.getItem(SESSION_ID_KEY);
          
          if (savedConversationId) {
            // Nếu có conversation_id trong localStorage và chưa được set vào state
            if (!conversationId) {
              console.log('Phát hiện conversation_id trong localStorage khi mở chat:', savedConversationId);
              setConversationId(savedConversationId);
              loadChatHistory(savedConversationId);
            }
          } else {
            // Nếu không có conversation_id trong localStorage và trong state, TẠO MỚI
            console.log('Không có conversation_id, tạo phiên mới khi mở chat lần đầu');
            createNewChatSession(true);
          }
        }
      }
    }
  }, [isOpen, messages.length, isLoading]);

  const handleSendMessage = async (text) => {
    if (!text.trim() && !selectedProduct) return;

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

    // Thêm tin nhắn của người dùng vào state
    const userMessage = {
      id: Date.now(),
      text,
      isUser: true,
      avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava2-bg.webp'
    };
    
    // Nếu có sản phẩm được chọn, thêm thông tin sản phẩm vào tin nhắn
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
      
      // Tăng số lượng tin nhắn đã gửi
      const newMessageCount = messageCount + 1;
      setMessageCount(newMessageCount);
      localStorage.setItem(MESSAGE_COUNT_KEY, newMessageCount.toString());

      // Gửi tin nhắn đến API với conversation_id hiện tại
      const response = await sendMessageToChat(currentConversationId, text);
      
      // Kiểm tra nếu có lỗi xác thực (401/403)
      if (response.authError) {
        console.log('Lỗi xác thực khi gửi tin nhắn');
        // Nếu người dùng đã đăng nhập, hiển thị thông báo lỗi khác
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
          // Nếu chưa đăng nhập, hiển thị thông báo đăng nhập
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
      
      // Kiểm tra và xử lý conversation_id từ server
      if (response.conversation_id) {
        // Chỉ cập nhật conversation_id nếu khác với conversation_id hiện tại
        if (response.conversation_id !== currentConversationId) {
          console.log('Cập nhật conversation_id mới từ server:', response.conversation_id);
          setConversationId(response.conversation_id);
          localStorage.setItem(SESSION_ID_KEY, response.conversation_id);
          // Reset message count khi nhận conversation_id mới từ server
          setMessageCount(1);
          localStorage.setItem(MESSAGE_COUNT_KEY, '1');
        }
      } else {
        console.log('Server không trả về conversation_id, giữ conversation_id hiện tại:', currentConversationId);
      }

      // Thêm phản hồi từ chatbot vào state
      const botMessage = {
        id: Date.now() + 2,
        // Sử dụng ai_response từ response cho tương thích với cấu trúc mới
        text: response.ai_response,
        isUser: false,
        avatar: 'https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3-bg.webp',
        created_at: response.created_at
      };
      
      // Kiểm tra nếu đã đạt giới hạn số câu hỏi
      if (newMessageCount >= MAX_MESSAGES_PER_SESSION) {
        console.log('Đã đạt giới hạn tin nhắn, hiển thị thông báo');
        botMessage.isLimitReached = true;
        botMessage.needNewSession = true;
      }
      
      const newMessages = [...updatedMessages, botMessage];
      setMessages(newMessages);

      // Tăng số lượng tin nhắn chưa đọc nếu chat box đang đóng
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      
      // Xử lý lỗi và hiển thị thông báo lỗi
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