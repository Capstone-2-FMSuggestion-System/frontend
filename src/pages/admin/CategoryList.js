// src/pages/admin/CategoryList.js
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaChevronRight, FaChevronDown, FaSearch, FaEye } from 'react-icons/fa';
import Button from '../../components/common/Button/Button';
import AddCategoryModal from '../../components/admin/AddCategoryModal';
import { useToast } from '../../context/ToastContext';
import { getAdminCategories, createCategory, updateCategory, deleteCategory, getCategoriesTree } from '../../services/categoryService';

const Container = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
  position: relative;
`;

const SearchInput = styled.input`
  padding: 10px 10px 10px 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
    box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #757575;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const CategoryWrapper = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CategoryList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const CategoryItem = styled.li`
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: ${props => props.isParent ? '#f9f9f9' : 'white'};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.isParent ? '#f5f5f5' : '#f9f9f9'};
  }
`;

const ToggleIcon = styled.span`
  margin-right: 10px;
  color: #666;
  display: flex;
  align-items: center;
  width: 20px;
  justify-content: center;
`;

const CategoryName = styled.div`
  flex: 1;
  font-weight: ${props => props.isParent ? '600' : 'normal'};
  color: #333;
`;

const CategoryInfo = styled.div`
  display: flex;
  margin-right: 20px;
  color: #666;
  font-size: 0.9rem;
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.color || '#666'};
  font-size: 16px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background-color: ${props => props.hoverBg || 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.hoverColor || '#333'};
  }
`;

const SubcategoriesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 0 25px;
  border-left: 1px dashed #ddd;
`;

const SubcategoryItem = styled(CategoryItem)`
  border-bottom: 1px solid #f5f5f5;
  margin-left: 10px;
  
  &:last-child {
    border-bottom: none;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  gap: 10px;
`;

const PageInfo = styled.span`
  color: #666;
`;

