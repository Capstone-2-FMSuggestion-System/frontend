import React from 'react';
import styled from 'styled-components';

const ProductRow = styled.tr`
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const ProductCell = styled.td`
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ProductImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ProductDetails = styled.div`
  margin-left: 15px;
`;

const ProductName = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const ProductVariant = styled.div`
  font-size: 14px;
  color: #666;
`;

const ProductPrice = styled.div`
  font-weight: 500;
`;

const ProductQuantity = styled.div`
  font-weight: 500;
`;

const ProductTotal = styled.div`
  font-weight: 600;
  color: #4CAF50;
`;

const OrderProductItem = ({ item }) => {
  console.log('OrderProductItem received full item:', item);

  const getProductImage = () => {
    // Kiểm tra cấu trúc item.product và các trường con
    console.log('item.product:', item.product);
    if (item.product) {
      console.log('item.product.images:', item.product.images);
    }

    // Kiểm tra trước tất cả các đường dẫn có thể có
    if (item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0) {
      // In thông tin chi tiết về tất cả các hình ảnh
      item.product.images.forEach((img, index) => {
        console.log(`Image ${index}:`, {
          image_id: img.image_id,
          url: img.image_url,
          is_primary: img.is_primary,
          type: typeof img.is_primary
        });
      });

      try {
        // Tìm ảnh có is_primary = true (hoặc các giá trị tương đương)
        const primaryImage = item.product.images.find(img => {
          // Kiểm tra các kiểu dữ liệu khác nhau của is_primary
          if (img.is_primary === true) return true;
          if (img.is_primary === 'true') return true;
          if (img.is_primary === 1) return true;
          if (img.is_primary === '1') return true;
          
          return false;
        });
        
        if (primaryImage && primaryImage.image_url) {
          // console.log('Tìm thấy ảnh chính:', primaryImage.image_url);
          console.log('is_primary value:', primaryImage.is_primary, typeof primaryImage.is_primary);
          return primaryImage.image_url;
        }
        
        // Nếu không tìm thấy ảnh chính, sử dụng ảnh đầu tiên
        if (item.product.images[0]?.image_url) {
          console.log('Dùng ảnh đầu tiên:', item.product.images[0].image_url);
          return item.product.images[0].image_url;
        }
      } catch (error) {
        console.error('Lỗi khi xử lý hình ảnh:', error);
      }
    }

    // Các trường hợp dự phòng khác
    if (item.product_image) {
      console.log('Dùng item.product_image:', item.product_image);
      return item.product_image;
    }

    if (item.image_url) {
      console.log('Dùng item.image_url:', item.image_url);
      return item.image_url;
    }
    
    if (item.product?.image_url) {
      console.log('Dùng item.product.image_url:', item.product.image_url);
      return item.product.image_url;
    }

    // Fallback cuối cùng
    console.log('Không tìm thấy hình ảnh, dùng placeholder');
    return '/images/placeholder.png';
  };

  // Gọi hàm để lấy URL ảnh
  const imageUrl = getProductImage();
  console.log('Final image URL selected:', imageUrl);

  return (
    <ProductRow>
      <ProductCell>
        <ProductInfo>
          <ProductImage
            src={imageUrl}
            alt={item.product?.name || item.product_name || `#${item.product_id}`}
            onError={(e) => {
              console.log('Image failed to load:', e.target.src);
              e.target.onerror = null;
              e.target.src = '/images/placeholder.png';
            }}
          />
          <ProductDetails>
            <ProductName>{item.product?.name || item.product_name || `#${item.product_id}`}</ProductName>
            <ProductVariant>Đơn vị: {item.unit || 'kg'}</ProductVariant>
          </ProductDetails>
        </ProductInfo>
      </ProductCell>
      <ProductCell>
        <ProductPrice>{Math.round(item.price).toLocaleString()}đ/{item.unit || 'kg'}</ProductPrice>
      </ProductCell>
      <ProductCell>
        <ProductQuantity>{item.quantity}</ProductQuantity>
      </ProductCell>
      <ProductCell>
        <ProductTotal>{Math.round(item.total || (item.price * item.quantity)).toLocaleString()}đ</ProductTotal>
      </ProductCell>
    </ProductRow>
  );
};

export default OrderProductItem;