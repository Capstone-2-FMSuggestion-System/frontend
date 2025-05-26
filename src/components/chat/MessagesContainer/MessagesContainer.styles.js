import styled from 'styled-components';

export const Container = styled.div`
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
`;

export const LoadingContainer = styled.div`
  display: flex;
  padding: 4px 0;
`;

export const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
`;

export const TypingAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
`;

export const TypingDots = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(57, 192, 237, 0.1);
  padding: 12px 16px;
  border-radius: 18px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

export const Dot = styled.div`
  width: 6px;
  height: 6px;
  background-color: #6c757d;
  border-radius: 50%;
  margin: 0 2px;
  opacity: 0.6;
  animation: typing 1.5s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-8px);
      opacity: 1;
    }
  }
`;

export const EmptyStateMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #6c757d;
  font-size: 14px;
  text-align: center;
  padding: 20px;
  line-height: 1.5;
`; 