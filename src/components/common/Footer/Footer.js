// src/components/common/Footer/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFacebook, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCcVisa, FaCcPaypal, FaCcMastercard, FaGooglePay } from 'react-icons/fa';
import logo from '../../../assets/images/logo.png';

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
      color: #4CAF50;
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
    color: #4CAF50;
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
    background-color: #FF8C00;
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
          <p>Lorem ipsum dolor sit amet consectetur. Maecenada duis lorem mi mattis.</p>
          <PaymentMethods>
            <FaCcVisa /> {/* Thay thế FaVisa */}
            <FaCcPaypal /> {/* Thay thế FaPaypal */}
            <FaCcMastercard /> {/* Thay thế FaMastercard */}
            <FaGooglePay /> {/* Thay thế FaGooglePay */}
          </PaymentMethods>
        </LogoSection>

        <FooterSection>
          <h3>Services</h3>
          <LinksList>
            <li><Link to="/about">About our website</Link></li>
            <li><Link to="/contact">Contact us</Link></li>
            <li><Link to="/news">News</Link></li>
            <li><Link to="/store-location">Store location</Link></li>
          </LinksList>
        </FooterSection>

        <FooterSection>
          <h3>Privacy & Terms</h3>
          <LinksList>
            <li><Link to="/payment-policy">Payment policy</Link></li>
            <li><Link to="/privacy-policy">Privacy policy</Link></li>
            <li><Link to="/return-policy">Return policy</Link></li>
            <li><Link to="/shipping-policy">Shipping policy</Link></li>
            <li><Link to="/terms">Terms & condition</Link></li>
          </LinksList>
        </FooterSection>

        <FooterSection>
          <h3>My Account</h3>
          <LinksList>
            <li><Link to="/account">My account</Link></li>
            <li><Link to="/cart">My cart</Link></li>
            <li><Link to="/orders">Order history</Link></li>
            <li><Link to="/wishlist">My wishlist</Link></li>
            <li><Link to="/address">My address</Link></li>
          </LinksList>
        </FooterSection>

        <FooterSection>
          <h3>Location</h3>
          <ContactItem>
            <FaMapMarkerAlt />
            <span>Lorem ipsum dolor sit amet consectetur. Maecenada duis lorem mi mattis.</span>
          </ContactItem>
          <ContactItem>
            <FaPhone />
            <span>(+91) 111-111-1111</span>
          </ContactItem>
          <ContactItem>
            <FaEnvelope />
            <span>support@sm.com</span>
          </ContactItem>
          <Newsletter>
            <input type="email" placeholder="Nhập Email của bạn" />
            <button>Đăng kí</button>
          </Newsletter>
        </FooterSection>
      </FooterContent>

      <BottomBar>
        <p>&copy; {currentYear} SM Store. All Rights Reserved.</p>
      </BottomBar>
    </FooterContainer>
  );
};

export default Footer;