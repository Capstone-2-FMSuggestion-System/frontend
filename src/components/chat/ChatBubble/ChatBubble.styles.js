import styled, { keyframes } from 'styled-components';

export const MessageContainer = styled.div`
  display: flex;
  margin-bottom: 8px;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  align-items: flex-start;
  gap: 8px;
  width: 100%;
`;

export const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin: 0;
  flex-shrink: 0;
`;

export const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  max-width: calc(100% - 50px);
  min-width: 0;
  flex: 1;
  overflow: hidden;
`;

export const Message = styled.div`
  padding: 12px 16px;
  border-radius: 18px;
  background-color: ${props => {
    if (props['data-is-error']) return 'rgba(220, 53, 69, 0.1)';
    return props.isUser ? '#007bff' : 'rgba(57, 192, 237, 0.1)';
  }};
  color: ${props => {
    if (props['data-is-error']) return '#dc3545';
    return props.isUser ? '#ffffff' : '#333';
  }};
  font-size: 14px;
  line-height: 1.2;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  width: 100%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  overflow-wrap: break-word;
  hyphens: auto;
  
  /* Đảm bảo markdown content hiển thị đúng với spacing tối ưu */
  & > div {
    margin: 0;
    width: 100%;
    line-height: 1.2;
  }
  
  /* Xử lý first/last child margins để tránh khoảng trống thừa */
  & > div > *:first-child {
    margin-top: 0 !important;
  }
  
  & > div > *:last-child {
    margin-bottom: 0 !important;
  }
  
  /* Cải thiện spacing cho paragraphs trong markdown */
  & > div p {
    margin: 1px 0;
    line-height: 1.2;
  }
  
  /* Cải thiện spacing cho lists trong markdown */
  & > div ul, & > div ol {
    margin: 1px 0;
    padding-left: 14px;
  }
  
  & > div li {
    margin: 0;
    line-height: 1.1;
    padding: 0;
  }
  
  /* Xử lý đặc biệt cho numbered lists */
  & > div ol li {
    margin-bottom: 2px;
    line-height: 1.2;
  }
  
  /* Đảm bảo strong text hiển thị đúng */
  & > div strong {
    font-weight: 700 !important;
    margin: 0;
    padding: 0;
  }
  
  /* Xử lý nested content trong lists */
  & > div li > p {
    margin: 0;
    display: inline;
  }
  
  /* Xử lý bullet points */
  & > div ul li::marker {
    font-size: 12px;
  }
  
  & > div ol li::marker {
    font-size: 12px;
    font-weight: normal;
  }
`;

export const NewSessionButton = styled.button`
  display: block;
  margin-top: 8px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #0056b3;
  }
`;

export const ProcessingTime = styled.div`
  font-size: 11px;
  color: #6c757d;
  margin-top: 4px;
  text-align: ${props => props.isUser ? 'right' : 'left'};
`;

const typingAnimation = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
`;

export const TypingIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 8px;
  vertical-align: middle;
`;

export const TypingDot = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #6c757d;
  animation: ${typingAnimation} 1.4s infinite;
  animation-delay: ${props => props.delay}s;
`;
