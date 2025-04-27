import React, { useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import ProductForm from './ProductForm';

const ProductsPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    try {
      const response = await adminService.getProducts();
      setProducts(response.items);
    } catch (error) {
      toast.error('Error loading products');
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      setIsSaving(true);
      
      if (editingProduct) {
        // Cập nhật sản phẩm hiện có
        await adminService.updateProduct(editingProduct.product_id, productData);
        toast.success("Sản phẩm đã được cập nhật thành công!");
      } else {
        // Thêm sản phẩm mới
        await adminService.addProduct(productData);
        toast.success("Sản phẩm mới đã được thêm thành công!");
      }
      
      setIsModalOpen(false);
      setEditingProduct(null);
      loadProducts(); // Tải lại danh sách sản phẩm
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.message || "Có lỗi xảy ra khi lưu sản phẩm!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Add Product</button>
      {isModalOpen && (
        <ProductForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveProduct}
          product={editingProduct}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default ProductsPage; 