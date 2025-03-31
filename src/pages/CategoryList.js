// src/pages/CategoryList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaAngleRight } from 'react-icons/fa';
import MainLayout from '../layouts/MainLayout';
import productService from '../services/productService';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const BreadcrumbNav = styled.nav`
  margin-bottom: 20px;
  
  ul {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    align-items: center;
    flex-wrap: wrap;
    
    li {
      display: flex;
      align-items: center;
      
      &:not(:last-child)::after {
        content: '';
        margin: 0 8px;
        display: flex;
        align-items: center;
      }
      
      a {
        color: #666;
        text-decoration: none;
        display: flex;
        align-items: center;
        
        &:hover {
          color: #4CAF50;
        }
      }
      
      &:last-child a {
        color: #333;
        font-weight: 500;
        pointer-events: none;
      }
    }
  }
`;

const PageHeader = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  margin-bottom: 10px;
  color: #333;
`;

const PageDescription = styled.p`
  color: #666;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  animation: fadeIn 0.5s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
  }
`;

const CategoryCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    
    img {
      transform: scale(1.05);
    }
  }
`;

const CategoryImageContainer = styled.div`
  height: 180px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
`;

const CategoryContent = styled.div`
  padding: 15px 20px;
`;

const CategoryName = styled.h3`
  margin: 0 0 10px;
  font-size: 18px;
  color: #333;
  
  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      color: #4CAF50;
    }
  }
`;

const CategoryDescription = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 15px;
`;

const ViewButton = styled(Link)`
  display: inline-block;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #388E3C;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px 0;
  color: #4CAF50;
  font-size: 18px;
`;

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await productService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  return (
    <MainLayout>
      <PageContainer>
        <BreadcrumbNav>
          <ul>
            <li>
              <Link to="/">
                <FaHome /> Trang chủ
              </Link>
              <FaAngleRight />
            </li>
            <li>
              <Link to="/categories">
                Danh mục sản phẩm
              </Link>
            </li>
          </ul>
        </BreadcrumbNav>
        
        <PageHeader>
          <PageTitle>Danh mục sản phẩm</PageTitle>
          <PageDescription>
            Khám phá các danh mục sản phẩm đa dạng của chúng tôi với thực phẩm tươi sống, 
            thực phẩm chế biến sẵn và nhiều loại thực phẩm khác đảm bảo chất lượng và an toàn.
          </PageDescription>
        </PageHeader>
        
        {loading ? (
          <LoadingSpinner>
            Đang tải danh mục sản phẩm...
          </LoadingSpinner>
        ) : (
          <CategoryGrid>
            {categories.map(category => (
              <CategoryCard key={category.id}>
                <CategoryImageContainer>
                  <img src={category.image} alt={category.name} />
                </CategoryImageContainer>
                <CategoryContent>
                  <CategoryName>
                    <Link to={`/categories/${category.id}`}>{category.name}</Link>
                  </CategoryName>
                  <CategoryDescription>
                    {category.description}
                  </CategoryDescription>
                  <ViewButton to={`/categories/${category.id}`}>
                    Xem sản phẩm
                  </ViewButton>
                </CategoryContent>
              </CategoryCard>
            ))}
          </CategoryGrid>
        )}
      </PageContainer>
    </MainLayout>
  );
};

export default CategoryList;