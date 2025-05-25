import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaUser } from 'react-icons/fa';
import Button from '../common/Button/Button';
import getAvatarUrl from '../../utils/avatarUtil';

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

const UserAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: ${props => props.color || '#4CAF50'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  font-weight: bold;
  margin: 0 auto 20px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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

const EditUserModal = ({ user, isOpen, onClose, onSave, isLoading = false }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: '',
    status: '',
    avatar_url: ''
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        full_name: user.name || '',
        password: '',
        role: user.role || '',
        status: user.status || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Xóa thông báo lỗi API khi người dùng bắt đầu nhập
    if (apiError) {
      setApiError(null);
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Tên đầy đủ không được để trống';
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    
    if (validate()) {
      try {
        const userData = {
          username: formData.username,
          email: formData.email,
          name: formData.full_name,
          role: formData.role.toLowerCase(),
          status: formData.status.toLowerCase()
        };
        
        // If password is empty, remove it from data
        if (formData.password) {
          userData.password = formData.password;
        }
        
        await onSave(userData);
      } catch (error) {
        console.error('Error saving user:', error);
        setApiError(error.message || 'Đã xảy ra lỗi khi cập nhật người dùng');
      }
    }
  };
  
  const getInitials = (name) => {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  const getAvatarColor = () => {
    const colors = [
      '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
      '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
      '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#d35400'
    ];
    
    // Use username to generate consistent color
    const index = formData.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Chỉnh sửa thông tin người dùng</ModalTitle>
          <CloseButton onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            {apiError && (
              <FormError style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                {apiError}
              </FormError>
            )}
            
            <UserAvatar color={getAvatarColor()}>
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt={formData.full_name || 'User'} />
              ) : (
                getInitials(formData.full_name || 'User')
              )}
            </UserAvatar>
            
            {!formData.avatar_url && (
              <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '0.9rem', color: '#666' }}>
                Avatar sẽ được cập nhật khi người dùng tải lên ảnh đại diện của họ.
              </div>
            )}
            
            <FormRow>
              <FormColumn>
                <FormGroup>
                  <FormLabel htmlFor="username">Tên đăng nhập *</FormLabel>
                  <FormInput
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {errors.username && <FormError>{errors.username}</FormError>}
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <FormLabel htmlFor="email">Email *</FormLabel>
                  <FormInput
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <FormError>{errors.email}</FormError>}
                </FormGroup>
              </FormColumn>
            </FormRow>
            
            <FormGroup>
              <FormLabel htmlFor="full_name">Tên đầy đủ *</FormLabel>
              <FormInput
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
              />
              {errors.full_name && <FormError>{errors.full_name}</FormError>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="password">Mật khẩu</FormLabel>
              <FormInput
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới nếu muốn thay đổi"
              />
              {errors.password && <FormError>{errors.password}</FormError>}
            </FormGroup>
            
            <FormRow>
              <FormColumn>
                <FormGroup>
                  <FormLabel htmlFor="role">Vai trò *</FormLabel>
                  <FormSelect
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    {/* <option value="staff">Staff</option> */}
                  </FormSelect>
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <FormLabel htmlFor="status">Trạng thái *</FormLabel>
                  <FormSelect
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Block">Block</option>
                  </FormSelect>
                </FormGroup>
              </FormColumn>
            </FormRow>
          </ModalBody>
          
          <ModalFooter>
            <Button 
              variant="outlined" 
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default EditUserModal; 