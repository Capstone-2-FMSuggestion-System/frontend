import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/common/ProductCard/ProductCard';
import Pagination from '../components/common/Pagination/Pagination';
import productService from '../services/productService';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const SearchHeader = styled.div`
  margin-bottom: 30px;
`;

const SearchTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 10px;
`;

const SearchInfo = styled.p`
  color: #666;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 50px 0;
  color: #666;
`;

const SearchResults = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Gọi API search trực tiếp để lấy full response
        const response = await fetch(`http://localhost:8000/api/e-commerce/products/search?query=${encodeURIComponent(query)}&page=${currentPage}&limit=9`);
        const data = await response.json();

        console.log('🔍 Search results data:', data);

        if (data && data.products) {
          setProducts(data.products);
          setTotalPages(data.totalPages || 1);
          setTotalResults(data.total || 0);
        } else {
          // Fallback: sử dụng productService.searchProducts
          const products = await productService.searchProducts(query, {
            page: currentPage,
            limit: 9
          });
          setProducts(products || []);
          setTotalPages(1);
          setTotalResults(products?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch search results:', error);
        setProducts([]);
        setTotalPages(1);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <MainLayout>
      <Container>
        <SearchHeader>
          <SearchTitle>Search Results</SearchTitle>
          {!loading && (
            <SearchInfo>
              {totalResults} results found for "{query}"
            </SearchInfo>
          )}
        </SearchHeader>

        {loading ? (
          <p>Loading results...</p>
        ) : (products && products.length > 0) ? (
          <>
            <ProductGrid>
              {products.map(product => (
                <ProductCard key={product.id || product.product_id} product={product} />
              ))}
            </ProductGrid>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <NoResults>
            <p>No results found for "{query}".</p>
            <p>Please try a different search term or browse our categories.</p>
          </NoResults>
        )}
      </Container>
    </MainLayout>
  );
};

export default SearchResults;