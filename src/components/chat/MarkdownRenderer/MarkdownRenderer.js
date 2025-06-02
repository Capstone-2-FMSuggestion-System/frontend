import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

const MarkdownContainer = styled.div`
  font-family: inherit;
  line-height: 1.3;
  word-wrap: break-word;
  
  h1, h2, h3, h4, h5, h6 {
    margin: 3px 0 2px 0;
    font-weight: 700;
    color: inherit;
    line-height: 1.2;
  }
  
  h1 { font-size: 18px; }
  h2 { font-size: 16px; }
  h3 { font-size: 15px; }
  h4 { font-size: 14px; }
  h5 { font-size: 13px; }
  h6 { font-size: 12px; }
  
  p {
    margin: 0 0 3px 0;
    line-height: 1.3;
    word-wrap: break-word;
  }
  
  /* Xử lý khoảng cách đoạn văn liên tiếp */
  p + p {
    margin-top: 2px;
  }
  
  /* Khoảng cách giữa đoạn văn và danh sách */
  p + ul, p + ol {
    margin-top: 2px;
  }
  
  ul + p, ol + p {
    margin-top: 3px;
  }
  
  ul, ol {
    margin: 2px 0 3px 0;
    padding-left: 16px;
    line-height: 1.3;
  }
  
  li {
    margin: 0 0 2px 0;
    line-height: 1.3;
    padding: 0;
    word-wrap: break-word;
  }
  
  /* Xử lý đặc biệt cho numbered lists */
  ol li {
    margin-bottom: 2px;
    line-height: 1.3;
  }
  
  /* Xử lý content trong list items */
  li > p {
    margin: 0;
    display: inline;
  }
  
  /* Chỉ inline nếu là p duy nhất trong li */
  li > p:only-child {
    margin: 0;
    display: inline;
  }
  
  /* Xử lý nested lists */
  li ul, li ol {
    margin: 2px 0;
    padding-left: 12px;
  }
  
  /* Xử lý nguyên liệu lists - formatting đặc biệt */
  li:has(strong:first-child) {
    margin-bottom: 2px;
  }
  
  strong {
    font-weight: 700 !important;
    color: inherit;
    margin: 0;
  }
  
  /* Xử lý đặc biệt cho "Nguyên liệu:" */
  strong:contains("Nguyên liệu:") {
    color: #2c5aa0;
    font-weight: 800 !important;
  }
  
  em {
    font-style: italic;
  }
  
  code {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
  }
  
  pre {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 6px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 4px 0;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  blockquote {
    border-left: 4px solid #007bff;
    margin: 4px 0;
    padding-left: 10px;
    color: #666;
    font-style: italic;
    background-color: rgba(0, 123, 255, 0.05);
    padding: 6px 10px;
    border-radius: 4px;
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
    margin: 6px 0;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 4px 6px;
    text-align: left;
  }
  
  th {
    background-color: rgba(0, 123, 255, 0.1);
    font-weight: 600;
  }
  
  hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 8px 0;
  }
  
  /* Xử lý margins cho first/last elements */
  & > *:first-child {
    margin-top: 0 !important;
  }
  
  & > *:last-child {
    margin-bottom: 0 !important;
  }
  
  /* Xử lý bullet points trong lists */
  ul li::marker {
    font-size: 14px;
    color: #007bff;
  }
  
  ol li::marker {
    font-size: 13px;
    font-weight: 600;
    color: #007bff;
  }
  
  /* Tối ưu hóa spacing - giảm khoảng trắng thừa */
  * {
    margin-block-start: 0 !important;
    margin-block-end: 0 !important;
  }
  
  /* Override default browser spacing */
  ol, ul {
    margin-block-start: 2px !important;
    margin-block-end: 3px !important;
    margin-inline-start: 0 !important;
    margin-inline-end: 0 !important;
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
  
  // Xử lý nội dung để tương thích với định dạng backend đã chuẩn hóa
  const processedContent = React.useMemo(() => {
    if (!content) return '';
    
    // Debug: Log raw content để kiểm tra
    console.log('🔍 Raw content từ backend:', JSON.stringify(content));
    
    let processed = content
      // Chuẩn hóa line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Loại bỏ multiple line breaks - chỉ giữ single line break
      .replace(/\n{2,}/g, '\n')
      // Xử lý khoảng trắng thừa ở đầu/cuối mỗi dòng
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      // Loại bỏ khoảng trắng thừa ở đầu và cuối toàn bộ
      .trim();
    
    // Cải thiện format cho danh sách nguyên liệu
    processed = processed.replace(
      /\*\*Nguyên liệu:\*\*\s*([^\n]*)/g, 
      '**Nguyên liệu:** $1'
    );
    
    console.log('🔍 Processed content cho frontend:', JSON.stringify(processed));
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
          // Custom component để xử lý ordered lists với spacing tốt hơn
          ol: ({ children, start }) => (
            <ol start={start} style={{ 
              listStyleType: 'decimal',
              marginLeft: 0,
              paddingLeft: '16px',
              margin: '1px 0'
            }}>
              {children}
            </ol>
          ),
          // Custom component để xử lý unordered lists với spacing tốt hơn
          ul: ({ children }) => (
            <ul style={{ 
              listStyleType: 'disc',
              marginLeft: 0,
              paddingLeft: '16px',
              margin: '1px 0'
            }}>
              {children}
            </ul>
          ),
          // Custom component để xử lý list items
          li: ({ children, ordered }) => {
            return (
              <li style={{ 
                marginBottom: '1px',
                lineHeight: '1.2',
                wordWrap: 'break-word'
              }}>
                {children}
              </li>
            );
          },
          // Custom component để xử lý strong/bold - đảm bảo in đậm
          strong: ({ children }) => (
            <strong style={{ 
              fontWeight: '700 !important', 
              fontFamily: 'inherit',
              margin: 0,
              padding: 0,
              color: typeof children === 'string' && children.includes('Nguyên liệu:') ? '#2c5aa0' : 'inherit'
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
          // Xử lý text nodes để preserve formatting từ backend
          text: ({ children }) => children,
          // Xử lý headings với màu sắc
          h1: ({ children }) => <h1 style={{ color: '#2c5aa0' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ color: '#2c5aa0' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ color: '#2c5aa0' }}>{children}</h3>,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </MarkdownContainer>
  );
};

export default MarkdownRenderer; 