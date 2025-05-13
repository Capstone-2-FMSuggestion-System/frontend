import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCloudUploadAlt, FaTrash, FaStar, FaPlus } from 'react-icons/fa';
import Button from '../common/Button/Button';
import { toast } from 'react-hot-toast';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 600px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #000;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const FormError = styled.div`
  color: #F44336;
  font-size: 0.875rem;
  margin-top: 5px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  gap: 10px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const FormColumn = styled.div`
  flex: 1;
`;

const ImageUploadContainer = styled.div`
  margin-bottom: 20px;
`;

const ImageUploadLabel = styled.label`
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
`;

const ImageGallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-3px);
  }
  
  ${props => props.isPrimary && `
    border: 2px solid #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
  `}
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageActions = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.6);
  border-bottom-left-radius: 8px;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${ImagePreviewContainer}:hover & {
    opacity: 1;
  }
`;

const ImageActionButton = styled.button`
  background: none;
  border: none;
  color: white;
  padding: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
  
  &.primary-button {
    color: ${props => props.isPrimary ? '#FFD700' : 'white'};
  }
  
  &.delete-button:hover {
    background-color: rgba(244, 67, 54, 0.8);
  }
`;

const EmptyImageContainer = styled.div`
  width: 120px;
  height: 120px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
  flex-direction: column;
  padding: 15px;
  text-align: center;
  
  &:hover {
    border-color: #4CAF50;
    color: #4CAF50;
    background-color: rgba(76, 175, 80, 0.05);
  }
  
  svg {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  span {
    font-size: 12px;
  }
`;

const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background-color: white;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  margin-top: 10px;
  
  &:hover {
    background-color: #f5f5f5;
    color: #4CAF50;
    border-color: #4CAF50;
  }
  
  svg {
    margin-right: 8px;
  }
  
  input {
    display: none;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  
  input {
    margin-right: 8px;
  }
  
  label {
    font-size: 0.9rem;
    color: #555;
  }
`;

const DescriptionContainer = styled.div`
  margin-bottom: 20px;
`;

const FinancialContainer = styled.div`
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
`;

const FinancialRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InventoryInput = styled.div`
  margin-bottom: 20px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #4CAF50;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const AddProductModal = ({ isOpen, onClose, onSave, isLoading = false, product = null, categories = [], onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    unit: '',
    price: '',
    original_price: '',
    description: '',
    stock_quantity: 0,
    is_featured: false,
    image: null
  });

  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const isEditing = !!product;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (product) {
      // Populate form with existing product data
      setFormData({
        name: product.name || '',
        category_id: product.category_id || '',
        unit: product.unit || '',
        price: product.price || '',
        original_price: product.original_price || '',
        description: product.description || '',
        stock_quantity: product.stock_quantity || 0,
        is_featured: product.is_featured || false
      });

      // Xử lý hình ảnh sản phẩm
      const productImages = [];
      let primaryIndex = 0;

      // Sử dụng image_urls nếu có
      if (product.image_urls && product.image_urls.length > 0) {
        product.image_urls.forEach((url, index) => {
          productImages.push({
            url: url,
            file: null,
            isExisting: true
          });
        });
      } else if (product.images && product.images.length > 0) {
        // Sử dụng trường images cũ (để tương thích ngược)
        product.images.forEach((img, index) => {
          if (img.is_primary) {
            primaryIndex = index;
          }
          productImages.push({
            url: img.image_url,
            file: null,
            isExisting: true
          });
        });
      } else if (product.image_url) {
        // Nếu có trường image_url trực tiếp
        productImages.push({
          url: product.image_url,
          file: null,
          isExisting: true
        });
      }

      setImages(productImages);
      setPrimaryImageIndex(primaryIndex);
    } else {
      // Reset form when adding new product
      setFormData({
        name: '',
        category_id: '',
        unit: '',
        price: '',
        original_price: '',
        description: '',
        stock_quantity: 0,
        is_featured: false
      });
      setImages([]);
      setPrimaryImageIndex(0);
    }
  }, [product]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked :
        type === 'number' ? parseFloat(value) : value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleImageUpload = (e) => {
    if (e.target.files) {
      const newImages = [...images];

      Array.from(e.target.files).forEach(file => {
        // Tạo URL xem trước cho hình ảnh
        const imageUrl = URL.createObjectURL(file);

        // Thêm vào mảng hình ảnh
        newImages.push({
          url: imageUrl,
          file: file,
          isExisting: false
        });
      });

      setImages(newImages);

      if (errors.image) {
        setErrors({
          ...errors,
          image: null
        });
      }

      // Reset input để có thể chọn lại cùng một file
      e.target.value = "";
    }
  };

  const handleDeleteImage = (index) => {
    const newImages = [...images];

    // Nếu xóa ảnh chính, hãy đặt ảnh đầu tiên làm ảnh chính
    if (index === primaryImageIndex) {
      const newPrimaryIndex = index === 0 && newImages.length > 1 ? 1 : 0;
      setPrimaryImageIndex(newPrimaryIndex);
    } else if (index < primaryImageIndex) {
      // Nếu xóa ảnh trước ảnh chính, cập nhật lại index của ảnh chính
      setPrimaryImageIndex(primaryImageIndex - 1);
    }

    // Xóa hình ảnh
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSetPrimary = (index) => {
    setPrimaryImageIndex(index);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Danh mục là bắt buộc';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Giá phải lớn hơn 0';
    }

    if (!formData.original_price || formData.original_price <= 0) {
      newErrors.original_price = 'Giá gốc phải lớn hơn 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    }

    // Yêu cầu ít nhất một hình ảnh
    if (images.length === 0) {
      newErrors.image = 'Vui lòng thêm ít nhất một hình ảnh sản phẩm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form
      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      const productData = new FormData();

      // Add basic product information
      productData.append('name', formData.name);
      productData.append('category_id', formData.category_id);
      productData.append('price', formData.price);
      productData.append('original_price', formData.original_price);
      productData.append('unit', formData.unit);
      productData.append('description', formData.description);
      productData.append('stock_quantity', formData.stock_quantity);
      productData.append('is_featured', formData.is_featured);

      // Handle images
      if (images.length > 0) {
        images.forEach((image, index) => {
          if (image.file) {
            console.log('Appending image file:', image.file.name);
            productData.append('files', image.file);
            if (index === primaryImageIndex) {
              productData.append('primary_image_index', index.toString());
            }
          }
        });
      }

      // Log the FormData contents
      console.log('FormData contents before submission:');
      for (let pair of productData.entries()) {
        console.log(pair[0] + ':', pair[1]);
      }

      const response = await onSave(productData);
      console.log('Server response:', response);

      toast.success(isEditing ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');

      // Call onSuccess callback if provided to trigger data reload
      if (typeof onSuccess === 'function') {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data.message || 'Có lỗi xảy ra khi lưu sản phẩm');
      } else {
        toast.error('Có lỗi xảy ra khi lưu sản phẩm');
      }
    }
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <form onSubmit={handleSubmit}>
            <ImageUploadContainer>
              <ImageUploadLabel>Hình ảnh sản phẩm</ImageUploadLabel>
              <ImageGallery>
                {images.map((image, index) => (
                  <ImagePreviewContainer
                    key={index}
                    isPrimary={index === primaryImageIndex}
                  >
                    <ImagePreview src={image.url} alt={`Sản phẩm ${index + 1}`} />
                    <ImageActions>
                      <ImageActionButton
                        type="button"
                        className="primary-button"
                        onClick={() => handleSetPrimary(index)}
                        title="Đặt làm ảnh chính"
                        isPrimary={index === primaryImageIndex}
                      >
                        <FaStar />
                      </ImageActionButton>
                      <ImageActionButton
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteImage(index)}
                        title="Xóa ảnh"
                      >
                        <FaTrash />
                      </ImageActionButton>
                    </ImageActions>
                  </ImagePreviewContainer>
                ))}

                {/* Container để thêm ảnh mới */}
                <EmptyImageContainer onClick={() => document.getElementById('image-upload').click()}>
                  <FaPlus />
                  <span>Thêm ảnh</span>
                </EmptyImageContainer>
              </ImageGallery>

              <UploadButton as="label">
                <FaCloudUploadAlt />
                Tải lên nhiều ảnh
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  multiple
                />
              </UploadButton>

              {errors.image && <FormError>{errors.image}</FormError>}
              {uploadError && <FormError>{uploadError}</FormError>}
            </ImageUploadContainer>

            <FormRow>
              <FormColumn>
                <FormGroup>
                  <FormLabel>Tên sản phẩm</FormLabel>
                  <FormInput
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Tên sản phẩm"
                  />
                  {errors.name && <FormError>{errors.name}</FormError>}
                </FormGroup>
              </FormColumn>

              <FormColumn>
                <FormGroup>
                  <FormLabel>Danh mục</FormLabel>
                  <FormSelect
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name}
                      </option>
                    ))}
                  </FormSelect>
                  {errors.category_id && <FormError>{errors.category_id}</FormError>}
                </FormGroup>
              </FormColumn>
            </FormRow>

            <FormGroup>
              <FormLabel>Đơn vị</FormLabel>
              <FormInput
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="vd: kg, gói, thùng"
              />
            </FormGroup>

            <FinancialContainer>
              <FinancialRow>
                <FormGroup>
                  <FormLabel>Giá bán</FormLabel>
                  <FormInput
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                  {errors.price && <FormError>{errors.price}</FormError>}
                </FormGroup>

                <FormGroup>
                  <FormLabel>Giá gốc</FormLabel>
                  <FormInput
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                  {errors.original_price && <FormError>{errors.original_price}</FormError>}
                </FormGroup>
              </FinancialRow>
            </FinancialContainer>

            <DescriptionContainer>
              <FormLabel>Mô tả</FormLabel>
              <FormTextarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả sản phẩm ..."
              />
              {errors.description && <FormError>{errors.description}</FormError>}
            </DescriptionContainer>

            <CheckboxContainer>
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
              />
              <label htmlFor="is_featured">
                Nổi bật
              </label>
              <p>Sản phẩm này sẽ xuất hiện trên trang chủ.</p>
            </CheckboxContainer>

            <InventoryInput>
              <FormLabel>Có sẵn trong kho</FormLabel>
              <FormInput
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </InventoryInput>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            variant="secondary"
            onClick={handleSubmit}
            disabled={isLoading || isUploading}
          >
            {isLoading || isUploading ? (
              <>
                <LoadingSpinner />
                {isUploading ? 'Đang tải lên...' : 'Đang lưu...'}
              </>
            ) : (
              isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'
            )}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AddProductModal;