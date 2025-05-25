# Quản lý Giỏ Hàng Sau Thanh Toán

## Vấn đề

Sau khi thanh toán PayOS thành công, hệ thống gặp lỗi 404 khi cố gắng xóa từng item trong cart:

```
DELETE http://localhost:8000/api/users/cart/25 404 (Not Found)
CartContext.js:599 Item already removed or not found: 25
```

## Nguyên nhân

1. **Backend tự động xóa cart**: Sau khi thanh toán thành công, backend có thể đã tự động xóa cart hoặc các items
2. **Logic xóa từng item**: Frontend đang cố gắng xóa từng item một cách riêng lẻ thay vì clear toàn bộ cart
3. **Race condition**: Có thể có nhiều request xóa cùng lúc

## Giải pháp

### 1. Tạo function `clearCartAfterPayment`

```javascript
const clearCartAfterPayment = async () => {
  // Chỉ clear local state, không gọi API xóa từng item
  const emptyCart = {
    items: [],
    totalAmount: 0,
    totalItems: 0,
    discount: 0,
    couponCode: null,
    discountedTotal: 0
  };
  
  setCart(emptyCart);
  localStorage.setItem('cart', JSON.stringify(emptyCart));
  
  // Sync với server để đảm bảo consistency
  if (currentUser) {
    await syncCartSafely();
  }
};
```

### 2. Cập nhật `clearCartSilently`

Thêm parameter `skipApiCall` để có thể bỏ qua việc gọi API khi cần:

```javascript
const clearCartSilently = async (skipApiCall = false) => {
  if (currentUser && !skipApiCall) {
    // Xóa từng item qua API
  } else {
    // Chỉ clear local state
  }
};
```

### 3. Tạo function `syncCartSafely`

```javascript
const syncCartSafely = async () => {
  try {
    const serverCart = await authService.getUserCart();
    // Cập nhật cart từ server
  } catch (error) {
    // Không throw error để tránh ảnh hưởng UI
    console.warn('Could not sync cart with server:', error);
  }
};
```

## Sử dụng

### Trong PayOSCallback và PaymentCallback

```javascript
// Thay vì
await clearCartSilently();

// Sử dụng
await clearCartAfterPayment();
```

### Trong Checkout (COD)

```javascript
// Vẫn sử dụng clearCartSilently vì COD không phải thanh toán online
clearCartSilently();
```

## Lợi ích

1. **Tránh lỗi 404**: Không cố gắng xóa items có thể đã bị xóa
2. **Performance tốt hơn**: Không gọi nhiều API requests
3. **Consistency**: Đảm bảo cart được sync đúng với server
4. **User experience**: Không hiển thị lỗi không cần thiết cho user

## Testing

1. Thực hiện thanh toán PayOS thành công
2. Kiểm tra console không còn lỗi 404
3. Kiểm tra cart được clear đúng cách
4. Kiểm tra cart sync với server 