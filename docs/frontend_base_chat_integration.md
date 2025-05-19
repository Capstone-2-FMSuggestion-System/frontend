# Tích hợp giữa @frontend và @base_chat

## Tổng quan

Tài liệu này mô tả chi tiết về việc tích hợp giữa hai thành phần của hệ thống FMSuggestion:
- **@frontend**: Ứng dụng React phía client, phục vụ giao diện người dùng.
- **@base_chat**: Dịch vụ FastAPI cung cấp chức năng chat AI, tích hợp với @backend để xác thực người dùng.

## Luồng Xác thực và Giao tiếp

Luồng hoạt động giữa các thành phần:

1. **Xác thực:**
   - Người dùng đăng nhập thông qua **@frontend** (gửi yêu cầu đến API của **@backend**).
   - **@backend** trả về JWT token (access token) sau khi xác thực thành công.
   - **@frontend** lưu trữ token này (trong Cookie hoặc localStorage).

2. **Tương tác với @base_chat:**
   - Khi người dùng sử dụng tính năng chat, **@frontend** gửi yêu cầu đến API của **@base_chat** với JWT token trong header `Authorization`.
   - **@base_chat** xác minh token này với **@backend** (thông qua `/api/auth/verify-token`).
   - Nếu token hợp lệ, **@base_chat** xử lý yêu cầu và trả về kết quả.
   - Nếu token không hợp lệ, **@base_chat** trả về lỗi 401/403.

## Các Thay Đổi Đã Thực Hiện

### 1. Cập nhật biến môi trường trong `.env`

```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_CHATBOT_API_URL=http://localhost:8001
REACT_APP_BASE_CHAT_API_URL=http://localhost:8002/api
```

Thêm biến `REACT_APP_BASE_CHAT_API_URL` để trỏ đến API của `@base_chat` (port 8002).

### 2. Cập nhật `chatService.js`

Từ:
```javascript
// Cũ
import { createNewSession, sendMessage, getChatHistory } from '../services/chatService';
const CHATBOT_API_URL = process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:8001';
```

Sang:
```javascript
// Mới
import { createNewChat, sendMessageToChat, getChatContent } from '../services/chatService';
const BASE_CHAT_API_URL = process.env.REACT_APP_BASE_CHAT_API_URL || 'http://localhost:8002/api';
```

#### Các phương thức API đã cập nhật:

| Phương thức cũ | Phương thức mới | Endpoint | Mô tả |
|---------------|----------------|----------|-------|
| `createNewSession()` | `createNewChat()` | `POST /api/newChat` | Tạo cuộc trò chuyện mới |
| `sendMessage()` | `sendMessageToChat()` | `POST /api/chat` | Gửi tin nhắn trong cuộc trò chuyện |
| `getChatHistory()` | `getChatContent()` | `GET /api/chatContent` | Lấy nội dung/lịch sử cuộc trò chuyện |
| `checkChatbotHealth()` | `checkChatServiceHealth()` | `GET /api/llm/status` | Kiểm tra trạng thái dịch vụ chat |

### 3. Cập nhật cấu trúc payload và response

#### `createNewChat()`:
- **Request**: Không cần payload.
- **Response**: `{ conversation_id, user_id, created_at, welcome_message }`.

#### `sendMessageToChat()`:
- **Request**: `{ message, conversation_id }`.
- **Response**: `{ ai_response, conversation_id, user_message, created_at }`.

#### `getChatContent()`:
- **Request (Query)**: `conversation_id`.
- **Response**: `{ conversation_id, user_id, created_at, messages: [...] }`.

#### `checkChatServiceHealth()`:
- **Response**: `{ llm_service, service_available, model_name, model_available, model_message }`.

### 4. Cập nhật `ChatContext.js`

1. Đổi tên biến:
   - `sessionId` -> `conversationId`
   - `SESSION_ID_KEY` -> `CONVERSATION_ID_KEY` (trong localStorage)

2. Xử lý dữ liệu:
   - Hỗ trợ cả định dạng cũ và mới trong response: `user_message/question`, `ai_response/answer`
   - Cập nhật tên trường dữ liệu để phù hợp với API mới
   - Xóa xử lý cho `recommendedProducts` (không được hỗ trợ trong API mới)

### 5. Cập nhật các component khác

- `ChatWindow.js`: Cập nhật tham chiếu đến `conversationId` và `CONVERSATION_ID_KEY`

## Cấu trúc các Endpoints 

### Endpoints của @base_chat

| Phương thức | Endpoint | Mô tả |
|------------|----------|-------|
| `GET` | `/api/llm/status` | Kiểm tra trạng thái của dịch vụ LLM |
| `POST` | `/api/newChat` | Tạo cuộc trò chuyện mới |
| `POST` | `/api/chat` | Gửi tin nhắn (non-streaming) |
| `POST` | `/api/stream-chat` | Gửi tin nhắn (streaming) |
| `GET` | `/api/chatContent` | Lấy nội dung cuộc trò chuyện |

## Vấn đề tiềm ẩn và giải pháp

### Xử lý lỗi xác thực
- Khi gặp lỗi 401/403 từ `@base_chat`, frontend hiển thị thông báo phù hợp và gợi ý người dùng đăng nhập lại.
- Interceptor tự động kiểm tra lỗi 401 và có thể chuyển hướng về trang đăng nhập.

### Xử lý tin nhắn streaming
- API hiện tại sử dụng `POST /api/chat` (non-streaming).
- Nếu muốn sử dụng tính năng streaming (`/api/stream-chat`), cần bổ sung xử lý Server-Sent Events.

## Hướng dẫn kiểm thử

1. Đảm bảo cả ba thành phần đang chạy:
   - `@backend` (port 8000)
   - `@base_chat` (port 8002) 
   - `@frontend` (thường là port 3000)
   
2. Đăng nhập vào hệ thống (để lấy JWT token từ @backend)
3. Mở chat box và kiểm tra:
   - Tạo cuộc trò chuyện mới
   - Gửi/nhận tin nhắn
   - Kiểm tra console để xem các request/response với @base_chat

## Lưu ý

- Nếu thay đổi biến môi trường trong `.env`, cần khởi động lại server phát triển của React.
- Token phải được truyền đúng cách trong header `Authorization: Bearer <token>`.
- Hỗ trợ cho biến conversationId và sessionId ở tất cả các hàm để đảm bảo khả năng tương thích ngược. 