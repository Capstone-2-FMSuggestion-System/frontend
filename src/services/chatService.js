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

// Biến để theo dõi trạng thái logout để tránh hiển thị nhiều thông báo
let isHandlingAuthError = false;

// Interceptor để gắn token vào mỗi request
chatApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_STORAGE.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('Token added to base_chat API request:', config.url); // Bỏ comment nếu cần debug
    } else {
      console.warn('No token available for base_chat API request:', config.url);
      // Tùy chọn: có thể cancel request hoặc throw error nếu token là bắt buộc
      // return Promise.reject(new Error("No authentication token available"));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi phản hồi
chatApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Ghi log chi tiết hơn về lỗi
    const errorDetails = {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    };
    
    console.error('Base_chat API error:', errorDetails);
    
    // Xử lý lỗi 401 (Unauthorized) hoặc 403 (Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Tránh hiển thị nhiều thông báo cùng lúc
      if (!isHandlingAuthError) {
        isHandlingAuthError = true;
        
        console.error('Authentication error with @base_chat: Token might be invalid or expired.');
        
        // Xóa token hiện tại vì nó không hợp lệ
        Cookies.remove(TOKEN_STORAGE.ACCESS_TOKEN);
        
        // Xóa ID cuộc trò chuyện trong localStorage để tạo mới khi đăng nhập lại
        localStorage.removeItem('chat_conversation_id');
        
        // Thông báo cho người dùng về việc cần đăng nhập lại
        // Nếu trang có hàm logout toàn cục, gọi nó ở đây
        // window.dispatchEvent(new Event('AUTHENTICATION_ERROR'));
        
        // Sau 2 giây, cho phép hiển thị thông báo mới
        setTimeout(() => {
          isHandlingAuthError = false;
        }, 2000);
      }
    }
    
    // Tiếp tục reject error để các hàm gọi API có thể xử lý chi tiết
    return Promise.reject(error);
  }
);

// Tạo cuộc trò chuyện mới - Kết nối với /api/newChat của @base_chat
// API Doc: POST /api/newChat -> Response: NewChatResponse { conversation_id, user_id, created_at, welcome_message }
export const createNewChat = async () => {
  try {
    const response = await chatApi.post('/newChat', {});
    console.log('New chat created with @base_chat:', response.data);
    // response.data should match NewChatResponse
    return {
      conversation_id: response.data.conversation_id,
      user_id: response.data.user_id,
      created_at: response.data.created_at,
      welcome_message: response.data.welcome_message || "Xin chào! Tôi có thể giúp gì cho bạn?",
      // Giữ lại message này cho frontend nếu cần, hoặc tạo từ welcome_message
      message: response.data.welcome_message ? "Phiên chat mới đã được tạo." : "Đã tạo phiên chat, không có tin nhắn chào mừng."
    };
  } catch (error) {
    console.error('Lỗi khi tạo phiên chat mới với @base_chat:', error);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return {
        conversation_id: null,
        welcome_message: "Lỗi xác thực hoặc không có quyền. Vui lòng đăng nhập lại.",
        authError: true,
        isError: true
      };
    }
    return {
      conversation_id: null,
      welcome_message: "Có lỗi xảy ra khi tạo cuộc trò chuyện mới. Vui lòng thử lại.",
      isError: true
    };
  }
};

// Gửi tin nhắn - Kết nối với /api/chat của @base_chat
// API Doc: POST /api/chat -> Request: ChatRequest { message: string, conversation_id: Optional[int] }
// API Doc: Response: ChatResponse { conversation_id, user_message: Dict[str, str], assistant_message: Dict[str, str] }
export const sendMessageToChat = async (conversationId, userMessage) => {
  try {
    if (!conversationId) {
      console.error("sendMessageToChat: conversationId is required.");
      return {
        ai_response: "Lỗi: Không có ID cuộc trò chuyện. Vui lòng bắt đầu cuộc trò chuyện mới.",
        isError: true,
      };
    }
    const payload = {
      conversation_id: conversationId,
      message: userMessage
    };

    const response = await chatApi.post('/chat', payload);
    
    // Xử lý trường hợp user_message là string thay vì dictionary
    let userMessageObj = response.data.user_message;
    if (typeof userMessageObj === 'string') {
      userMessageObj = { role: "user", content: userMessageObj };
    } else if (!userMessageObj || typeof userMessageObj !== 'object') {
      userMessageObj = { role: "user", content: userMessage };
    }
    
    // Xử lý trường hợp assistant_message là string thay vì dictionary
    let assistantMessageObj = response.data.assistant_message;
    if (typeof assistantMessageObj === 'string') {
      assistantMessageObj = { role: "assistant", content: assistantMessageObj };
    } else if (!assistantMessageObj || typeof assistantMessageObj !== 'object') {
      assistantMessageObj = { role: "assistant", content: "Không nhận được phản hồi" };
    }
    
    return {
      // Trích xuất content từ assistant_message dictionary
      ai_response: assistantMessageObj.content || "Không nhận được phản hồi",
      conversation_id: response.data.conversation_id || conversationId,
      // Lưu toàn bộ user_message dictionary đã chuẩn hóa
      user_message: userMessageObj,
      // Lưu toàn bộ assistant_message dictionary đã chuẩn hóa
      assistant_message: assistantMessageObj,
      created_at: response.data.created_at
    };
  } catch (error) {
    console.error('Lỗi khi gửi tin nhắn tới @base_chat:', error);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      return {
        ai_response: "Lỗi xác thực hoặc không có quyền gửi tin nhắn. Vui lòng đăng nhập lại.",
        conversation_id: conversationId,
        authError: true,
        isError: true
      };
    }
    return {
        ai_response: "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.",
        conversation_id: conversationId,
        isError: true
      };
  }
};

