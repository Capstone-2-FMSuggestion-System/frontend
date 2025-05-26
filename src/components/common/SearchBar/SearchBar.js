import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaTimes } from 'react-icons/fa';
import productService from '../../../services/productService';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const SearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  
  &:focus-within {
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }
  
  ${props => props.hasResults && `
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: none;
  `}
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  padding: 8px 12px;
  font-size: 16px;
  background: transparent;
  
  &::placeholder {
    color: #999;
  }
`;

const SearchButton = styled.button`
  background: #4CAF50;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #45a049;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  margin-right: 8px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f5f5f5;
    color: #666;
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #4CAF50;
  border-top: none;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 12px;
  border: 1px solid #e0e0e0;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CurrentPrice = styled.span`
  color: #4CAF50;
  font-weight: 600;
  font-size: 14px;
`;

const OriginalPrice = styled.span`
  color: #999;
  text-decoration: line-through;
  font-size: 12px;
`;

const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
`;

const LoadingResults = styled.div`
  padding: 20px;
  text-align: center;
  color: #999;
`;

const SearchBar = ({ placeholder = "Tìm kiếm sản phẩm... (hỗ trợ tìm kiếm gần đúng)", onSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (query.trim().length >= 2) {
      const timer = setTimeout(() => {
        searchProducts(query.trim());
      }, 300);
      setDebounceTimer(timer);
    } else {
      setResults([]);
      setShowDropdown(false);
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [query]);

  const searchProducts = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await productService.searchProducts(searchQuery, {
        limit: 8
      });

      setResults(response || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length < 2) {
      setShowDropdown(false);
      setResults([]);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      if (onSearch) {
        onSearch(query.trim());
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProductClick = (product) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/products/${product.id}`);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const getProductImage = (product) => {
    if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
      return product.image;
    }

    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage.image_url) {
        return firstImage.image_url;
      }
      if (typeof firstImage === 'string') {
        return firstImage;
      }
    }

    return 'https://via.placeholder.com/50x50/f5f5f5/999999?text=No+Image';
  };

  return (
    <SearchContainer ref={searchRef}>
      <SearchInputContainer hasResults={showDropdown && (results.length > 0 || loading)}>
        <SearchInput
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
        />

        {query && (
          <ClearButton onClick={handleClear}>
            <FaTimes size={12} />
          </ClearButton>
        )}

        <SearchButton onClick={handleSearch}>
          <FaSearch size={16} />
        </SearchButton>
      </SearchInputContainer>

      {showDropdown && (
        <DropdownContainer>
          {loading ? (
            <LoadingResults>Đang tìm kiếm...</LoadingResults>
          ) : results.length > 0 ? (
            results.map((product) => (
              <SearchResultItem
                key={product.id || product.product_id}
                onClick={() => handleProductClick(product)}
              >
                <ProductImage
                  src={getProductImage(product)}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/50x50/f5f5f5/999999?text=No+Image';
                  }}
                />
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>
                    <CurrentPrice>
                      {formatPrice(product.discountPrice || product.price || product.originalPrice || 0)}
                    </CurrentPrice>
                    {product.hasDiscount && product.originalPrice && (
                      <OriginalPrice>
                        {formatPrice(product.originalPrice)}
                      </OriginalPrice>
                    )}
                  </ProductPrice>
                </ProductInfo>
              </SearchResultItem>
            ))
          ) : (
            <NoResults>Không tìm thấy sản phẩm nào</NoResults>
          )}
        </DropdownContainer>
      )}
    </SearchContainer>
  );
};

export default SearchBar; 