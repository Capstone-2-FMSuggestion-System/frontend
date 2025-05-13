import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import AdminLayout from '../../layouts/AdminLayout';
import { FaSearch, FaPlus, FaFileExcel } from 'react-icons/fa';
import { TbDots } from 'react-icons/tb';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';
import AddProductModal from '../../components/admin/AddProductModal';
import * as XLSX from 'xlsx';

const Container = styled.div`
  padding: 20px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const HeaderContent = styled.div``;

const HeaderButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const Description = styled.p`
  color: #666;
  margin: 5px 0 20px 0;
  font-size: 14px;
`;

const SearchFilter = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  
  input {
    width: 100%;
    padding: 8px 15px 8px 40px;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #4CAF50;
    }
  }
  
  svg {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
  }
`;

const FilterDropdown = styled.select`
  padding: 8px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #388E3C;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background-color: #217346;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: #1a5c38;
  }
`;

const ColumnsButton = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ProductsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 5px;
  overflow: visible;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.thead`
  background-color: #f5f5f5;
  
  th {
    padding: 12px 15px;
    text-align: left;
    font-weight: 500;
    color: #333;
    border-bottom: 1px solid #e0e0e0;
    
    &:last-child {
      text-align: center;
    }
  }
`;

const TableBody = styled.tbody`
  tr {
    &:hover {
      background-color: #f9f9f9;
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid #e0e0e0;
    }
  }
  
  td {
    padding: 12px 15px;
    color: #333;
    
    &:last-child {
      text-align: center;
    }
  }
`;

const PriceCell = styled.td`
  font-weight: 500;
`;

const StatusCell = styled.td`
  span {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background-color: ${props => props.status === 'Nổi bật' ? 'rgba(76, 175, 80, 0.1)' : '#f5f5f5'};
    color: ${props => props.status === 'Nổi bật' ? '#4CAF50' : '#333'};
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  font-size: 18px;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    color: #4CAF50;
    background-color: rgba(76, 175, 80, 0.1);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 30px;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const PageInfo = styled.div`
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    font-weight: 500;
    color: #333;
  }
`;

const PageControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (min-width: 768px) {
    justify-content: flex-end;
  }
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  border: 1px solid ${props => props.active ? '#4CAF50' : '#e0e0e0'};
  border-radius: 8px;
  background-color: ${props => props.active ? '#4CAF50' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s;
  font-weight: ${props => props.active ? '600' : '400'};
  
  &:hover {
    background-color: ${props => props.active ? '#43A047' : '#f5f5f5'};
    border-color: ${props => props.active ? '#43A047' : '#ccc'};
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    transform: none;
    box-shadow: none;
  }
  
  &.control {
    font-size: 16px;
    color: #555;
  }
`;

const ActionMenu = styled.div`
  position: relative;
  z-index: 10;
`;

