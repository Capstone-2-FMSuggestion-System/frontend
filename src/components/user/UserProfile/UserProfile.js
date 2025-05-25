import React, { useContext } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingBag, FaTicketAlt, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import useUser from '../../../hooks/useUser';
import { AuthContext } from '../../../context/AuthContext';

const ProfileContainer = styled.div`
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  flex: 0 0 250px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: fit-content;
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const UserInfo = styled.div`
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #eee;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  overflow: hidden;
  border: 2px solid #0A4D7C;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserName = styled.h3`
  margin: 0 0 5px;
  font-size: 18px;
  color: #333;
`;

const UserEmail = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TabLink = styled.a`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: ${props => props.active ? '#0A4D7C' : '#333'};
  text-decoration: none;
  transition: all 0.3s ease;
  background-color: ${props => props.active ? 'rgba(10, 77, 124, 0.1)' : 'transparent'};
  font-weight: ${props => props.active ? '600' : 'normal'};
  cursor: pointer;
  
  svg {
    margin-right: 10px;
    font-size: 18px;
    color: #0A4D7C;
  }
  
  &:hover {
    background-color: #f5f5f5;
    color: #0A4D7C;
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: ${props => props.active ? '#0A4D7C' : '#333'};
  text-decoration: none;
  transition: all 0.3s ease;
  background-color: ${props => props.active ? 'rgba(10, 77, 124, 0.1)' : 'transparent'};
  font-weight: ${props => props.active ? '600' : 'normal'};
  
  svg {
    margin-right: 10px;
    font-size: 18px;
    color: #0A4D7C;
  }
  
  &:hover {
    background-color: #f5f5f5;
    color: #0A4D7C;
  }
`;

const Content = styled.div`
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.5s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const UserProfile = ({ activeTab = 'profile', children, onTabChange }) => {
  const { user, loading } = useUser();
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleTabClick = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <ProfileContainer>
      <Sidebar>
        <UserInfo>
          <Avatar>
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="User Avatar" />
            ) : (
              <FaUser style={{ fontSize: '30px', color: '#ddd' }} />
            )}
          </Avatar>
          <UserName>{user?.full_name || 'Chưa cập nhật'}</UserName>
          <UserEmail>{user?.email || 'Chưa cập nhật'}</UserEmail>
        </UserInfo>
        
        <NavMenu>
          <NavItem>
            <TabLink 
              href="#profile" 
              active={activeTab === 'profile' ? 1 : 0}
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('profile');
              }}
            >
              <FaUser /> Hồ Sơ
            </TabLink>
          </NavItem>
          <NavItem>
            <TabLink 
              href="#orders" 
              active={activeTab === 'orders' ? 1 : 0}
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('orders');
              }}
            >
              <FaShoppingBag /> Đơn Mua
            </TabLink>
          </NavItem>
          {/* <NavItem>
            <TabLink 
              href="#vouchers" 
              active={activeTab === 'vouchers' ? 1 : 0}
              onClick={(e) => {
                e.preventDefault();
                handleTabClick('vouchers');
              }}
            >
              <FaTicketAlt /> Kho Voucher
            </TabLink>
          </NavItem> */}
          {/* <NavItem>
            <NavLink to="/wishlist" active={activeTab === 'wishlist' ? 1 : 0}>
              <FaHeart /> Sản Phẩm Yêu Thích
            </NavLink>
          </NavItem> */}
          <NavItem>
            <TabLink 
              href="#" 
              onClick={handleLogout}
            >
              <FaSignOutAlt /> Đăng Xuất
            </TabLink>
          </NavItem>
        </NavMenu>
      </Sidebar>
      
      <Content>
        {children}
      </Content>
    </ProfileContainer>
  );
};

export default UserProfile;