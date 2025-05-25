# Quản lý Đơn hàng PayOS

## Tổng quan

Đơn hàng thanh toán qua PayOS có quy trình và quy định khác so với đơn hàng COD để đảm bảo tính nhất quán và bảo mật trong thanh toán online.

## Thay đổi chính

### 1. **Trạng thái đơn hàng**
- **COD**: `pending` (Chờ xác nhận) → `processing` (Đang xử lý)
- **PayOS**: `processing` (Đang xử lý) ngay từ đầu

### 2. **Quy định hủy đơn hàng**
- **COD**: Có thể tự hủy khi ở trạng thái `pending`
- **PayOS**: Không thể tự hủy, phải liên hệ hotline

### 3. **Lý do thay đổi**
- Đơn hàng PayOS đã thanh toán online → cần xử lý ngay
- Tránh việc hủy đơn hàng tùy tiện sau khi đã thanh toán
- Đảm bảo quy trình hoàn tiền được kiểm soát

## Files đã cập nhật

### 1. **Checkout Logic**
```javascript
// src/pages/cart/Checkout.js
status: values.paymentMethod === 'payos' ? 'processing' : 'pending'

// src/components/cart/Checkout.js  
status: values.paymentMethod === 'payos' ? 'processing' : 'pending'
```

### 2. **OrderItem Component**
```javascript
// src/components/order-management/OrderItem/OrderItem.js
{status === 'pending' && order.payment_method !== 'PayOS' && (
  <TrackButton onClick={() => setShowCancelModal(true)}>
    Hủy đơn hàng
  </TrackButton>
)}
{order.payment_method === 'PayOS' && (status === 'pending' || status === 'processing') && (
  <TrackButton disabled>
    Liên hệ để hủy
  </TrackButton>
)}
```

### 3. **OrderDetail Page**
```javascript
// src/pages/user/OrderDetail.js
{order.status === 'pending' && order.payment_method !== 'PayOS' && (
  <Button variant="danger" onClick={() => setShowCancelModal(true)}>
    Hủy đơn hàng
  </Button>
)}
{order.payment_method === 'PayOS' && (order.status === 'pending' || order.status === 'processing') && (
  <Button variant="secondary" disabled>
    Liên hệ để hủy đơn hàng
  </Button>
)}
```

### 4. **OrderTab Component**
```javascript
// src/components/user/OrderTab/OrderTab.js
// Thêm thông báo thông tin về quy định PayOS
```

## UI/UX Changes

### 1. **Thông báo thông tin**
- OrderTab: Hiển thị thông báo chung về quy định PayOS
- OrderDetail: Hiển thị thông báo cụ thể cho đơn hàng PayOS

### 2. **Button states**
- Nút "Hủy đơn hàng": Chỉ hiển thị cho COD pending
- Nút "Liên hệ để hủy": Hiển thị cho PayOS pending/processing (disabled)

### 3. **Hotline contact**
- Hiển thị số hotline: **(+84) 032-933-0318**
- Hướng dẫn rõ ràng về cách liên hệ

## Testing Scenarios

### 1. **Tạo đơn hàng PayOS**
- ✅ Status = 'processing' ngay từ đầu
- ✅ Không hiển thị nút "Hủy đơn hàng"
- ✅ Hiển thị nút "Liên hệ để hủy" (disabled)

### 2. **Tạo đơn hàng COD**
- ✅ Status = 'pending' ban đầu
- ✅ Hiển thị nút "Hủy đơn hàng" khi pending
- ✅ Có thể hủy đơn hàng thành công

### 3. **UI Display**
- ✅ Thông báo thông tin hiển thị đúng
- ✅ Hotline number hiển thị chính xác
- ✅ Button states hoạt động đúng

## Kết quả mong đợi

- ✅ Đơn hàng PayOS không thể tự hủy
- ✅ Đơn hàng PayOS chuyển thẳng sang "Đang xử lý"
- ✅ User được hướng dẫn rõ ràng về cách liên hệ
- ✅ Quy trình thanh toán online được bảo vệ
- ✅ Giảm thiểu việc hủy đơn hàng tùy tiện 