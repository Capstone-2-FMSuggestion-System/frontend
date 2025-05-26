// src/components/common/Header/Header.js
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FaShoppingCart, FaSearch, FaUser, FaPhoneAlt } from "react-icons/fa";
import { CartContext } from "../../../context/CartContext";
import { AuthContext } from "../../../context/AuthContext";
import UserDropdown from "../UserDropdown/UserDropdown";
import SearchBar from "../SearchBar";
import logo from "../../../assets/images/logo.png";

const HeaderContainer = styled.header`
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  border-bottom: 1px solid #f1f1f1;
  max-width: 1100px;
  width: 100%;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  margin-right: 24px;
  padding: 6px 0;

  img {
    height: 40px;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  @media (max-width: 768px) {
    margin-right: 16px;

    img {
      height: 32px;
    }
  }
`;

const SearchContainer = styled.div`
  display: flex;
  flex: 0 1 650px;
  margin: 0 auto;
<<<<<<< HEAD
  
=======

>>>>>>> 06f24a8e9a6c963a1f4fade5aebc4cc6296fddea
  @media (max-width: 768px) {
    flex: 1;
    margin: 0 16px;
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  margin-left: 30px;
  margin-right: 20px;
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;

  svg {
    margin-right: 8px;
    color: #4caf50;
    font-size: 16px;
  }
`;

const ActionItems = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  min-width: 180px;
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  margin-left: 40px;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: #4caf50;
  }

  svg {
    margin-right: 8px;
    font-size: 18px;
  }
`;

const CartBadge = styled.span`
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  margin-left: 5px;
  font-weight: bold;
`;

const NavBar = styled.nav`
  display: flex;
  padding: 0;
  justify-content: center;
  background-color: #fff;
  border-bottom: 1px solid #f1f1f1;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const NavLink = styled(Link)`
  padding: 15px 35px;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
  text-align: center;
  font-size: 15px;

  &:hover,
  &.active {
    color: #4caf50;
  }

  &:after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background-color: #4caf50;
    transition: width 0.3s ease;
  }

  &:hover:after,
  &.active:after {
    width: 70%;
  }
`;

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { cart, getCartItemCount } = useContext(CartContext);
  const { currentUser, isAuthenticated } = useContext(AuthContext);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const cartItemCount = getCartItemCount();

  return (
    <HeaderContainer>
      <TopBar>
        <Logo>
          <Link to="/">
            <img src={logo} alt="SM Food Store" />
          </Link>
        </Logo>
        <SearchContainer>
          <SearchBar
            placeholder="Tìm kiếm sản phẩm..."
            onSearch={(query) => {
              navigate(`/search?q=${encodeURIComponent(query)}`);
            }}
          />
        </SearchContainer>
        <ContactInfo>
          <FaPhoneAlt />
          <span>(+84) 032-933-0318</span>
        </ContactInfo>
        <ActionItems>
          {isAuthenticated ? (
            <UserDropdown />
          ) : (
            <ActionButton to="/login">
              <FaUser />
              Đăng nhập/Đăng ký
            </ActionButton>
          )}
          <ActionButton to="/cart">
            <FaShoppingCart />
            Giỏ hàng
<<<<<<< HEAD
            {cartItemCount > 0 && (
              <CartBadge>{cartItemCount}</CartBadge>
            )}
=======
            {cartItemCount > 0 && <CartBadge>{cartItemCount}</CartBadge>}
>>>>>>> 06f24a8e9a6c963a1f4fade5aebc4cc6296fddea
          </ActionButton>
        </ActionItems>
      </TopBar>
      <NavBar>
        <NavLink to="/">Trang chủ</NavLink>
        <NavLink to="/categories">Các loại thực phẩm</NavLink>
        {/* <NavLink to="/promotions">Giảm giá</NavLink> */}
        <NavLink to="/about">Thông tin về chúng tôi</NavLink>
      </NavBar>
    </HeaderContainer>
  );
};

export default Header;
