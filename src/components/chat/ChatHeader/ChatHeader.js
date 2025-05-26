import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaAngleLeft, FaPlus } from 'react-icons/fa';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h3`
  margin: 0;
  font-weight: 600;
  font-size: 16px;
  flex: 1;
  text-align: center;
`;

const IconsWrapper = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  font-size: 16px;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ChatHeader = ({ onClose, onNewChat }) => {
  const handleButtonClick = (e, callback) => {
    e.preventDefault();
    e.stopPropagation(); // Ngăn sự kiện lan toả lên
    callback();
  };

  return (
    <Header onClick={(e) => e.stopPropagation()}>
      <IconButton onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}>
        <FaAngleLeft />
      </IconButton>
      <Title onClick={(e) => e.stopPropagation()}>Trò chuyện</Title>
      <IconsWrapper onClick={(e) => e.stopPropagation()}>
        <IconButton 
          onClick={(e) => handleButtonClick(e, onNewChat)} 
          title="Bắt đầu cuộc trò chuyện mới"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <FaPlus />
        </IconButton>
        <IconButton 
          onClick={(e) => handleButtonClick(e, onClose)} 
          title="Đóng hộp thoại"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <FaTimes />
        </IconButton>
      </IconsWrapper>
    </Header>
  );
};

export default ChatHeader;