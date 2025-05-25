import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCog, FaTrashAlt, FaFileExcel, FaUserPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Pagination from '../common/Pagination/Pagination';
import Button from '../common/Button/Button';
import EditUserModal from './EditUserModal';
import AddUserModal from './AddUserModal';
import getAvatarUrl from '../../utils/avatarUtil';

const UserTableContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #2196F3;
  color: white;
`;

const TableTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeaderRow = styled.tr`
  border-bottom: 1px solid #eee;
`;

const TableHeaderCell = styled.th`
  padding: 15px 20px;
  text-align: left;
  font-weight: 600;
  color: #333;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;
  &:hover {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 15px 20px;
  vertical-align: middle;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 15px;
`;

const UserName = styled.div`
  font-weight: 500;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 500;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
  }
  
  ${({ status }) => {
    if (status === 'active' || status === 'Active') {
      return `
        color: #388E3C;
        background-color: rgba(76, 175, 80, 0.1);
        &::before {
          background-color: #4CAF50;
        }
      `;
    } else if (status === 'block' || status === 'Block') {
      return `
        color: #D32F2F;
        background-color: rgba(244, 67, 54, 0.1);
        &::before {
          background-color: #F44336;
        }
      `;
    }
  }}
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: none;
  background-color: ${props => props.danger ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.1)'};
  color: ${props => props.danger ? '#F44336' : '#2196F3'};
  margin: 0 5px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.danger ? 'rgba(244, 67, 54, 0.2)' : 'rgba(33, 150, 243, 0.2)'};
  }
`;

const TableFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #f5f5f5;
  border-top: 1px solid #eee;
`;

const FooterInfo = styled.div`
  color: #666;
  font-size: 14px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 10px;
  width: 300px;
  margin-right: 10px;
`;

const SearchIcon = styled.span`
  color: #666;
  margin-right: 8px;
`;

const SearchInput = styled.input`
  border: none;
  padding: 10px 0;
  flex: 1;
  font-size: 14px;
  &:focus {
    outline: none;
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-left: auto;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 14px;
  color: #333;
  
  &:focus {
    outline: none;
    border-color: #2196F3;
  }
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #555;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 14px;
  margin-top: 10px;
`;

const LoadingMessage = styled.div`
  color: #666;
  font-size: 14px;
  margin-top: 10px;
`;

const ModalBackdrop = styled.div`
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
  animation: fadeIn 0.2s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 500px;
  max-width: 95%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateY(-30px);
      opacity: 0.5;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background-color: #F44336;
  color: white;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/%3E%3C/svg%3E");
    background-size: contain;
    margin-right: 10px;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const UserDetailItem = styled.div`
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
`;

const UserDetailLabel = styled.div`
  width: 120px;
  font-weight: 500;
  color: #555;
`;

const UserDetailValue = styled.div`
  flex: 1;
`;

const DeleteUserInfo = styled.div`
  display: flex;
  margin-bottom: 20px;
  align-items: center;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
`;

const DeleteUserAvatar = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #F5F5F5;
  margin-right: 20px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DeleteUserDetails = styled.div`
  flex: 1;
`;

const DeleteUserName = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 5px;
`;

const DeleteUserRole = styled.div`
  color: #666;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #eee;
  gap: 10px;
`;

const WarningText = styled.div`
  margin-top: 15px;
  padding: 15px;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 4px;
  color: #D32F2F;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  
  &::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23D32F2F'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E");
    background-size: contain;
    margin-right: 10px;
    min-width: 20px;
  }
`;

const ConfirmDeleteButton = styled(Button)`
  && {
    background-color: ${props => props.disabled ? '#f5f5f5' : '#F44336'};
    color: ${props => props.disabled ? '#999' : 'white'};
    
    &:hover {
      background-color: ${props => props.disabled ? '#f5f5f5' : '#D32F2F'};
    }
    
    transition: all 0.3s ease;
  }
`;

