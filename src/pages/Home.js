// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
//import { FaTruck, FaLeaf, FaShippingFast, FaCheck } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/common/Button/Button';
import ProductCard from '../components/common/ProductCard/ProductCard';
import productService from '../services/productService';
import { Link } from 'react-router-dom';

const Banner = styled.div`
  position: relative;
  height: 500px;
  background-image: url('/assets/banner.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  border-radius: 8px;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
  }
`;

const BannerContent = styled.div`
  position: relative;
  z-index: 1;
  color: white;
  padding: 0 50px;
  max-width: 600px;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
  
  p {
    font-size: 1.1rem;
    margin-bottom: 30px;
    line-height: 1.6;
  }
`;

const Section = styled.section`
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 15px;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: #4CAF50;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
`;

const CategoryCard = styled(Link)`
  position: relative;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  text-decoration: none;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    color: white;
    
    h3 {
      margin: 0 0 5px;
      color: white;
    }
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #388E3C;
  }
`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await productService.getFeaturedProducts();
        console.log('Fetched products:', products); // Kiểm tra dữ liệu trả về
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const data = await productService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchFeaturedProducts();
    fetchCategories();
  }, []);
  
  return (
    <MainLayout>
      <Banner>
        <BannerContent>
          <h1>Rau củ tươi & Thực phẩm 100% sạch.</h1>
          <p>Luôn luôn có sản phẩm mới cho bạn</p>
          <Button variant="secondary" size="large">Mua ngay</Button>
        </BannerContent>
      </Banner>
      
      <Section>
        <SectionTitle>Sản phẩm nổi bật</SectionTitle>
        <ProductGrid>
          {loading ? (
            <p>Đang tải sản phẩm...</p>
          ) : (
            featuredProducts.map(product => {
              // Tìm ảnh chính (primary image)
              const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];

              console.log('Product data:', {
                id: product.product_id,
                name: product.name,
                price: product.price,
                original_price: product.original_price,
                unit: product.unit
              });

              return (
                <ProductCard
                  key={product.product_id}
                  product={{
                    id: product.product_id,
                    name: product.name,
                    price: Number(product.price),
                    original_price: Number(product.original_price),
                    image: primaryImage?.image_url,
                    images: product.images,
                    unit: product.unit
                  }}
                />
              );
            })
          )}
        </ProductGrid>
      </Section>
      
      <Section>
        <SectionTitle>Danh mục sản phẩm</SectionTitle>
        <CategoryGrid>
          {categoryLoading ? (
            <p>Đang tải danh mục...</p>
          ) : (
            categories.slice(0, 6).map(category => (
              <CategoryCard key={category.category_id} to={`/categories/${category.category_id}`}>
                <img
                  src={category.description || '/images/categories/default.jpg'}
                  alt={category.name}
                />
                <div className="overlay">
                  <h3>{category.name}</h3>
                  <CTAButton to={`/categories/${category.category_id}`}>Xem thêm</CTAButton>
                </div>
              </CategoryCard>
            ))
          )}
        </CategoryGrid>
      </Section>
    </MainLayout>
  );
};

export default Home;
