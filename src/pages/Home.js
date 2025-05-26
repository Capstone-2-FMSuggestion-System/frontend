// src/pages/Home.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaLeaf,
  FaTruck,
  FaStar,
  FaShoppingCart,
  FaUtensils,
  FaHeart,
} from "react-icons/fa";
import MainLayout from "../layouts/MainLayout";
import ProductCard from "../components/common/ProductCard/ProductCard";
import { getAllCategories } from "../services/categoryService";
import productService from "../services/productService";
import { Link } from "react-router-dom";

const HeroSection = styled.section`
  position: relative;
  height: 60vh;
  min-height: 400px;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
    url("https://img1.kienthucvui.vn/uploads/2019/10/30/hinh-anh-rau-cu-qua-dep_112153407.jpg");
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-bottom: 0;
  overflow: hidden;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("/assets/pattern.png");
    opacity: 0.1;
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  max-width: 600px;
  padding: 0 1.5rem;
  position: relative;
  z-index: 2;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
    line-height: 1.2;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  }
`;

const Button = styled(Link)`
  display: inline-block;
  padding: 0.8rem 2rem;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 30px;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);

  &:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
  }
`;

const FeaturesSection = styled.section`
  padding: 3rem 0;
  background-color: #fff;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const FeatureCard = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }

  svg {
    font-size: 2rem;
    color: #4caf50;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  p {
    color: #666;
    line-height: 1.4;
    font-size: 0.9rem;
  }
`;

const ProductsSection = styled.section`
  padding: 3rem 0;
  background-color: #f8f9fa;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background-color: #4caf50;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const CategoriesSection = styled.section`
  padding: 3rem 0;
  background-color: #fff;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const CategoryCard = styled(Link)`
  position: relative;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
  }

  &:active {
    transform: scale(0.98);
  }

  .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.5rem;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
    color: white;

    h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    p {
      font-size: 0.9rem;
      opacity: 0.9;
      margin-bottom: 1rem;
    }
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background-color: #4caf50;
  color: white;
  text-decoration: none;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background-color: #45a049;
    transform: translateY(-2px);
  }
`;

const TestimonialSection = styled.section`
  padding: 3rem 0;
  background-color: #f8f9fa;
  text-align: center;
