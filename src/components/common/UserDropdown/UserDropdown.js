// src/components/common/UserDropdown/UserDropdown.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaShoppingBag, FaSignOutAlt, FaChevronDown, FaCog } from 'react-icons/fa';
import { AuthContext } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const UserContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 20px;
  white-space: nowrap;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #0A4D7C;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 8px;
  font-size: 14px;
  font-weight: bold;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 0.95rem;
  color: #333;
  
  svg {
    margin-left: 5px;
    font-size: 14px;
    transition: transform 0.3s ease;
    transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  }
  
  &:hover {
    color: #4CAF50;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  width: 220px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  margin-top: 10px;
  z-index: 100;
  overflow: hidden;
  opacity: ${({ isOpen }) => (isOpen ? '1' : '0')};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-10px)')};
  transition: all 0.3s ease;
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  transition: all 0.2s;
  font-size: 14px;
  
  svg {
    margin-right: 12px;
    color: #4CAF50;
    font-size: 16px;
  }
  
  &:hover {
    background-color: #f5f5f5;
    color: #4CAF50;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: #333;
  transition: all 0.2s;
  font-family: inherit;
  font-size: 14px;
  
  svg {
    margin-right: 12px;
    color: #4CAF50;
    font-size: 16px;
  }
  
  &:hover {
    background-color: #f5f5f5;
    color: #4CAF50;
  }
`;

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useContext(AuthContext);
  const { success } = useToast();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Get first letter of username for avatar
  const getInitial = () => {
    if (currentUser && currentUser.username) {
      return currentUser.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle mouse enter and leave for dropdown
  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  // Handle mouse leave to close dropdown
  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    success({
      title: 'Đăng xuất thành công',
      message: 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!',
      duration: 4000
    });
    setIsOpen(false);
    navigate('/');
  };

  return (
    <UserContainer ref={dropdownRef}>
      <div onClick={toggleDropdown} onMouseEnter={handleMouseEnter}>
        <UserAvatar>
          {currentUser?.avatar_url ? (
            <img src={currentUser.avatar_url} alt="User Avatar" />
          ) : (
            getInitial()
          )}
        </UserAvatar>
      </div>
      <UserInfo onClick={toggleDropdown} onMouseEnter={handleMouseEnter} isOpen={isOpen}>
        {currentUser?.username || 'User'}
        <FaChevronDown />
      </UserInfo>

      <DropdownMenu isOpen={isOpen} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <MenuItem to="/profile">
          <FaUser />
          Tài Khoản Của Tôi
        </MenuItem>
        <MenuItem to="/profile#orders">
          <FaShoppingBag />
          Đơn Mua
        </MenuItem>
        {currentUser?.role === 'admin' && (
          <MenuItem to="/admin">
            <FaCog />
            Quản Lý
          </MenuItem>
        )}
        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt />
          Đăng Xuất
        </LogoutButton>
      </DropdownMenu>
    </UserContainer>
  );
};

export default UserDropdown;