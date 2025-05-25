// src/layouts/MainLayout.js
import React from 'react';
import styled from 'styled-components';
import Header from '../components/common/Header/Header';
import Footer from '../components/common/Footer/Footer';
import ChatButton from '../components/chat/ChatButton/ChatButton';
import ChatWindow from '../components/chat/ChatWindow/ChatWindow';


const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Content = styled.main`
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`;

const MainLayout = ({ children }) => {
  return (
    <MainContainer>
      <Header />
      <Content>{children}</Content>
      <Footer />
      <ChatButton />
      <ChatWindow />
    </MainContainer>
  );
};

export default MainLayout;