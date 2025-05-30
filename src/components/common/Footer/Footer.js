// src/components/common/Footer/Footer.js
import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  FaFacebook,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCcVisa,
  FaCcPaypal,
  FaCcMastercard,
  FaGooglePay,
} from "react-icons/fa";
import logo from "../../../assets/images/logo.png";

const FooterContainer = styled.footer`
  background-color: #f9f9f9;
  padding: 40px 0;
  margin-top: auto;
`;

const FooterContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterSection = styled.div`
  flex: 1;
  min-width: 200px;
  margin-bottom: 20px;
  h3 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #333;
  }
`;

const LogoSection = styled(FooterSection)`
  img {
    height: 40px;
    margin-bottom: 10px;
  }
  p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 15px;
  }
`;

const LinksList = styled.ul`
  list-style: none;
  padding: 0;
  li {
    margin-bottom: 8px;
  }
  a {
    color: #666;
    text-decoration: none;
    &:hover {
      color: #4caf50;
    }
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #666;
  svg {
    margin-right: 10px;
    color: #4caf50;
  }
`;

const PaymentMethods = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;

  svg {
    font-size: 28px;
    color: #555;
    transition: transform 0.2s ease, color 0.2s ease;

    &:hover {
      transform: scale(1.2);
      color: #000;
    }
  }
`;

const Newsletter = styled.div`
  margin-top: 15px;
  input {
    width: 70%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px 0 0 4px;
    outline: none;
  }
  button {
    padding: 10px 15px;
    background-color: #ff8c00;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    &:hover {
      background-color: #e67e00;
    }
  }
`;

const BottomBar = styled.div`
  text-align: center;
  padding-top: 20px;
  margin-top: 30px;
  border-top: 1px solid #ddd;
  color: #666;
  font-size: 14px;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <LogoSection>
          <img src={logo} alt="SM Food Store" />
          <p>
            Đại Học Duy Tân là nơi cung cấp các sản phẩm thực phẩm chất lượng
            cao, phục vụ nhu cầu ăn uống của sinh viên và cộng đồng. Chúng tôi
            cam kết mang đến sự hài lòng và an toàn cho khách hàng.
          </p>
          <PaymentMethods>
            <FaCcVisa /> {/* Thay thế FaVisa */}
            <FaCcPaypal /> {/* Thay thế FaPaypal */}
            <FaCcMastercard /> {/* Thay thế FaMastercard */}
            <FaGooglePay /> {/* Thay thế FaGooglePay */}
          </PaymentMethods>
        </LogoSection>

        <FooterSection>
          <h3>Dịch Vụ</h3>
          <LinksList>
            <li>
              <Link to="/about">Trang web của chúng tôi</Link>
            </li>
            <li>
              <Link to="/contact">Liên hệ với chúng tôi</Link>
            </li>
            <li>
              <Link to="/news">Tin tức</Link>
            </li>
            <li>
              <Link to="/store-location">Vị trí cửa hàng</Link>
            </li>
          </LinksList>
        </FooterSection>

        <FooterSection>
          <h3>Quyền riêng tư & Điều khoản</h3>
          <LinksList>
            <li>
              <Link to="/payment-policy">Chính sách thanh toán</Link>
            </li>
            <li>
              <Link to="/privacy-policy">Chính sách bảo mật</Link>
            </li>
            <li>
              <Link to="/return-policy">Chính sách đổi trả</Link>
            </li>
            <li>
              <Link to="/shipping-policy">Chính sách vận chuyển</Link>
            </li>
            <li>
              <Link to="/terms">Điều khoản & điều kiện</Link>
            </li>
          </LinksList>
        </FooterSection>

        <FooterSection>
          <h3>Tài Khoản Của Tôi</h3>
          <LinksList>
            <li>
              <Link to="/account">Tài khoản</Link>
            </li>
            <li>
              <Link to="/cart">Giỏ hàng</Link>
            </li>
            <li>
              <Link to="/orders">Lịch sử đặt hàng</Link>
            </li>
            <li>
              <Link to="/wishlist">Danh sách mong muốn</Link>
            </li>
            <li>
              <Link to="/address">Địa chỉ</Link>
            </li>
          </LinksList>
        </FooterSection>

        <FooterSection>
          <h3>Địa Chỉ</h3>
          <ContactItem>
            <FaMapMarkerAlt />
            <span>Đại Học Duy Tân.</span>
          </ContactItem>
          <ContactItem>
            <FaPhone />
            <span>(+84) 032-933-0318</span>
          </ContactItem>
          <ContactItem>
            <FaEnvelope />
            <span>chauquang132003@gmail.com</span>
          </ContactItem>
          <Newsletter>
            <input type="email" placeholder="Nhập Email của bạn" />
            <button>Đăng kí</button>
          </Newsletter>
        </FooterSection>
      </FooterContent>

      <BottomBar>
        <p>&copy; {currentYear} SM Food Store.C2SE.34.</p>
      </BottomBar>
    </FooterContainer>
  );
};

export default Footer;
