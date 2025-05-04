import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { FaHeart, FaTrash, FaShoppingCart } from 'react-icons/fa';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button/Button';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import productService from '../../services/productService';
import { Link } from 'react-router-dom';

const WishlistContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
`;

const WishlistTitle = styled.h1`
  font-size: 28px;
  margin-bottom: 30px;
`;

const CardContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
`;

const CardHeader = styled.div`
  background: #f5f5f5;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  
  h2 {
    margin: 0;
    font-size: 18px;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 10px;
      color: #ff6b6b;
    }
  }
`;

const CardBody = styled.div`
  padding: 20px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductContent = styled.div`
  padding: 15px;
`;

const ProductTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 16px;
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  .current {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }
  
  .original {
    margin-left: 10px;
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
  }
`;

const ProductActions = styled.div`
  display: flex;
  gap: 10px;
`;

const EmptyWishlist = styled.div`
  text-align: center;
  padding: 30px;
  
  svg {
    font-size: 48px;
    color: #ff6b6b;
    margin-bottom: 20px;
  }
  
  h3 {
    margin: 0 0 10px;
    font-size: 18px;
    color: #333;
  }
  
  p {
    margin: 0 0 20px;
    color: #666;
  }
`;

const Wishlist = () => {
  const { currentUser } = useContext(AuthContext);
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        // This would normally be fetched from API
        // Simulating wishlist data for now
        const mockWishlist = [
          {
            id: 1,
            productId: 1,
            name: "Ba chỉ heo Nga Ace Foods 300g",
            image: "/assets/products/pork-belly-1.jpg",
            price: 28000,
            originalPrice: 42600,
            inStock: true
          },
          {
            id: 2,
            productId: 3,
            name: "Cá hồi fillet 250g",
            image: "/assets/products/salmon-fillet-1.jpg",
            price: 90000,
            originalPrice: 100000,
            inStock: true
          }
        ];

        setWishlist(mockWishlist);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchWishlist();
    }
  }, [currentUser]);

  const handleRemoveFromWishlist = (id) => {
    // This would normally call API
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  const handleAddToCart = (product) => {
    addToCart({
      id: product.productId,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: 1
    });
  };

  return (
    <MainLayout>
      <WishlistContainer>
        <WishlistTitle>My Wishlist</WishlistTitle>

        <CardContainer>
          <CardHeader>
            <h2><FaHeart /> Saved Items</h2>
          </CardHeader>
          <CardBody>
            {loading ? (
              <p>Loading wishlist...</p>
            ) : wishlist.length > 0 ? (
              <ProductGrid>
                {wishlist.map(item => (
                  <ProductCard key={item.id}>
                    <ProductImage>
                      <img src={item.image} alt={item.name} />
                    </ProductImage>
                    <ProductContent>
                      <ProductTitle>{item.name}</ProductTitle>
                      <ProductPrice>
                        <span className="current">{item.price}đ</span>
                        {item.originalPrice > item.price && (
                          <span className="original">{item.originalPrice}đ</span>
                        )}
                      </ProductPrice>
                      <ProductActions>
                        <Button
                          variant="primary"
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.inStock}
                          fullWidth
                        >
                          <FaShoppingCart /> Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                        >
                          <FaTrash />
                        </Button>
                      </ProductActions>
                    </ProductContent>
                  </ProductCard>
                ))}
              </ProductGrid>
            ) : (
              <EmptyWishlist>
                <FaHeart />
                <h3>Your wishlist is empty</h3>
                <p>Save items you love to your wishlist and review them anytime.</p>
                <Button
                  variant="primary"
                  as={Link}
                  to="/"
                >
                  Start Shopping
                </Button>
              </EmptyWishlist>
            )}
          </CardBody>
        </CardContainer>
      </WishlistContainer>
    </MainLayout>
  );
};

export default Wishlist;