import styled, { keyframes } from 'styled-components';

export const MessageContainer = styled.div`
  display: flex;
  gap: 8px;
  margin: 4px 0;
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
  
  /* Fallback cho avatar bị lỗi */
  &:error, &[src=""], &[src="#"] {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 3V6H9V3L3 7V9H21ZM18 11H6C5.45 11 5 11.45 5 12V19C5 19.55 5.45 20 6 20H18C18.55 20 19 19.55 19 19V12C19 11.45 18.55 11 18 11Z"/></svg>');
    background-size: 20px;
    background-repeat: no-repeat;
    background-position: center;
  }
`;

export const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-width: 100%;
  overflow: visible;
`;

export const Message = styled.div`
  padding: 8px 12px;
  border-radius: 12px;
  background-color: ${props => props.isUser ? '#007bff' : '#f8f9fa'};
  color: ${props => props.isUser ? 'white' : '#212529'};
  font-size: 14px;
  line-height: 1.4;
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
  
  /* Giảm khoảng trắng giữa các dòng và paragraphs */
  & > div {
    margin-top: 0;
    
    &:first-child {
      margin-top: 0;
    }
    
    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }
  
  /* Đảm bảo ProductList không bị đè và có khoảng cách hợp lý */
  & > div[class*="ProductList"] {
    max-width: 100%;
    overflow-x: auto;
    margin-top: 8px !important;
    margin-bottom: 0 !important;
    position: relative;
    z-index: 2;
  }
  
  /* Styles cho các thẻ markdown - giảm margin để tránh khoảng trắng lớn */
  p {
    margin: 0 0 4px 0;
    line-height: 1.4;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    /* Giảm khoảng cách cho danh sách */
    & + ul, & + ol {
      margin-top: 2px;
    }
  }
  
  /* Giảm khoảng cách cho danh sách */
  ul, ol {
    margin: 2px 0 4px 0;
    padding-left: 16px;
    
    li {
      margin: 0 0 2px 0;
      line-height: 1.4;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  /* Giảm khoảng cách cho headings */
  h1, h2, h3, h4, h5, h6 {
    margin: 4px 0 2px 0;
    line-height: 1.3;
    
    &:first-child {
      margin-top: 0;
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
  
  /* Strong/Bold text */
  strong, b {
    font-weight: 600;
  }
  
  /* Blockquote */
  blockquote {
    border-left: 3px solid ${props => props.isUser ? 'rgba(255,255,255,0.3)' : '#dee2e6'};
    margin: 4px 0;
    padding-left: 12px;
    font-style: italic;
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
