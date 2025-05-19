# Hướng dẫn tích hợp và khắc phục lỗi giữa @frontend và @base_chat

## Vấn đề gặp phải

Trong quá trình tích hợp giữa @frontend (React) và @base_chat (FastAPI), đã xảy ra một số lỗi không tương thích về định dạng dữ liệu. Cụ thể là:

1. Lỗi validation khi gửi và nhận tin nhắn do định dạng dữ liệu không đồng nhất:
   ```
   fastapi.exceptions.ResponseValidationError: 1 validation errors:
     {'type': 'dict_type', 'loc': ('response', 'user_message'), 'msg': 'Input should be a valid dictionary', 'input': 'bạn có thể tư vấn gì cho tôi', 'url': 'https://errors.pydantic.dev/2.11/v/dict_type'}
   ```

2. Lỗi xác thực khi token hết hạn không được xử lý đúng cách, dẫn đến trải nghiệm người dùng không tốt.

## Nguyên nhân

1. **API Schema không nhất quán**: 
   - API `/chat` trong @base_chat đôi khi trả về `user_message` dưới dạng string thay vì dictionary với cấu trúc `{role: string, content: string}` như đã định nghĩa trong `ChatResponse`.
   - Điều này xảy ra ở một số luồng xử lý, đặc biệt là trong `run_chat_flow` hoặc `_fallback_process_message`.

2. **Xử lý token hết hạn chưa đúng cách**:
   - Frontend chưa xử lý tốt trường hợp token hết hạn, dẫn đến lỗi và không có thông báo phù hợp cho người dùng.

## Giải pháp đã thực hiện

### 1. Đảm bảo tính nhất quán của API Schema

#### Trong @base_chat

1. **Cập nhật `chat_flow.py`**:
   - Bổ sung kiểm tra và chuyển đổi `user_message` thành dictionary trong hàm `run_chat_flow`.
   ```python
   # Đảm bảo user_message luôn là dictionary
   if "user_message" not in result or not isinstance(result["user_message"], dict):
       result["user_message"] = {"role": "user", "content": user_message}
   ```

2. **Cập nhật `chat_service.py`**:
   - Thêm xử lý để đảm bảo `user_message` và `assistant_message` luôn là dictionary trong cả hai hàm `process_message` và `_fallback_process_message`.
   ```python
   # Đảm bảo user_message luôn là dictionary
   if "user_message" not in result or not isinstance(result["user_message"], dict):
       result["user_message"] = {"role": "user", "content": message}
   ```

#### Trong @frontend

1. **Cập nhật `chatService.js`**:
   - Thêm xử lý an toàn cho cả trường hợp `user_message` và `assistant_message` có thể là string hoặc dictionary:
   ```javascript
   // Xử lý trường hợp user_message là string thay vì dictionary
   let userMessageObj = response.data.user_message;
   if (typeof userMessageObj === 'string') {
     userMessageObj = { role: "user", content: userMessageObj };
   } else if (!userMessageObj || typeof userMessageObj !== 'object') {
     userMessageObj = { role: "user", content: userMessage };
   }
   ```

### 2. Cải thiện xử lý lỗi xác thực

1. **Trong `chatService.js` frontend**:
   - Đã cải thiện interceptor để tự động xóa token không hợp lệ và hiển thị thông báo phù hợp.
   - Đã thêm kiểm tra và xử lý đặc biệt cho lỗi 401/403 từ API.

2. **Trong `auth.py` middleware của @base_chat**:
   - Cải thiện xử lý lỗi với thông báo rõ ràng và phù hợp.
   - Phân biệt các loại lỗi xác thực (token không hợp lệ, hết hạn, không có quyền) để trả về mã lỗi và thông báo phù hợp.

## Cấu hình môi trường

1. **Trong @frontend**:
   - Biến môi trường `REACT_APP_BASE_CHAT_API_URL` đã được cấu hình trong `.env` để trỏ đến `http://localhost:8002/api`.

2. **Trong @base_chat**:
   - Đảm bảo cấu hình `BACKEND_AUTH_VERIFY_URL` trong `.env` trỏ đến endpoint xác thực token của backend: `http://localhost:8000/api/auth/verify-token`.

## Hướng dẫn kiểm tra

1. Khởi động cả ba dịch vụ: @backend, @base_chat, và @frontend:
   ```bash
   # Khởi động @backend (cổng 8000)
   cd backend
   source venv/bin/activate  # hoặc .\venv\Scripts\activate trên Windows
   python run.py

   # Khởi động @base_chat (cổng 8002)
   cd base_chat
   source venv/bin/activate  # hoặc .\venv\Scripts\activate trên Windows
   uvicorn main:app --port 8002 --reload

   # Khởi động @frontend (cổng 3000)
   cd frontend
   npm start
   ```

2. Kiểm tra luồng đăng nhập và sử dụng chatbot:
   - Đăng nhập vào hệ thống qua @frontend
   - Mở chatbot và gửi tin nhắn
   - Kiểm tra phản hồi và xem log ở @base_chat để đảm bảo không có lỗi validation
   - Đăng xuất và đăng nhập lại để kiểm tra xử lý token hết hạn

## Lưu ý

- Nếu vẫn gặp lỗi, hãy kiểm tra log của @base_chat để xác định nguyên nhân cụ thể.
- Đảm bảo cả frontend và @base_chat đều đã được khởi động lại sau khi thực hiện các thay đổi.
- Xóa cache của trình duyệt nếu cần thiết để đảm bảo các thay đổi được áp dụng. 