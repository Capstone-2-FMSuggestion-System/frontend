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
  }//
}; 