const ActionMenuDropdown = styled.div`
  position: absolute;
  top: auto;
  bottom: ${props => props.showAbove ? 'calc(100% + 5px)' : 'auto'};
  right: 0;
  top: ${props => props.showAbove ? 'auto' : 'calc(100% + 5px)'};
  width: 150px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  z-index: 100;
  transform-origin: ${props => props.showAbove ? 'bottom right' : 'top right'};
  animation: dropdown 0.2s ease-out;
  
  @keyframes dropdown {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  button {
    width: 100%;
    text-align: left;
    padding: 12px 15px;
    border: none;
    background-color: transparent;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    
    &:hover {
      background-color: #f5f5f5;
      color: #4CAF50;
    }
    
    &.delete {
      color: #F44336;
      
      &:hover {
        background-color: rgba(244, 67, 54, 0.1);
      }
    }
  }
`;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const itemsPerPage = 10;
  const [menuPositions, setMenuPositions] = useState({});
  const actionButtonRefs = useRef({});
  const [sortBy, setSortBy] = useState('created_at_desc');

  // Fetch categories for filter
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Starting to fetch categories...');
        const response = await adminService.getCategories(0, 100);
        console.log('Categories loaded:', response);

        if (response && response.categories) {
          setCategories(response.categories);
          console.log('Categories state updated:', response.categories);
        } else {
          console.error('Invalid categories response format:', response);
          toast.error('Định dạng dữ liệu danh mục không hợp lệ');
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error);
        toast.error('Không thể tải danh mục sản phẩm');
      }
    };

    fetchCategories();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Calculate pagination skip
        const skip = (currentPage - 1) * itemsPerPage;

        // Create filter params
        let categoryId = null;
        if (categoryFilter) categoryId = parseInt(categoryFilter);

        // Xử lý lọc theo trạng thái
        let stockFilter = null;
        if (statusFilter === 'instock') {
          stockFilter = 'available';
        } else if (statusFilter === 'outofstock') {
          stockFilter = 'unavailable';
        }

        console.log('Fetching products with filters:', {
          categoryId,
          stockFilter,
          sortBy
        });

        // Fetch products from API with sorting
        const response = await adminService.getProducts(
          skip,
          itemsPerPage,
          categoryId,
          searchTerm || null,
          stockFilter,
          sortBy
        );

        console.log('Products loaded:', response.items);
        setProducts(response.items || []);
        setTotalItems(response.total);
        setTotalPages(Math.ceil(response.total / itemsPerPage));
      } catch (error) {
        console.error('Lỗi khi tải danh sách sản phẩm:', error);
        toast.error('Không thể tải danh sách sản phẩm');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter, statusFilter, sortBy]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    console.log('Editing product:', product);
    setEditingProduct(product);
    setIsModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = async (productData) => {
    try {
      console.log('Saving product with data:', {
        isEditing: !!editingProduct,
        productId: editingProduct?.product_id,
        formData: productData
      });

      if (editingProduct && editingProduct.product_id) {
        await adminService.updateProduct(editingProduct.product_id, productData);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await adminService.addProduct(productData);
        toast.success('Thêm sản phẩm thành công');
      }

      handleCloseModal();

      // Reload the products list
      const skip = (currentPage - 1) * itemsPerPage;
      const response = await adminService.getProducts(
        skip,
        itemsPerPage,
        categoryFilter ? parseInt(categoryFilter) : null,
        searchTerm || null,
        statusFilter === 'instock' ? 'available' : statusFilter === 'outofstock' ? 'unavailable' : null,
        sortBy
      );
      setProducts(response.items || []);
      setTotalItems(response.total);
      setTotalPages(Math.ceil(response.total / itemsPerPage));
    } catch (error) {
      console.error('Lỗi khi lưu sản phẩm:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu sản phẩm');
    }
  };

  const handleEdit = (productId) => {
    const product = products.find(p => p.product_id === productId);
    if (product) {
      handleEditProduct(product);
    } else {
      toast.error(`Không tìm thấy sản phẩm ID: ${productId}`);
    }
  };

  const handleCopyId = (productId) => {
    navigator.clipboard.writeText(productId);
    toast.success(`Đã sao chép ID: ${productId}`);
    setActionMenuOpen(null);
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?');
    if (confirmDelete) {
      try {
        await adminService.deleteProduct(productId);
        toast.success(`Đã xóa sản phẩm ID: ${productId}`);

        // Refresh product list
        const skip = (currentPage - 1) * itemsPerPage;
        const categoryId = categoryFilter ? parseInt(categoryFilter) : null;

        // Xử lý lọc theo trạng thái
        let stockFilter = null;
        if (statusFilter === 'instock') {
          stockFilter = 'available';
        } else if (statusFilter === 'outofstock') {
          stockFilter = 'unavailable';
        }

        const response = await adminService.getProducts(
          skip,
          itemsPerPage,
          categoryId,
          searchTerm || null,
          stockFilter
        );

        // Sử dụng dữ liệu trả về trực tiếp
        setProducts(response.items || []);
        setTotalItems(response.total);
        setTotalPages(Math.ceil(response.total / itemsPerPage));
      } catch (error) {
        console.error(`Lỗi khi xóa sản phẩm ID ${productId}:`, error);
        toast.error('Đã xảy ra lỗi khi xóa sản phẩm.');
      }
    }
    setActionMenuOpen(null);
  };

  const checkMenuPosition = (productId) => {
    if (actionButtonRefs.current[productId]) {
      const buttonRect = actionButtonRefs.current[productId].getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - buttonRect.bottom;

      // Nếu khoảng trống phía dưới < 150px (chiều cao ước tính của menu), hiển thị menu phía trên
      const showAbove = spaceBelow < 150;

      setMenuPositions(prev => ({
        ...prev,
        [productId]: showAbove
      }));
    }
  };

  const toggleActionMenu = (productId, event) => {
    if (event) {
      event.stopPropagation();
    }

    // Kiểm tra vị trí trước khi mở menu
    setTimeout(() => {
      checkMenuPosition(productId);
    }, 0);

    if (actionMenuOpen === productId) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(productId);
    }
  };

  const handleMenuAction = (action, productId, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (action === 'edit') {
      handleEdit(productId);
    } else if (action === 'copy') {
      handleCopyId(productId);
    } else if (action === 'delete') {
      handleDelete(productId);
    }

    setActionMenuOpen(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Về trang đầu tiên khi tìm kiếm
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Thêm xử lý đóng menu khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (actionMenuOpen !== null && !event.target.closest('.action-menu')) {
        setActionMenuOpen(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuOpen]);

  const exportToExcel = async () => {
    try {
      // Hiển thị thông báo đang tải
      toast.info('Đang chuẩn bị dữ liệu xuất...');

      // Lấy tất cả sản phẩm để xuất (không phân trang)
      const response = await adminService.getProducts(
        0,
        1000, // Lấy số lượng lớn để có thể xuất tất cả
        categoryFilter ? parseInt(categoryFilter) : null,
        searchTerm || null,
        statusFilter === 'instock' ? 'available' :
          statusFilter === 'outofstock' ? 'unavailable' : null
      );

      // Tạo dữ liệu cho file Excel
      const productsData = response.items.map(product => ({
        'ID': product.product_id,
        'Tên sản phẩm': product.name,
        'Giá bán': product.price,
        'Giá gốc': product.original_price,
        'Số lượng': product.stock_quantity,
        'Danh mục': product.category_name || 'N/A',
        'Đơn vị': product.unit || 'N/A',
        'Trạng thái': product.stock_quantity > 0 ? 'Còn hàng' : 'Hết hàng',
        'Ngày tạo': new Date(product.created_at).toLocaleDateString('vi-VN')
      }));

      // Tạo workbook
      const worksheet = XLSX.utils.json_to_sheet(productsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sản phẩm");

      // Tự động điều chỉnh độ rộng cột
      const maxWidth = productsData.reduce((acc, product) => {
        Object.keys(product).forEach(key => {
          const length = product[key] ? product[key].toString().length : 0;
          acc[key] = Math.max(acc[key] || 0, length);
        });
        return acc;
      }, {});

      worksheet['!cols'] = Object.keys(maxWidth).map(key => ({ wch: maxWidth[key] + 2 }));

      // Xuất file
      const fileName = `danh-sach-san-pham-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success('Xuất dữ liệu thành công');
    } catch (error) {
      console.error('Lỗi khi xuất dữ liệu:', error);
      toast.error('Đã xảy ra lỗi khi xuất dữ liệu');
    }
  };

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    console.log('Sort changed to:', newSortBy);
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  // Thêm useEffect để theo dõi thay đổi của categoryFilter
  useEffect(() => {
    if (categoryFilter) {
      console.log('Category filter changed to:', categoryFilter);
      // Reset về trang 1 khi thay đổi danh mục
      setCurrentPage(1);
    }
  }, [categoryFilter]);

  return (
    <Container>
      <HeaderContent>
        <PageHeader>
          <Title>Sản phẩm</Title>
          <HeaderButtons>
            <ExportButton onClick={exportToExcel}>
              <FaFileExcel /> Xuất Excel
            </ExportButton>
            <AddButton onClick={handleAddProduct}>
              <FaPlus /> Thêm sản phẩm
            </AddButton>
          </HeaderButtons>
        </PageHeader>
        <Description>
          Quản lý sản phẩm và theo dõi việc bổ sung hàng tại đây.
        </Description>
      </HeaderContent>

      <SearchFilter>
        <form onSubmit={handleSearch}>
          <SearchInput>
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>
        </form>

        <FilterDropdown
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Trạng thái tồn kho</option>
          <option value="instock">Còn hàng</option>
          <option value="outofstock">Hết hàng</option>
        </FilterDropdown>

        <FilterDropdown
          value={categoryFilter}
          onChange={(e) => {
            console.log('Category filter changed:', e.target.value);
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Danh mục</option>
          {categories && categories.length > 0 ? (
            categories.map(category => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))
          ) : (
            <option value="" disabled>Không có danh mục</option>
          )}
        </FilterDropdown>

        <FilterDropdown
          value={sortBy}
          onChange={handleSortChange}
        >
          <option value="created_at_desc">Mới nhất</option>
          <option value="created_at_asc">Cũ nhất</option>
          <option value="name_asc">Tên A-Z</option>
          <option value="name_desc">Tên Z-A</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </FilterDropdown>

        <ColumnsButton>
          Cột hiển thị
        </ColumnsButton>
      </SearchFilter>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : products.length === 0 ? (
        <p>Không có sản phẩm nào phù hợp với tiêu chí tìm kiếm.</p>
      ) : (
        <>
          <ProductsTable>
            <TableHeader>
              <tr>
                <th>Tên</th>
                <th>Giá bán</th>
                <th>Giá gốc</th>
                <th>Số lượng</th>
                <th>Danh mục</th>
                <th>Đơn vị</th>
                <th>Ngày tạo</th>
                <th style={{ width: '60px' }}></th>
              </tr>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <tr key={product.product_id}>
                  <td>{product.name}</td>
                  <PriceCell>{product.price.toLocaleString()}đ</PriceCell>
                  <PriceCell>{product.original_price.toLocaleString()}đ</PriceCell>
                  <td>{product.stock_quantity}</td>
                  <td>{product.category_name || 'N/A'}</td>
                  <td>{product.unit || 'N/A'}</td>
                  <td>{new Date(product.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <ActionMenu className="action-menu">
                      <ActionButton
                        ref={el => actionButtonRefs.current[product.product_id] = el}
                        onClick={(e) => toggleActionMenu(product.product_id, e)}
                        title="Tùy chọn"
                        aria-label="Tùy chọn"
                      >
                        <TbDots />
                      </ActionButton>

                      {actionMenuOpen === product.product_id && (
                        <ActionMenuDropdown
                          showAbove={menuPositions[product.product_id]}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button onClick={(e) => handleMenuAction('edit', product.product_id, e)}>
                            Sửa
                          </button>
                          <button onClick={(e) => handleMenuAction('copy', product.product_id, e)}>
                            Copy ID
                          </button>
                          <button
                            className="delete"
                            onClick={(e) => handleMenuAction('delete', product.product_id, e)}
                          >
                            Xóa
                          </button>
                        </ActionMenuDropdown>
                      )}
                    </ActionMenu>
                  </td>
                </tr>
              ))}
            </TableBody>
          </ProductsTable>

          <PaginationContainer>
            <PageInfo>
              Hiển thị <span>{Math.min(itemsPerPage, products.length)}</span> / <span>{totalItems}</span> sản phẩm | Trang <span>{currentPage}</span> / <span>{totalPages}</span>
            </PageInfo>

            <PageControls>
              <PageButton
                className="control"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                title="Trang đầu"
              >
                &laquo;
              </PageButton>

              <PageButton
                className="control"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                title="Trang trước"
              >
                &lsaquo;
              </PageButton>

              {/* Hiển thị nút phân trang thông minh */}
              {(() => {
                let pageButtons = [];
                const totalPageButtons = Math.min(5, totalPages);

                // Tính toán phạm vi các trang hiển thị
                let startPage = Math.max(1, currentPage - Math.floor(totalPageButtons / 2));
                let endPage = startPage + totalPageButtons - 1;

                if (endPage > totalPages) {
                  endPage = totalPages;
                  startPage = Math.max(1, endPage - totalPageButtons + 1);
                }

                // Hiển thị "..." nếu không bắt đầu từ trang 1
                if (startPage > 1) {
                  pageButtons.push(
                    <PageButton
                      key="start-ellipsis"
                      onClick={() => handlePageChange(startPage - 1)}
                      title={`Trang ${startPage - 1}`}
                    >
                      ...
                    </PageButton>
                  );
                }

                // Hiển thị các nút trang
                for (let i = startPage; i <= endPage; i++) {
                  pageButtons.push(
                    <PageButton
                      key={i}
                      active={i === currentPage}
                      onClick={() => handlePageChange(i)}
                      title={`Trang ${i}`}
                    >
                      {i}
                    </PageButton>
                  );
                }

                // Hiển thị "..." nếu không kết thúc ở trang cuối
                if (endPage < totalPages) {
                  pageButtons.push(
                    <PageButton
                      key="end-ellipsis"
                      onClick={() => handlePageChange(endPage + 1)}
                      title={`Trang ${endPage + 1}`}
                    >
                      ...
                    </PageButton>
                  );
                }

                return pageButtons;
              })()}

              <PageButton
                className="control"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                title="Trang sau"
              >
                &rsaquo;
              </PageButton>

              <PageButton
                className="control"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                title="Trang cuối"
              >
                &raquo;
              </PageButton>
            </PageControls>
          </PaginationContainer>
        </>
      )}

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        isLoading={false}
        product={editingProduct}
        categories={categories}
        onSuccess={async () => {
          // Reload the products list after successful save
          const skip = (currentPage - 1) * itemsPerPage;
          const response = await adminService.getProducts(
            skip,
            itemsPerPage,
            categoryFilter ? parseInt(categoryFilter) : null,
            searchTerm || null,
            statusFilter === 'instock' ? 'available' : statusFilter === 'outofstock' ? 'unavailable' : null,
            sortBy
          );
          setProducts(response.items || []);
          setTotalItems(response.total);
          setTotalPages(Math.ceil(response.total / itemsPerPage));
        }}
      />
    </Container>
  );
};

export default ProductList;