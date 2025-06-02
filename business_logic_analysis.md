# PHÂN TÍCH LOGIC NGHIỆP VỤ - DỰ ÁN MEDICAL AI CHATBOT

## TỔNG QUAN HỆ THỐNG

### Mục đích chính
Hệ thống Medical AI Chatbot là một ứng dụng tư vấn dinh dưỡng và sức khỏe thông minh, giúp người dùng:
- Nhận gợi ý món ăn phù hợp với tình trạng sức khỏe
- Tìm kiếm sản phẩm thực phẩm và đồ uống
- Tư vấn chế độ dinh dưỡng cá nhân hóa
- Quản lý lịch sử trò chuyện và thông tin sức khỏe

### Kiến trúc tổng thể
```
Frontend (React) ↔ FastAPI Backend ↔ Multiple LLM Services
                                   ↔ MySQL Database
                                   ↔ Redis Cache
                                   ↔ Pinecone Vector DB
                                   ↔ External APIs
```

---

## 1. LUỒNG KHỞI ĐỘNG HỆ THỐNG (Startup Flow)

### Chức năng: `Khởi tạo và chuẩn bị hệ thống`

#### Logic nghiệp vụ:
1. **Pre-load Embedding Model**
   - Tải trước mô hình sentence-transformers/all-mpnet-base-v2
   - Cache model trong memory để tối ưu performance
   - Test embedding để đảm bảo hoạt động

2. **Khởi tạo LLM Service Factory**
   - Kiểm tra các dịch vụ LLM có sẵn (Ollama, LLaMA, Gemini)
   - Chọn dịch vụ ưu tiên dựa trên cấu hình
   - Kiểm tra kết nối và trạng thái model

3. **Tạo bảng Database**
   - Tự động tạo các bảng MySQL nếu chưa tồn tại
   - Khởi tạo connection pool

4. **Cấu hình CORS và Middleware**
   - Thiết lập CORS cho phép frontend truy cập
   - Đăng ký authentication middleware

#### Điều kiện thành công:
- Embedding model load thành công
- Ít nhất 1 LLM service khả dụng
- Database connection thành công

#### Xử lý lỗi:
- Log cảnh báo nếu không load được embedding model
- Fallback sang dịch vụ LLM khác nếu service chính failed
- Tiếp tục khởi động ngay cả khi có một số lỗi không nghiêm trọng

---

## 2. LUỒNG AUTHENTICATION (Authentication Flow)

### Chức năng: `Xác thực và phân quyền người dùng`

#### Logic nghiệp vụ:
1. **Verify User Token**
   - Nhận token từ header Authorization
   - Gửi request đến backend authentication service
   - Validate token và lấy thông tin user

2. **Extract User Information**
   - Parse response từ auth service
   - Tạo VerifiedUserInfo object
   - Cache thông tin user trong request context

#### Điều kiện thành công:
- Token hợp lệ và chưa hết hạn
- Backend auth service phản hồi thành công
- User có quyền truy cập

#### Xử lý lỗi:
- Trả về 401 Unauthorized nếu token invalid
- Trả về 403 Forbidden nếu không có quyền truy cập
- Log chi tiết lỗi authentication

---

## 3. LUỒNG CHAT CHÍNH (Main Chat Flow)

### Chức năng: `Xử lý tin nhắn và tạo phản hồi thông minh`

#### 3.1. Chat API Endpoint
**Logic nghiệp vụ:**
1. **Validation và Authorization**
   - Verify user qua auth middleware
   - Kiểm tra quyền truy cập conversation
   - Validate input message

2. **Background Processing Setup**
   - Khởi tạo background tasks cho DB operations
   - Setup async processing để tối ưu response time

#### 3.2. Stream Chat Flow
**Logic nghiệp vụ chi tiết:**

1. **Conversation Management**
   ```python
   if không có conversation_id:
       → Lấy conversation mới nhất của user
       → Nếu không có → Tạo conversation mới
       → Gửi welcome message
   else:
       → Kiểm tra quyền sở hữu conversation
       → Validate conversation tồn tại
   ```

