import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AdminLayout from '../../layouts/AdminLayout';
import UserTable from '../../components/admin/UserTable';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Container = styled.div`
  padding: 20px;
`;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    skip: 0,
    limit: 10
  });
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    // Chỉ tải dữ liệu nếu người dùng đã đăng nhập và có vai trò admin
    if (currentUser?.role?.toLowerCase() === 'admin') {
      fetchUsers();
    }
  }, [pagination.skip, pagination.limit, currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(pagination.skip, pagination.limit);
      
      // Chuyển đổi dữ liệu API để phù hợp với cấu trúc giao diện
      const formattedUsers = response.items.map(user => {
        // Chuẩn hóa trạng thái: chỉ sử dụng 'active' hoặc 'block'
        let status = user.status.toLowerCase();
        if (status === 'inactive' || status === 'blocked') {
          status = 'block';
        } else {
          status = 'active';
        }
        
        return {
          id: user.user_id,
          name: user.full_name,
          username: user.username,
          email: user.email,
          dateCreated: new Date(user.created_at).toLocaleDateString(), //
          role: user.role.charAt(0).toUpperCase() + user.role.slice(1), //
          status: status.charAt(0).toUpperCase() + status.slice(1), //
          avatar_url: user.avatar_url //
        };
      });
      
      setUsers(formattedUsers);
      setPagination({
        total: response.total,
        skip: response.skip,
        limit: response.limit
      });
    } catch (err) {
      console.error("Lỗi khi lấy danh sách người dùng : ", err);
      setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau. ");
      toast.error("Không thể tải danh sách người dùng : " + (err.message || "Lỗi không xác định.")); 
    } finally {
      setLoading(false); //
    }
  };

  const handlePageChange = (pageData) => {
    setPagination(prev => ({
      ...prev,
      skip: (pageData.selected) * pagination.limit
    }));
  };

  const handleSearch = async (searchTerms) => {
    try {
      setLoading(true);
      const searchParams = {}; //
      
      if (searchTerms.term) searchParams.name = searchTerms.term;
      if (searchTerms.role && searchTerms.role !== 'all') searchParams.role = searchTerms.role.toLowerCase(); //
      if (searchTerms.status && searchTerms.status !== 'all') {
        searchParams.status = searchTerms.status.toLowerCase(); //
        
        // Đảm bảo server hiểu được trạng thái block
        if (searchParams.status === 'block') {
          // Nếu server không có trạng thái 'block' thì sử dụng 'blocked'
          searchParams.status = 'blocked'; // Sửa từ 'inactive' thành 'blocked'
        }
      }
      
      const response = await adminService.searchUsers(searchParams, 0, pagination.limit);
      
      const formattedUsers = response.items.map(user => {
        // Chuẩn hóa trạng thái: chỉ sử dụng 'active' hoặc 'block'
        let status = user.status.toLowerCase();
        if (status === 'inactive' || status === 'blocked') {
          status = 'block'; //
        } else {
          status = 'active'; //
        }
        
        return {
          id: user.user_id,
          name: user.full_name,
          username: user.username,
          email: user.email,
          dateCreated: new Date(user.created_at).toLocaleDateString(),
          role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
          status: status.charAt(0).toUpperCase() + status.slice(1),
          avatar_url: user.avatar_url
        }; //
      });
      
      setUsers(formattedUsers);
      setPagination({
        total: response.total,
        skip: response.skip,
        limit: response.limit
      });
    } catch (err) {
      console.error("Lỗi khi tìm kiếm người dùng : ", err);
      setError("Không thể tìm kiếm người dùng. Vui lòng thử lại sau. ");
      toast.error("Không thể tìm kiếm người dùng : " + (err.message || "Lỗi không xác định. "));
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      setLoading(true);
      // Chuyển đổi dữ liệu để phù hợp với API
      let status = userData.status.toLowerCase();
      
      // Đảm bảo server hiểu được trạng thái block
      if (status === 'block') {
        status = 'blocked'; // Sửa từ 'inactive' thành 'blocked'
      }
      
      const apiUserData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        full_name: userData.name,
        role: userData.role.toLowerCase(),
        status: status
      }; //
      
      const result = await adminService.addUser(apiUserData);
      toast.success("Thêm người dùng thành công!");
      
      // Tải lại danh sách sau khi thêm
      await fetchUsers(); //
      
      return true; //
    } catch (err) {
      console.error("Lỗi khi thêm người dùng mới:", err);
      toast.error("Không thể thêm người dùng: " + (err.message || "Lỗi không xác định"));
      throw new Error(err.message || "Không thể thêm người dùng mới");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      setLoading(true); //
      
      // Chuyển đổi trạng thái để phù hợp với API
      let status = userData.status.toLowerCase();
      
      // Đảm bảo server hiểu được trạng thái block
      if (status === 'block') {
        status = 'blocked'; // Thay đổi từ 'inactive' thành 'blocked'
      }
      
      // Tìm người dùng hiện tại để lấy avatar_url
      const currentUser = users.find(user => user.id === userId);
      
      // Chuyển đổi dữ liệu để phù hợp với API
      const apiUserData = {
        username: userData.username,
        email: userData.email,
        full_name: userData.name,
        role: userData.role.toLowerCase(),
        status: status,
        // Giữ nguyên avatar_url nếu người dùng đã có
        avatar_url: currentUser?.avatar_url || ''
      }; //
      
      // Chỉ thêm password nếu được cung cấp
      if (userData.password) {
        apiUserData.password = userData.password;
      }
      
      const result = await adminService.updateUser(userId, apiUserData);
      toast.success("Cập nhật người dùng thành công!");
      
      // Tải lại danh sách sau khi cập nhật
      await fetchUsers(); //
      
      return true; //
    } catch (err) {
      console.error(`Lỗi khi cập nhật người dùng ID ${userId}: `, err);
      toast.error("Không thể cập nhật người dùng : " + (err.message || "Lỗi không xác định. ")); 
      throw new Error(err.message || "Không thể cập nhật thông tin người dùng. ");
    } finally {
      setLoading(false); //
    }
  }; //

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      await adminService.deleteUser(userId);
      toast.success("Xóa người dùng thành công!");
      
      // Tải lại danh sách sau khi xóa
      await fetchUsers();
      
      return true;
    } catch (err) {
      console.error(`Lỗi khi xóa người dùng ID ${userId}:`, err);
      toast.error("Không thể xóa người dùng : " + (err.message || "Lỗi không xác định. "));
      throw new Error(err.message || "Không thể xóa người dùng. ");
    } finally {
      setLoading(false);
    }
  };

  // Chuyển hướng nếu người dùng không phải là admin
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser.role.toLowerCase() !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    // <AdminLayout>
      <Container>
        <UserTable 
          users={users} 
          loading={loading}
          error={error}
          pagination={{
            total: pagination.total,
            skip: pagination.skip,
            limit: pagination.limit,
            onPageChange: handlePageChange //
          }}
          onSearch={handleSearch}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser} //
          onDeleteUser={handleDeleteUser} //
        />
      </Container>
    // </AdminLayout>
  ); //
}; //

export default UserList;