const UserTable = ({
  users = [],
  loading = false,
  error = null,
  pagination = {
    total: 0,
    skip: 0,
    limit: 10,
    onPageChange: () => { }
  },
  onSearch = () => { },
  onAddUser = () => { },
  onUpdateUser = () => { },
  onDeleteUser = () => { }
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Số trang dựa trên tổng số và số lượng hiển thị mỗi trang
  const pageCount = Math.ceil(pagination.total / pagination.limit);

  const handlePageChange = (pageData) => {
    pagination.onPageChange(pageData);
  };

  const handleExportToExcel = () => {
    // Export logic here
    toast.info('Tính năng xuất Excel sẽ được triển khai trong tương lai');
  };

  const handleAddNewUser = () => {
    setShowAddModal(true);
  };

  const handleSaveNewUser = async (userData) => {
    try {
      setIsSubmitting(true);
      await onAddUser(userData);
      setShowAddModal(false);
      return true;
    } catch (error) {
      console.error('Lỗi khi thêm người dùng mới:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (userId) => {
    const userToEdit = users.find(user => user.id === userId);
    if (userToEdit) {
      setCurrentUser({
        ...userToEdit,
        avatar_url: userToEdit.avatar_url || ''
      });
      setShowEditModal(true);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      setIsSubmitting(true);
      if (currentUser && currentUser.id) {
        await onUpdateUser(currentUser.id, userData);
        setShowEditModal(false);
        return true;
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật người dùng:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setIsSubmitting(true);
      await onDeleteUser(userId);
      setConfirmDelete(null);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    // Báo cho component cha tải lại dữ liệu
    onSearch({});
  };

  const handleSubmitSearch = (e) => {
    e.preventDefault();
    onSearch({
      term: searchTerm,
      role: roleFilter,
      status: statusFilter
    });
  };

  // Tìm thông tin chi tiết người dùng cần xóa
  const userToDelete = users.find(user => user.id === confirmDelete);

  return (
    <UserTableContainer>
      <TableHeader>
        <TableTitle>Quản lý người dùng</TableTitle>
        <ActionButtons>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FaUserPlus />}
            onClick={handleAddNewUser}
          >
            Thêm người dùng
          </Button>
        </ActionButtons>
      </TableHeader>

      <form onSubmit={handleSubmitSearch}>
        <HeaderContent style={{ padding: '15px 20px', borderBottom: '1px solid #eee' }}>
          <SearchContainer>
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </SearchContainer>

          <FilterContainer>
            <FilterLabel>
              <FaFilter />
              <FilterSelect value={roleFilter} onChange={handleRoleFilterChange}>
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="staff">Staff</option>
              </FilterSelect>
            </FilterLabel>

            <FilterLabel>
              <FaFilter />
              <FilterSelect value={statusFilter} onChange={handleStatusFilterChange}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Active</option>
                <option value="block">Block</option>
              </FilterSelect>
            </FilterLabel>

            <Button
              variant="outlined"
              color="primary"
              type="submit"
            >
              Tìm kiếm
            </Button>

            <Button
              variant="text"
              color="secondary"
              onClick={handleClearFilters}
            >
              Xóa bộ lọc
            </Button>
          </FilterContainer>
        </HeaderContent>
      </form>

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      {loading ? (
        <LoadingMessage>Đang tải dữ liệu...</LoadingMessage>
      ) : (
        <>
          <StyledTable>
            <thead>
              <TableHeaderRow>
                <TableHeaderCell>Thông tin người dùng</TableHeaderCell>
                <TableHeaderCell>Username</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Vai trò</TableHeaderCell>
                <TableHeaderCell>Trạng thái</TableHeaderCell>
                <TableHeaderCell>Ngày tạo</TableHeaderCell>
                <TableHeaderCell>Thao tác</TableHeaderCell>
              </TableHeaderRow>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" style={{ textAlign: 'center' }}>
                    Không có dữ liệu người dùng
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <UserInfo>
                        <UserAvatar src={getAvatarUrl(user)} alt={user.name || user.full_name || user.username} />
                        <UserName>{user.name || user.full_name || user.username}</UserName>
                      </UserInfo>
                    </TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <StatusBadge status={user.status}>{user.status}</StatusBadge>
                    </TableCell>
                    <TableCell>{user.dateCreated}</TableCell>
                    <TableCell>
                      <ActionButton
                        onClick={() => handleEditUser(user.id)}
                        title="Chỉnh sửa"
                      >
                        <FaCog />
                      </ActionButton>
                      <ActionButton
                        danger
                        onClick={() => setConfirmDelete(user.id)}
                        title="Xóa"
                      >
                        <FaTrashAlt />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </StyledTable>

          <TableFooter>
            <FooterInfo>
              Hiển thị {Math.min(users.length, pagination.limit)} / {pagination.total} người dùng
            </FooterInfo>
            <Pagination
              pageCount={pageCount}
              onPageChange={handlePageChange}
              forcePage={pagination.skip / pagination.limit}
            />
          </TableFooter>
        </>
      )}

      {showAddModal && (
        <AddUserModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveNewUser}
          isLoading={isSubmitting}
        />
      )}

      {showEditModal && currentUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveUser}
          user={currentUser}
          isLoading={isSubmitting}
        />
      )}

      {/* Xác nhận xóa người dùng */}
      {confirmDelete && userToDelete && (
        <ModalBackdrop onClick={() => !isSubmitting && setConfirmDelete(null)}>
          <ModalContainer onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Xác nhận xóa người dùng</ModalTitle>
            </ModalHeader>

            <ModalBody>
              <DeleteUserInfo>
                <DeleteUserAvatar>
                  <img src={getAvatarUrl(userToDelete)} alt={userToDelete.name || userToDelete.full_name || userToDelete.username} />
                </DeleteUserAvatar>
                <DeleteUserDetails>
                  <DeleteUserName>{userToDelete.name || userToDelete.full_name || userToDelete.username}</DeleteUserName>
                  <DeleteUserRole>
                    <StatusBadge status={userToDelete.status}>
                      {userToDelete.status}
                    </StatusBadge>
                    <span>{userToDelete.role}</span>
                  </DeleteUserRole>
                </DeleteUserDetails>
              </DeleteUserInfo>

              <UserDetailItem>
                <UserDetailLabel>Username:</UserDetailLabel>
                <UserDetailValue>{userToDelete.username}</UserDetailValue>
              </UserDetailItem>

              <UserDetailItem>
                <UserDetailLabel>Email:</UserDetailLabel>
                <UserDetailValue>{userToDelete.email}</UserDetailValue>
              </UserDetailItem>

              <UserDetailItem>
                <UserDetailLabel>Ngày tạo:</UserDetailLabel>
                <UserDetailValue>{userToDelete.dateCreated}</UserDetailValue>
              </UserDetailItem>

              <WarningText>
                Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến người dùng này sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </WarningText>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="outlined"
                onClick={() => setConfirmDelete(null)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <ConfirmDeleteButton
                variant="contained"
                onClick={() => handleDeleteUser(confirmDelete)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận xóa'}
              </ConfirmDeleteButton>
            </ModalFooter>
          </ModalContainer>
        </ModalBackdrop>
      )}
    </UserTableContainer>
  );
};

export default UserTable; 