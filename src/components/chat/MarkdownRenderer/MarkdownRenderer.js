import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

const MarkdownContainer = styled.div`
  font-family: inherit;
  line-height: 1.2;
  
  h1, h2, h3, h4, h5, h6 {
    margin: 4px 0 2px 0;
    font-weight: 700;
    color: inherit;
  }
  
  h1 { font-size: 18px; }
  h2 { font-size: 16px; }
  h3 { font-size: 15px; }
  h4 { font-size: 14px; }
  h5 { font-size: 13px; }
  h6 { font-size: 12px; }
  
  p {
    margin: 1px 0;
    line-height: 1.2;
  }
  
  ul, ol {
    margin: 1px 0;
    padding-left: 14px;
  }
  
  li {
    margin: 0;
    line-height: 1.1;
    padding: 0;
  }
  
  /* Xử lý đặc biệt cho numbered lists */
  ol li {
    margin-bottom: 2px;
    line-height: 1.2;
  }
  
  /* Xử lý content trong list items */
  li > p {
    margin: 0;
    display: inline;
  }
  
  /* Xử lý nested lists */
  li ul, li ol {
    margin: 0;
    padding-left: 12px;
  }
  
  strong {
    font-weight: 700 !important;
    color: inherit;
    margin: 0;
  }
  
  em {
    font-style: italic;
  }
  
  code {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 2px 4px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
  }
  
  pre {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 6px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 2px 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  blockquote {
    border-left: 3px solid #007bff;
    margin: 2px 0;
    padding-left: 6px;
    color: #666;
    font-style: italic;
  }
  
  a {
    color: #007bff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 2px 0;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 4px;
    text-align: left;
  }
  
  th {
    background-color: rgba(0, 123, 255, 0.1);
    font-weight: 600;
  }
  
  hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 2px 0;
  }
  
  /* Xử lý margins cho first/last elements */
  & > *:first-child {
    margin-top: 0 !important;
  }
  
  & > *:last-child {
    margin-bottom: 0 !important;
  }
  
  /* Giảm khoảng cách giữa các paragraphs liên tiếp */
  p + p {
    margin-top: 0;
  }
  
  /* Xử lý khoảng cách cho nested elements */
  ul p, ol p {
    margin: 0;
    display: inline;
  }
  
  /* Xử lý spacing cho list items với strong text */
  li strong {
    margin: 0;
    padding: 0;
  }
  
  /* Xử lý bullet points trong lists */
  ul li::marker {
    font-size: 12px;
  }
  
  ol li::marker {
    font-size: 12px;
    font-weight: normal;
  }
`;

const MarkdownRenderer = ({ content }) => {
  // Cải thiện force re-render với multiple dependencies
  const renderKey = React.useMemo(() => {
    if (!content) return 'empty';
    // Tạo key dựa trên content hash và timestamp để đảm bảo re-render
    const contentHash = content.length + content.slice(0, 50) + content.slice(-50);
    return `markdown-${contentHash}-${Date.now()}`;
  }, [content]);
  
  // Thêm useEffect để force update khi content thay đổi
  const [forceUpdate, setForceUpdate] = React.useState(0);
  
  React.useEffect(() => {
    if (content) {
      setForceUpdate(prev => prev + 1);
    }
  }, [content]);
  
  // Debug và xử lý nội dung để giữ nguyên markdown syntax
  const processedContent = React.useMemo(() => {
    if (!content) return '';
    
    // Debug: Log raw content để kiểm tra
    console.log('🔍 Raw content từ backend:', JSON.stringify(content));
    
    const processed = content
      .replace(/\n{3,}/g, '\n\n') // Giảm nhiều line breaks thành 2
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Loại bỏ line breaks thừa với spaces
      .trim(); // Chỉ trim đầu cuối, không strip spaces trong content
    
    console.log('🔍 Processed content:', JSON.stringify(processed));
    return processed;
  }, [content]);
  
  if (!content) return null;
  
  return (
    <MarkdownContainer key={`${renderKey}-${forceUpdate}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        skipHtml={false}
        components={{
          // Custom component để xử lý line breaks tốt hơn
          p: ({ children }) => {
            // Nếu paragraph chỉ chứa whitespace, không render
            if (typeof children === 'string' && !children.trim()) {
              return null;
            }
            return <p>{children}</p>;
          },
          // Custom component để xử lý ordered lists
          ol: ({ children, start }) => (
            <ol start={start} style={{ listStyleType: 'decimal' }}>
              {children}
            </ol>
          ),
          // Custom component để xử lý unordered lists
          ul: ({ children }) => (
            <ul style={{ listStyleType: 'disc' }}>
              {children}
            </ul>
          ),
          // Custom component để xử lý list items
          li: ({ children, ordered }) => {
            return <li>{children}</li>;
          },
          // Custom component để xử lý strong/bold - đảm bảo in đậm
          strong: ({ children }) => (
            <strong style={{ 
              fontWeight: '700 !important', 
              fontFamily: 'inherit',
              margin: 0,
              padding: 0
            }}>
              {children}
            </strong>
          ),
          // Custom component để xử lý emphasis/italic
          em: ({ children }) => <em>{children}</em>,
          // Xử lý links
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          // Xử lý line breaks
          br: () => <br />,
          // Xử lý text nodes để preserve formatting
          text: ({ children }) => children,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </MarkdownContainer>
  );
};

export default MarkdownRenderer; 