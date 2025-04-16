import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTruck, FaLeaf, FaShippingFast, FaCheck } from "react-icons/fa";
import MainLayout from "../layouts/MainLayout";
import Button from "../components/common/Button/Button";
import ProductCard from "../components/common/ProductCard/ProductCard";
import productService from "../services/productService";

const Banner = styled.div`
  position: relative;
  height: 500px;
  background-image: url("/assets/banner.jpg");
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  border-radius: 8px;
  overflow: hidden;

  &:before {
    content: "";
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
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: #4caf50;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  margin: 40px 0;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;

  svg {
    font-size: 2rem;
    color: #4caf50;
    margin-right: 15px;
    flex-shrink: 0;
  }

  div {
    h3 {
      margin: 0 0 8px;
      font-size: 1.2rem;
    }

    p {
      margin: 0;
      color: #666;
    }
  }
`;

const PromoBanner = styled.div`
  background-color: #f9f5e8;
  padding: 40px;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin: 40px 0;

  div {
    max-width: 60%;

    h3 {
      font-size: 1.5rem;
      margin: 0 0 15px;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }
  }

  @media (max-width: 768px) {
    padding: 30px;
    flex-direction: column;

    div {
      max-width: 100%;
      margin-bottom: 20px;
    }
  }
`;

const CategorySection = styled.div`
  margin: 40px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

// ✅ ĐÂY LÀ PHẦN ĐÃ THAY ĐỔI
const CategoryCard = styled.div`
  position: relative;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.1);
  }

  .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.65), transparent 60%);
    color: white;
    transition: all 0.3s ease;

    h3 {
      margin: 0 0 5px;
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }

    p {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.85;
      transition: opacity 0.3s ease;
    }
  }

  &:hover .overlay {
    padding-bottom: 25px;
  }

  &:hover .overlay h3 {
    transform: translateY(-5px);
  }

  &:hover .overlay p {
    opacity: 1;
  }
`;

// COMPONENT CHÍNH
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getFeaturedProducts();
        setFeaturedProducts(data);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <MainLayout>
      <Banner>
        <BannerContent>
          <h1>Rau củ tươi & Thực phẩm 100% sạch.</h1>
          <p>Luôn luôn có sản phẩm mới cho bạn</p>
          <Button variant="secondary" size="large">
            Mua ngay
          </Button>
        </BannerContent>
      </Banner>

      <Features>
        <FeatureItem>
          <FaTruck />
          <div>
            <h3>Top Seeds</h3>
            <p>
              Farm-to-table to bring quality and health to your family's table
              every day
            </p>
          </div>
        </FeatureItem>
        <FeatureItem>
          <FaLeaf />
          <div>
            <h3>Organic Certified</h3>
            <p>
              Organically grown products for a healthier, chemical-free
              lifestyle
            </p>
          </div>
        </FeatureItem>
        <FeatureItem>
          <FaShippingFast />
          <div>
            <h3>Fresh groceries</h3>
            <p>
              Fresh groceries at your doorstep in no time, ensuring convenience
            </p>
          </div>
        </FeatureItem>
        <FeatureItem>
          <FaCheck />
          <div>
            <h3>Trusted Products</h3>
            <p>
              Handpicked, high-quality items you can rely on for your family's
              well-being
            </p>
          </div>
        </FeatureItem>
      </Features>

      <PromoBanner>
        <div>
          <h3>Giao hàng miễn phí khi bạn chi tiêu trên 200.000đ</h3>
          <p>Đặt hàng ngay hôm nay để tận hưởng dịch vụ giao hàng miễn phí</p>
        </div>
        <Button variant="secondary">Mua ngay</Button>
      </PromoBanner>

      <Section>
        <SectionTitle>Sản phẩm nổi bật</SectionTitle>
        <ProductGrid>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </ProductGrid>
      </Section>

      <Section>
        <SectionTitle>Danh mục sản phẩm</SectionTitle>
        <CategorySection>
          <CategoryCard>
            <img src="/assets/categories/meat.jpg" alt="Meat" />
            <div className="overlay">
              <h3>Thịt tươi</h3>
              <p>Giảm đến 30%</p>
            </div>
          </CategoryCard>
          <CategoryCard>
            <img src="/assets/categories/vegetables.jpg" alt="Vegetables" />
            <div className="overlay">
              <h3>Thực phẩm tươi mới hàng ngày</h3>
              <p>Giảm đến 30%</p>
            </div>
          </CategoryCard>
          <CategoryCard>
            <img src="/assets/categories/fruits.jpg" alt="Fruits" />
            <div className="overlay">
              <h3>Trái cây đặc biệt giảm giá</h3>
              <p>Giảm đến 30%</p>
            </div>
          </CategoryCard>
        </CategorySection>
      </Section>
    </MainLayout>
  );
};

export default Home;