2. **Message Processing Pipeline**
   ```
   User Message → LangGraph Chat Flow → AI Response → Stream to Client
   ```

3. **Error Handling**
   - Detect error indicators trong response
   - Fallback processing nếu LangGraph fail
   - Graceful degradation

---

## 4. LUỒNG LANGGRAPH CHAT FLOW (Core AI Processing)

### Chức năng: `Xử lý thông minh tin nhắn với state machine`

#### 4.1. State Definition (ChatState)
**Các trường quan trọng:**
- `conversation_id`, `user_id`, `user_message`: Thông tin cơ bản
- `is_valid_scope`, `is_greeting`, `is_food_related`: Phân loại tin nhắn
- `need_more_info`, `user_rejected_info`: Logic thu thập thông tin
- `collected_info`: Thông tin sức khỏe đã thu thập
- `recipe_results`, `beverage_results`, `product_results`: Kết quả từ tools
- `final_response`: Phản hồi cuối cùng

#### 4.2. Node Processing Workflow

##### Node 1: Check Scope (`check_scope_node`)
**Logic nghiệp vụ:**
1. **Pre-filtering**
   ```python
   if tin nhắn quá ngắn hoặc không hợp lệ:
       → Trả về thông báo lỗi
       → Dừng pipeline
   ```

2. **Greeting Detection**
   ```python
   if phát hiện từ chào hỏi:
       → Tạo greeting response
       → Bỏ qua các bước phân tích phức tạp
   ```

3. **Gemini Analysis**
   ```python
   → Gửi toàn bộ conversation history đến Gemini
   → Phân tích: is_valid_scope, is_food_related, need_more_info
   → Phân loại: requests_food, requests_beverage
   → Thu thập: collected_info từ tin nhắn
   ```

4. **Health Data Caching**
   ```python
   if có thông tin sức khỏe mới:
       → Lưu vào Redis cache với key conversation_id
       → Log thông tin đã lưu
   ```

##### Node 2: Router Decision (`define_router`)
**Logic định tuyến:**
```python
if not is_valid_scope:
    → "invalid_scope" → Từ chối xử lý
elif is_greeting:
    → "cleanup" → Trả về greeting response
elif need_more_info and not user_rejected_info:
    → "collect_info" → Thu thập thêm thông tin
elif user_rejected_info or suggest_general_options:
    → "enhanced_medichat_call" → Gợi ý chung
else:
    → "parallel_tools" → Chạy tools tìm kiếm
```

##### Node 3: Collect Info (`collect_info_node`)
**Logic nghiệp vụ:**
```python
→ Tạo câu hỏi follow-up dựa trên follow_up_question
→ Lưu câu hỏi vào final_response
→ Đánh dấu need_more_info = True để frontend biết
```

##### Node 4: Parallel Tools Runner (`parallel_tool_runner_node`)
**Logic nghiệp vụ:**
1. **Tool Selection**
   ```python
   tools_to_run = []
   if requests_food:
       tools_to_run.append("recipe_search")
   if requests_beverage:
       tools_to_run.append("beverage_search")
   
   # Luôn chạy product search để tìm sản phẩm liên quan
   tools_to_run.append("product_search")
   ```

2. **Parallel Execution**
   ```python
   → Chạy đồng thời các tools đã chọn
   → Combine kết quả từ tất cả tools
   → Lưu vào state tương ứng
   ```

##### Node 5: Enhanced Medichat Call (`enhanced_medichat_call_node`)
**Logic nghiệp vụ:**
1. **Prompt Creation**
   ```python
   → Tạo medichat_prompt từ conversation history
   → Thêm context từ collected_info
   → Giới hạn độ dài prompt theo cấu hình
   ```

2. **LLM Service Call**
   ```python
   → Gọi LLM service với system prompt và user prompt
   → Stream response từ model
   → Xử lý và làm sạch response
   ```

3. **Response Polishing**
   ```python
   → Sử dụng Gemini để polish response từ Medichat
   → Đảm bảo response phù hợp và chính xác
   ```