const PageButton = styled.button`
  background-color: ${props => props.active ? '#2196F3' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? '#2196F3' : '#f5f5f5'};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  
  p {
    margin: 10px 0 0;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const AdminCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryTree, setCategoryTree] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    itemsPerPage: 50
  });

  const toast = useToast();

  // Fetch danh mục từ API
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      // Lấy danh mục admin để hiển thị
      const skip = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const data = await getAdminCategories(skip, pagination.itemsPerPage);

      setCategories(data.categories);
      setPagination(prev => ({
        ...prev,
        totalItems: data.total
      }));

      // Lấy cây danh mục với force=true để đảm bảo cập nhật từ DB
      const treesData = await getCategoriesTree(true);
      setCategoryTree(treesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error({
        title: 'Lỗi',
        message: 'Không thể tải danh mục. Vui lòng thử lại sau.',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Lọc danh mục theo từ khóa tìm kiếm
  const filteredCategories = categoryTree.filter(category => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Lọc danh mục theo từ khóa tìm kiếm cho cả subcategories
  const filteredCategoryWithSearch = filteredCategories.map(category => {
    // Nếu tìm kiếm, hiển thị tất cả subcategories
    if (searchTerm) {
      return category;
    }
    return {
      ...category,
      subcategories: category.subcategories.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    };
  });

  // Sắp xếp danh mục: đầu tiên là danh mục cấp 1, sau đó là các danh mục con
  const sortedCategories = [...filteredCategoryWithSearch].sort((a, b) => {
    // Sắp xếp theo cấp độ
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    // Nếu cùng cấp độ, sắp xếp theo tên
    return a.name.localeCompare(b.name);
  });

  // Phân nhóm danh mục thành cây danh mục (categories và subcategories)
  /*const categoryTree = sortedCategories.reduce((acc, category) => {
    if (!category.parent_id) {
      // Đây là danh mục cấp 1
      acc.push({
        ...category,
        subcategories: sortedCategories.filter(sub => sub.parent_id === category.category_id)
      });
    }
    return acc;
  }, []);*/

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAddCategory = async (categoryData) => {
    setIsLoading(true);
    try {
      await createCategory(categoryData);
      toast.success({
        title: 'Thành công',
        message: 'Đã thêm danh mục thành công!',
        duration: 3000
      });
      setIsAddModalOpen(false);
      fetchCategories(); // Tải lại danh sách sau khi thêm
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error({
        title: 'Lỗi',
        message: 'Không thể thêm danh mục. Vui lòng thử lại.',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (categoryData) => {
    if (!selectedCategory) return;

    setIsLoading(true);
    try {
      await updateCategory(selectedCategory.category_id, categoryData);
      toast.success({
        title: 'Thành công',
        message: 'Đã cập nhật danh mục thành công!',
        duration: 3000
      });
      setIsEditModalOpen(false);
      fetchCategories(); // Tải lại danh sách sau khi cập nhật
    } catch (error) {
      console.error('Error updating category:', error);
      if (error.response && error.response.data && error.response.data.detail) {
        toast.error({
          title: 'Lỗi',
          message: `Lỗi: ${error.response.data.detail}`,
          duration: 4000
        });
      } else {
        toast.error({
          title: 'Lỗi',
          message: 'Không thể cập nhật danh mục. Vui lòng thử lại.',
          duration: 4000
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    // Sử dụng toast thay vì window.confirm
    toast.info({
      title: 'Thông báo',
      message: 'Tính năng xóa danh mục sẽ được triển khai với modal xác nhận trong tương lai',
      duration: 3000
    });
    return;
    if (false) { // Tạm thời disable logic xóa
      setIsLoading(true);
      try {
        await deleteCategory(category.category_id);
        toast.success({
          title: 'Thành công',
          message: 'Đã xóa danh mục thành công!',
          duration: 3000
        });
        fetchCategories(); // Tải lại danh sách sau khi xóa
      } catch (error) {
        console.error('Error deleting category:', error);
        if (error.response && error.response.data && error.response.data.detail) {
          toast.error({
            title: 'Lỗi',
            message: `Lỗi: ${error.response.data.detail}`,
            duration: 4000
          });
        } else {
          toast.error({
            title: 'Lỗi',
            message: 'Không thể xóa danh mục. Vui lòng thử lại.',
            duration: 4000
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddSubcategory = (parentCategory) => {
    setSelectedCategory(parentCategory);
    setIsAddModalOpen(true);
  };

  return (
    <Container>
      <Header>
        <Title>Quản lý danh mục</Title>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedCategory(null);
            setIsAddModalOpen(true);
          }}
          leftIcon={<FaPlus />}
        >
          Thêm danh mục
        </Button>
      </Header>

      <ActionBar>
        <SearchContainer>
          <SearchIcon>
            <FaSearch />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchContainer>
      </ActionBar>

      {isLoading && categories.length === 0 ? (
        <LoadingState>Đang tải danh mục...</LoadingState>
      ) : categoryTree.length === 0 ? (
        <EmptyState>
          <h3>Chưa có danh mục nào</h3>
          <p>Hãy thêm danh mục đầu tiên bằng cách nhấn vào nút "Thêm danh mục".</p>
        </EmptyState>
      ) : (
        <CategoryWrapper>
          <CategoryList>
            {sortedCategories.map(category => (
              <CategoryItem key={category.category_id}>
                <CategoryHeader
                  isParent={true}
                  onClick={() => toggleExpand(category.category_id)}
                >
                  <ToggleIcon>
                    {category.subcategories && category.subcategories.length > 0 && (
                      expandedCategories[category.category_id]
                        ? <FaChevronDown />
                        : <FaChevronRight />
                    )}
                  </ToggleIcon>
                  <CategoryName isParent={true}>{category.name}</CategoryName>
                  <CategoryInfo>
                    {category.subcategories ? category.subcategories.length : 0} danh mục con | {category.product_count || 0} sản phẩm
                  </CategoryInfo>
                  <CategoryActions>
                    <ActionButton
                      color="#2196F3"
                      hoverColor="#1976D2"
                      title="Thêm danh mục con"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSubcategory(category);
                      }}
                    >
                      <FaPlus />
                    </ActionButton>
                    <ActionButton
                      color="#FF9800"
                      hoverColor="#F57C00"
                      title="Sửa danh mục"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCategory(category);
                      }}
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      color="#F44336"
                      hoverColor="#D32F2F"
                      title="Xóa danh mục"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category);
                      }}
                    >
                      <FaTrash />
                    </ActionButton>
                  </CategoryActions>
                </CategoryHeader>

                {category.subcategories && category.subcategories.length > 0 && expandedCategories[category.category_id] && (
                  <SubcategoriesList>
                    {category.subcategories.map(subcategory => (
                      <SubcategoryItem key={subcategory.category_id}>
                        <CategoryHeader>
                          <ToggleIcon></ToggleIcon>
                          <CategoryName>{subcategory.name}</CategoryName>
                          <CategoryInfo>
                            {subcategory.product_count || 0} sản phẩm
                          </CategoryInfo>
                          <CategoryActions>
                            <ActionButton
                              color="#FF9800"
                              hoverColor="#F57C00"
                              title="Sửa danh mục"
                              onClick={() => handleEditCategory(subcategory)}
                            >
                              <FaEdit />
                            </ActionButton>
                            <ActionButton
                              color="#F44336"
                              hoverColor="#D32F2F"
                              title="Xóa danh mục"
                              onClick={() => handleDeleteCategory(subcategory)}
                            >
                              <FaTrash />
                            </ActionButton>
                          </CategoryActions>
                        </CategoryHeader>
                      </SubcategoryItem>
                    ))}
                  </SubcategoriesList>
                )}
              </CategoryItem>
            ))}
          </CategoryList>
        </CategoryWrapper>
      )}

      {/* Phân trang */}
      {categoryTree.length > 0 && (
        <Pagination>
          <PageInfo>
            Hiển thị {Math.min(pagination.itemsPerPage, pagination.totalItems)} / {pagination.totalItems} danh mục
          </PageInfo>
          <PageButton
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          >
            Trước
          </PageButton>
          <PageButton
            disabled={(pagination.currentPage * pagination.itemsPerPage) >= pagination.totalItems}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          >
            Sau
          </PageButton>
        </Pagination>
      )}

      {/* Modal thêm danh mục */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCategory}
        isLoading={isLoading}
        categories={categoryTree}
        categoryData={selectedCategory ? { parent_id: selectedCategory.category_id } : null}
      />

      {/* Modal chỉnh sửa danh mục */}
      <AddCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateCategory}
        isLoading={isLoading}
        isEdit={true}
        categoryData={selectedCategory}
        categories={categoryTree}
      />
    </Container>
  );
};

export default AdminCategoryList;