// Lấy lịch sử trò chuyện - Kết nối với /api/chatContent của @base_chat
// API Doc: GET /api/chatContent?conversation_id={id}
// API Doc: Response: ChatContentResponse { conversation_id, user_id, created_at, messages: List[...] }
export const getChatContent = async (conversationId) => {
  try {
    if (!conversationId) {
      return { messages: [], error: 'Không có conversation_id để tải lịch sử' };
    }
    // Đổi 'chat_id' thành 'conversation_id' trong params
    const response = await chatApi.get(`/chatContent`, { params: { conversation_id: conversationId } });
    // response.data should match ChatContentResponse
    return {
      messages: response.data.messages || [],
      conversation_id: response.data.conversation_id || conversationId,
      user_id: response.data.user_id,
      created_at: response.data.created_at, // created_at của cuộc trò chuyện
      // question_count: response.data.question_count || 0, // Không có trong ChatContentResponse
    };
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử trò chuyện từ @base_chat:', error);
    // Xử lý lỗi xác thực
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Lỗi xác thực khi tải lịch sử trò chuyện:', error.response.status, error.response.data);
      return { 
        messages: [], 
        error: 'Lỗi xác thực hoặc không có quyền xem lịch sử. Vui lòng đăng nhập lại.', 
        authError: true, 
        conversation_id: conversationId 
      };
    }
    // Xử lý lỗi không tìm thấy
    if (error.response && error.response.status === 404) {
      return { 
        messages: [], 
        error: 'Không tìm thấy phiên chat.', 
        isError: true,
        conversation_id: conversationId
      };
    }
    // Xử lý lỗi server (500)
    if (error.response && error.response.status >= 500) {
      console.error('Lỗi server khi gọi API chatContent:', error.response.status, error.response.data);
      // Nếu gặp lỗi 500 từ server, có thể là do lỗi xác thực không được xử lý đúng
      // Kiểm tra lỗi response để xem có phải lỗi xác thực hay không
      if (error.response.data && 
          typeof error.response.data === 'object' && 
          (error.response.data.detail?.includes('xác thực') || 
           error.response.data.detail?.includes('token'))) {
        return { 
          messages: [], 
          error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 
          authError: true,
          conversation_id: conversationId
        };
      }
    }
    // Lỗi khác
    return { 
      messages: [], 
      error: 'Lỗi khi lấy lịch sử trò chuyện. Vui lòng thử lại.', 
      isError: true,
      conversation_id: conversationId
    };
  }
};

// Kiểm tra trạng thái của dịch vụ LLM trong @base_chat
// API Doc: GET /api/llm/status
// API Doc: Response: { llm_service, service_available, model_name, model_available, model_message }
export const checkChatServiceHealth = async () => { // Đổi tên hàm cho rõ nghĩa hơn
  try {
    const response = await chatApi.get('/llm/status'); // Gọi tới /api/llm/status
    return {
      status: response.data.service_available && response.data.model_available ? "online" : "degraded",
      details: response.data // Trả về toàn bộ chi tiết từ API
    };
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái dịch vụ chat @base_chat (endpoint /api/llm/status):', error);
    return {
        status: "offline",
        details: null,
        error: "Could not connect or endpoint not available on @base_chat"
    };
  }
};

/*
// Lấy danh sách sản phẩm tương tự dựa vào câu hỏi
// Không có API tương ứng trong @base_chat documentation được cung cấp.
export const getSimilarProducts = async (question, limit = 3) => {
  try {
    // Cần kiểm tra @base_chat có endpoint /similar-products hoặc tương đương không
    const response = await chatApi.get('/similar-products', {
      params: { query: question, limit }
    });
    return response.data.products || [];
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm tương tự (endpoint cũ /similar-products):', error);
    return [];
  }
};
*/

export default {
  createNewChat,
  sendMessageToChat,
  getChatContent,
  checkChatServiceHealth, // Đổi tên hàm trong export
  // getSimilarProducts, // Giữ ở dạng bình luận
};