`;

const TestimonialContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1.5rem;

  p {
    font-size: 1.1rem;
    line-height: 1.5;
    color: #333;
    margin-bottom: 1rem;
    font-style: italic;
  }

  .author {
    font-weight: 500;
    color: #4caf50;
  }
`;

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setCategoryLoading(true);

        // Fetch featured products
        const productsData = await productService.getFeaturedProducts();
        console.log("Featured products raw data:", productsData);

        // Chuyển đổi dữ liệu nếu cần thiết
        const formatted = Array.isArray(productsData) ? productsData : [];
        setFeaturedProducts(formatted);

        // Fetch categories
        const categoriesData = await getAllCategories();
        console.log("Categories raw data:", categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Đặt sản phẩm trống để tránh lỗi
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
        setCategoryLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <MainLayout>
      <HeroSection>
        <HeroContent>
          <h1>Bữa ăn ngon cho gia đình bạn</h1>
          <p>Thực phẩm tươi ngon, đảm bảo chất lượng, giao hàng tận nhà</p>
          <Button to="/products">Đặt hàng ngay</Button>
        </HeroContent>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>Tại sao chọn chúng tôi?</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FaLeaf />
            <h3>Thực phẩm tươi ngon</h3>
            <p>Cam kết chất lượng và độ tươi ngon của sản phẩm</p>
          </FeatureCard>
          <FeatureCard>
            <FaTruck />
            <h3>Giao hàng nhanh chóng</h3>
            <p>Đơn hàng được giao trong thời gian ngắn nhất</p>
          </FeatureCard>
          <FeatureCard>
            <FaUtensils />
            <h3>Thực đơn đa dạng</h3>
            <p>Nhiều lựa chọn cho bữa ăn gia đình</p>
          </FeatureCard>
          <FeatureCard>
            <FaHeart />
            <h3>Chăm sóc sức khỏe</h3>
            <p>Sản phẩm được kiểm tra chất lượng nghiêm ngặt</p>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <ProductsSection>
        <SectionTitle>Sản phẩm nổi bật</SectionTitle>
        <ProductsGrid>
          {loading ? (
            <p>Đang tải sản phẩm...</p>
          ) : featuredProducts.length === 0 ? (
            <p>Không có sản phẩm nổi bật</p>
          ) : (
            featuredProducts.map((product) => {
              // Xác định ID sản phẩm
              const productId = product.id || product.product_id;

              // Xử lý hình ảnh một cách tốt hơn
              const getProductImage = () => {
                // Ưu tiên image trực tiếp
                if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
                  return product.image;
                }

                // Kiểm tra mảng images
                if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                  const firstImage = product.images[0];
                  // Nếu là object có image_url
                  if (typeof firstImage === 'object' && firstImage.image_url && typeof firstImage.image_url === 'string' && firstImage.image_url.trim() !== '') {
                    return firstImage.image_url;
                  }
                  // Nếu là string URL
                  if (typeof firstImage === 'string' && firstImage.trim() !== '') {
                    return firstImage;
                  }
                }

                // Fallback image
                return 'https://via.placeholder.com/300x300/f5f5f5/999999?text=Không+có+ảnh';
              };

              // Xử lý giá cả
              const displayPrice = product.price || product.discountPrice || 0;
              const displayOriginalPrice = product.original_price || product.originalPrice || 0;

              // Kiểm tra có giảm giá không
              const hasDiscount = displayOriginalPrice > displayPrice && displayOriginalPrice > 0;

              return (
                <ProductCard
                  key={productId}
                  product={{
                    id: productId,
                    name: product.name,
                    price: displayPrice,
                    discountPrice: hasDiscount ? displayPrice : null,
                    originalPrice: displayOriginalPrice,
                    original_price: displayOriginalPrice,
                    hasDiscount: hasDiscount,
                    image: getProductImage(),
                    images: product.images || [],
                    unit: product.unit || "kg",
                    rating: product.average_rating || 0,
                    reviewCount: product.review_count || 0,
                    is_featured: true
                  }}
                />
              );
            })
          )}
        </ProductsGrid>
      </ProductsSection>

      <CategoriesSection>
        <SectionTitle>Danh mục sản phẩm</SectionTitle>
        <CategoriesGrid>
          {categoryLoading ? (
            <p>Đang tải danh mục...</p>
          ) : (
            categories.slice(0, 6).map((category) => (
              <CategoryCard
                to={`/categories/${category.category_id}`}
                key={category.category_id}
                onClick={handleCategoryClick}
                tabIndex={0}
                aria-label={`Xem danh mục ${category.name}`}
              >
                <img
                  src={category.description || "/images/categories/default.jpg"}
                  alt={category.name}
                />
                <div className="overlay">
                  <h3>{category.name}</h3>
                  <CTAButton to={`/categories/${category.category_id}`}>
                    Xem thêm{" "}
                  </CTAButton>
                </div>
              </CategoryCard>
            ))
          )}
        </CategoriesGrid>
      </CategoriesSection>

      <TestimonialSection>
        <SectionTitle>Khách hàng nói gì về chúng tôi</SectionTitle>
        <TestimonialContent>
          <p>
            "Tôi rất hài lòng với chất lượng sản phẩm và dịch vụ của cửa hàng.
            Thực phẩm luôn tươi ngon, giao hàng nhanh chóng và nhân viên rất
            nhiệt tình."
          </p>
          <p className="author"></p>
        </TestimonialContent>
      </TestimonialSection>
    </MainLayout>
  );
};

export default Home;