##### Node 6: Enhanced Response Cleanup (`enhanced_response_cleanup_node`)
**Logic nghiệp vụ:**
1. **Save Messages**
   ```python
   → Lưu user message vào database
   → Lưu assistant response vào database
   → Lưu menu_ids nếu có tool results
   ```

2. **Process Available Products**
   ```python
   → Lấy sản phẩm từ product-index dựa trên menu_ids
   → Format sản phẩm cho frontend
   → Thêm vào available_products
   ```

3. **Background Tasks**
   ```python
   → Lưu health data vào database (background)
   → Cache optimization (background)
   → Update conversation statistics (background)
   ```

---

## 5. LUỒNG TOOLS PROCESSING

### 5.1. Recipe Search Tool (`recipe_tool.py`)
**Chức năng:** `Tìm kiếm công thức món ăn phù hợp`

**Logic nghiệp vụ:**
1. **Tìm kiếm trong Pinecone Vector DB**
   ```python
   → Embed user query bằng pre-loaded embedding model
   → Search trong recipe index với similarity threshold
   → Filter kết quả theo collected_info (allergies, preferences)
   ```

2. **Post-processing**
   ```python
   → Rank recipes theo relevance score
   → Limit số lượng kết quả (top 5-10)
   → Format cho consumption
   ```

### 5.2. Product Beverage Tool (`product_beverage.py`)
**Chức năng:** `Tìm kiếm đồ uống phù hợp`

**Logic nghiệp vụ:**
1. **Batch Processing**
   ```python
   → Chia nhỏ search space thành batches
   → Parallel processing để tối ưu performance
   → Combine results từ tất cả batches
   ```

2. **Health-based Filtering**
   ```python
   → Filter theo collected_info (diabetes, hypertension, etc.)
   → Apply dietary restrictions
   → Score beverages theo suitability
   ```

### 5.3. Product Find Tool (`product_find_tool.py`)
**Chức năng:** `Tìm kiếm sản phẩm thực phẩm tổng quát`

**Logic nghiệp vụ:**
1. **Multi-stage Search**
   ```python
   → Stage 1: Keyword matching
   → Stage 2: Semantic similarity search
   → Stage 3: Health condition filtering
   ```

2. **Result Optimization**
   ```python
   → Deduplicate products
   → Sort theo relevance và availability
   → Prepare cho frontend consumption
   ```

---

## 6. LUỒNG CACHE VÀ OPTIMIZATION

### 6.1. Cache Service (`cache_service.py`)
**Chức năng:** `Quản lý cache Redis cho performance optimization`

**Logic nghiệp vụ:**
1. **Health Data Caching**
   ```python
   Key pattern: "session:{conversation_id}:health_info"
   → Cache thông tin sức khỏe theo conversation
   → TTL: 24 hours
   → Update khi có thông tin mới
   ```

2. **Conversation Caching**
   ```python
   Key pattern: "conversation:{conversation_id}:summary"
   → Cache summary của conversation
   → Update theo conversation length threshold
   ```

3. **Product Caching**
   ```python
   Key pattern: "products:{hash}:results"
   → Cache kết quả search products
   → TTL: 1 hour
   → Invalidate khi có update database
   ```

### 6.2. Background Processing
**Chức năng:** `Xử lý async để tối ưu response time`

**Logic nghiệp vụ:**
1. **Background DB Operations**
   ```python
   → Save health data vào MySQL (async)
   → Update conversation statistics (async)
   → Log conversation analytics (async)
   ```

2. **Cache Warming**
   ```python
   → Pre-load frequently accessed data
   → Update cache trong background
   ```

---

## 7. LUỒNG ERROR HANDLING VÀ MONITORING

### 7.1. Error Categories
1. **System Errors:**
   - LLM service unavailable
   - Database connection failed
   - External API timeout

2. **Business Logic Errors:**
   - Invalid user input
   - Authentication failed
   - Resource not found

3. **Data Errors:**
   - Invalid health data format
   - Conversation limit exceeded

