import styled, { keyframes } from 'styled-components';

export const MessageContainer = styled.div`
  display: flex;
  gap: 8px;
  margin: 6px 0;
  max-width: 90%;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  overflow: visible;
`;

export const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  order: ${props => props.isUser ? 2 : 0};
  flex-shrink: 0;
`;

export const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
  overflow: visible;
`;

export const Message = styled.div`
  padding: 8px;
  border-radius: 12px;
  background-color: ${props => props.isUser ? '#007bff' : '#f8f9fa'};
  color: ${props => props.isUser ? 'white' : '#212529'};
  font-size: 14px;
  line-height: 1.2;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  overflow: visible;
  position: relative;
  
  &[data-is-error="true"] {
    background-color: #dc3545;
    color: white;
  }
  
  /* Styles cho MarkdownRenderer và ProductList bên trong Message */
  & > div {
    margin-top: 2px;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  /* Đảm bảo ProductList không bị tràn - chỉ áp dụng cho ProductList */
  & > div[class*="ProductList"] {
    max-width: 100%;
    overflow-x: auto;
  }
  
  /* Styles cho các thẻ markdown */
  p {
    margin: 0 0 2px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  a {
    color: ${props => props.isUser ? 'white' : '#007bff'};
    text-decoration: underline;
    
    &:hover {
      text-decoration: none;
    }
  }
  
  code {
    background: ${props => props.isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)'};
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 90%;
  }
  
  pre {
    background: ${props => props.isUser ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.03)'};
    padding: 6px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 4px 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
`;

export const NewSessionButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
  margin-top: 4px;
  
  &:hover {
    background: #218838;
    transform: translateY(-1px);
  }
`;

export const ProcessingTime = styled.span`
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const blink = keyframes`
  0% { opacity: .2; }
  20% { opacity: 1; }
  100% { opacity: .2; }
`;

export const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  align-items: center;
`;

export const TypingDot = styled.span`
  width: 8px;
  height: 8px;
  background-color: #6c757d;
  border-radius: 50%;
  animation: ${blink} 1.4s infinite both;
  animation-delay: ${props => props.delay}s;
`;