### 7.2. Error Handling Strategy
```python
try:
    → Execute main logic
except SystemError:
    → Log error details
    → Return fallback response
    → Notify monitoring system
except BusinessLogicError:
    → Return user-friendly error message
    → Log for analysis
except DataError:
    → Validate and clean data
    → Retry with corrected data
    → Return error if still invalid
```

### 7.3. Monitoring và Logging
1. **Performance Metrics:**
   - Response time per endpoint
   - LLM service latency
   - Database query performance

2. **Business Metrics:**
   - User engagement rate
   - Conversation completion rate
   - Tool usage statistics

3. **Error Tracking:**
   - Error rate by endpoint
   - Failed conversation analysis
   - User feedback correlation

---

## 8. LUỒNG TÍCH HỢP EXTERNAL SERVICES

### 8.1. Gemini API Integration
**Chức năng:** `Sử dụng Google Gemini cho natural language processing`

**Logic nghiệp vụ:**
1. **API Key Management**
   ```python
   → Rotation giữa multiple API keys
   → Load balancing requests
   → Rate limiting compliance
   ```

2. **Request Optimization**
   ```python
   → Prompt length optimization
   → Batch similar requests
   → Cache frequent queries
   ```

### 8.2. Pinecone Vector Database
**Chức năng:** `Vector search cho recipes và products`

**Logic nghiệp vụ:**
1. **Multi-index Management**
   ```python
   → recipe-index: Công thức món ăn
   → product-index: Sản phẩm thực phẩm
   → Separate API keys cho mỗi index
   ```

2. **Search Optimization**
   ```python
   → Embedding caching
   → Query result pagination
   → Relevance score tuning
   ```

---

## 9. LUỒNG DATA PERSISTENCE

### 9.1. Database Schema
**Core Tables:**
- `conversations`: Quản lý conversation metadata
- `messages`: Lưu trữ tin nhắn user và assistant
- `health_data`: Thông tin sức khỏe của user
- `menu_items`: Cache menu items từ tool results

### 9.2. Data Flow
```python
User Message → Validation → Processing → Tool Results → AI Response
     ↓              ↓           ↓            ↓           ↓
  Save to DB   Cache health   Background   Cache        Update
             data to Redis   processing  results    conversation
```

### 9.3. Data Consistency
1. **Transaction Management:**
   - Atomic operations cho critical data
   - Rollback mechanism cho failed operations

2. **Cache Synchronization:**
   - Update cache khi database thay đổi
   - Periodic cache validation

---

## 10. TỔNG KẾT CÁC LUỒNG THỰC THI

### Luồng chính đã phân tích:
1. ✅ **Startup Flow** - Khởi tạo hệ thống
2. ✅ **Authentication Flow** - Xác thực người dùng  
3. ✅ **Main Chat Flow** - Xử lý tin nhắn chính
4. ✅ **LangGraph Chat Flow** - AI processing pipeline
5. ✅ **Tools Processing** - Recipe, Product, Beverage search
6. ✅ **Cache & Optimization** - Performance optimization
7. ✅ **Error Handling** - Xử lý lỗi và monitoring
8. ✅ **External Services Integration** - Tích hợp API bên ngoài
9. ✅ **Data Persistence** - Quản lý dữ liệu

### Các tính năng đặc biệt:
- **Streaming Response**: Real-time chat experience
- **Background Processing**: Tối ưu response time
- **Multi-LLM Support**: Fallback giữa các LLM services
- **Health-aware Recommendations**: Gợi ý dựa trên tình trạng sức khỏe
- **Vector Search**: Tìm kiếm semantic cho recipes và products
- **Conversation Management**: Lưu trữ và quản lý lịch sử chat

### Điểm mạnh của architecture:
1. **Modular Design**: Tách biệt rõ ràng các layer
2. **Async Processing**: Tối ưu performance
3. **Error Resilience**: Xử lý lỗi comprehensive
4. **Scalability**: Thiết kế để mở rộng dễ dàng
5. **Monitoring**: Logging và metrics chi tiết 