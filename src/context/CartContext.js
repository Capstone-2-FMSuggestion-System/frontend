// src/context/CartContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from './ToastContext';
import { AuthContext } from './AuthContext';
import authService from '../services/authService';
import userService from '../services/userService';
import orderService from '../services/orderService';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : {
      items: [],
      totalAmount: 0,
      totalItems: 0,
      discount: 0,
      couponCode: null,
      discountedTotal: 0
    };
  });

  const { currentUser } = useContext(AuthContext);
  const toast = useToast();

  // Thêm state để theo dõi trạng thái đồng bộ
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [syncRetryCount, setSyncRetryCount] = useState(0);
  const [skipNextSync, setSkipNextSync] = useState(false); // Flag để skip sync sau khi clear cart
  const MAX_RETRY_COUNT = 3;
  const RETRY_DELAY = 1000; // 1 giây

  // Hàm trợ giúp để thực hiện retry với delay
  const retryWithDelay = async (fn, retryCount = 0) => {
    try {
      return await fn();
    } catch (error) {
      if (retryCount < MAX_RETRY_COUNT) {
        console.log(`Retrying... (${retryCount + 1}/${MAX_RETRY_COUNT})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return retryWithDelay(fn, retryCount + 1);
      }
      throw error;
    }
  };

  // Thêm useEffect để theo dõi trạng thái đăng nhập/đăng xuất của người dùng
  useEffect(() => {
    // Nếu người dùng đăng xuất (currentUser là null), đặt lại giỏ hàng
    if (!currentUser) {
      console.log('User logged out, resetting cart');
      const emptyCart = {
        items: [],
        totalAmount: 0,
        totalItems: 0,
        discount: 0,
        couponCode: null,
        discountedTotal: 0
      };
      setCart(emptyCart);
      localStorage.setItem('cart', JSON.stringify(emptyCart));
    }
  }, [currentUser]);

  // Load cart from server when user logs in
  useEffect(() => {
    const loadCartFromServer = async () => {
      if (currentUser) {
        try {
          const serverCartItems = await userService.getCart();
          // console.log('Server cart:', serverCartItems);

          if (serverCartItems && serverCartItems.length > 0) {
            // Format server cart items
            const formattedItems = serverCartItems.map(item => ({
              id: item.product_id,
              cart_item_id: item.cart_item_id,
              name: item.product?.name || 'Unknown Product',
              price: item.product?.price || 0,
              originalPrice: item.product?.original_price,
              quantity: item.quantity || 0,
              image: item.product?.images && item.product.images.length > 0
                ? item.product.images.find(img => img.is_primary)?.image_url || item.product.images[0].image_url
                : null,
              unit: item.product?.unit || 'kg',
              notes: item.notes || ''
            }));

            // Update cart with server data
            const updatedCart = {
              ...cart,
              items: formattedItems,
              totalAmount: formattedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
            };

            setCart(updatedCart);
            localStorage.setItem('cart', JSON.stringify(updatedCart));
            console.log('Cart updated from server:', updatedCart);
          }
        } catch (error) {
          console.error('Failed to load cart from server:', error);
          toast.error('Không thể tải giỏ hàng từ server');
        }
      }
    };

    loadCartFromServer();
  }, [currentUser]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));

    // Nếu người dùng đã đăng nhập, đồng bộ giỏ hàng với server
    if (currentUser && !skipNextSync) {
      syncCartWithServer();
    } else if (skipNextSync) {
      // Reset flag sau khi skip
      setSkipNextSync(false);
    }
  }, [cart, currentUser, skipNextSync]);

  // Đồng bộ giỏ hàng với server
  const syncCartWithServer = async () => {
    if (!currentUser || isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Chỉ đồng bộ các sản phẩm chưa có cart_item_id
      const itemsToSync = cart.items.filter(item => !item.cart_item_id);

      if (itemsToSync.length === 0) {
        // console.log('No items to sync');
        setIsSyncing(false);
        return;
      }

      console.log(`Syncing ${itemsToSync.length} items...`);

      // Đồng bộ từng sản phẩm một cách tuần tự
      for (const item of itemsToSync) {
        // Kiểm tra xem item.id có tồn tại và hợp lệ không
        if (!item.id) {
          console.error('Invalid product ID:', item);
          continue; // Bỏ qua item không có ID
        }

        const cartItem = {
          product_id: item.id,
          quantity: item.quantity,
          notes: item.notes || ''
        };

        console.log('Syncing cart item:', cartItem);

        // Sử dụng retryWithDelay để thử lại nếu gặp lỗi
        const response = await retryWithDelay(async () => {
          return await userService.addToCart(cartItem);
        });

        // Cập nhật cart_item_id trong state local
        setCart(prevCart => {
          const newItems = prevCart.items.map(i =>
            i.id === item.id ? { ...i, cart_item_id: response.cart_item_id } : i
          );
          return { ...prevCart, items: newItems };
        });
      }

      console.log('Cart synced with server');
      setSyncRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Failed to sync cart with server:', error);
      setSyncError(error.message);
      setSyncRetryCount(prev => prev + 1);
      toast.error('Không thể đồng bộ giỏ hàng với server');
    } finally {
      setIsSyncing(false);
    }
  };

  // Cập nhật useEffect để tránh đồng bộ quá thường xuyên
  useEffect(() => {
    if (currentUser && cart.items.length > 0) {
      // Chỉ đồng bộ nếu có sản phẩm chưa có cart_item_id
      const hasUnsyncedItems = cart.items.some(item => !item.cart_item_id);

      if (hasUnsyncedItems) {
        // Sử dụng debounce để tránh gọi quá nhiều lần
        const timeoutId = setTimeout(() => {
          syncCartWithServer();
        }, 1000); // Đợi 1 giây sau khi giỏ hàng thay đổi

        return () => clearTimeout(timeoutId);
      }
    }
  }, [cart, currentUser]);

  // Add function to calculate total amount
  const calculateTotalAmount = (items) => {
    return items.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  // Update addToCart function
  const addToCart = async (product, quantity = 1) => {
    try {
      // Kiểm tra xem product có hợp lệ không
      if (!product || !product.id) {
        console.error('Invalid product:', product);
        toast.error({
          title: 'Lỗi',
          message: 'Sản phẩm không hợp lệ',
          duration: 3000
        });
        return;
      }

      const existingItemIndex = cart.items.findIndex(item => item.id === product.id);

      let updatedItems;
      if (existingItemIndex > -1) {
        updatedItems = cart.items.map((item, index) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: item.quantity + quantity
            };
          }
          return item;
        });
        toast.success({
          title: 'Cập nhật giỏ hàng',
          message: 'Đã cập nhật số lượng sản phẩm trong giỏ hàng',
          duration: 3000
        });
      } else {
        updatedItems = [...cart.items, {
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity: quantity,
          image: product.image,
          unit: product.unit || 'kg',
          notes: ''
        }];
        toast.success({
          title: 'Thêm vào giỏ hàng',
          message: 'Đã thêm sản phẩm vào giỏ hàng thành công',
          duration: 3000
        });
      }

      const totalAmount = calculateTotalAmount(updatedItems);

      const updatedCart = {
        ...cart,
        items: updatedItems,
        totalAmount: totalAmount
      };

      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));

      if (currentUser) {
        await syncCartWithServer();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error({
        title: 'Lỗi',
        message: 'Không thể thêm sản phẩm vào giỏ hàng',
        duration: 3000
      });
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      if (currentUser) {
        // Nếu đã đăng nhập, xóa từ database
        const itemToRemove = cart.items.find(item =>
          item.cart_item_id === cartItemId || item.id === cartItemId
        );

        if (!itemToRemove) {
          console.warn('Cart item not found in local state:', cartItemId);
          // Thay vì hiển thị lỗi, chỉ log warning và return
          return;
        }

        // Cập nhật state local trước
        const updatedItems = cart.items.filter(item =>
          item.cart_item_id !== cartItemId && item.id !== cartItemId
        );

        const updatedCart = {
          ...cart,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems)
        };

        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));

        // Sau đó xóa từ server nếu có cart_item_id
        if (itemToRemove.cart_item_id) {
          try {
            await userService.removeFromCart(itemToRemove.cart_item_id);
          } catch (error) {
            console.warn('Item already removed from server or not found:', itemToRemove.cart_item_id);
            // Không hiển thị lỗi nếu item đã bị xóa từ server
          }
        }

        toast.success({
          title: 'Xóa khỏi giỏ hàng',
          message: 'Đã xóa sản phẩm khỏi giỏ hàng thành công',
          duration: 3000
        });
      } else {
        // Nếu chưa đăng nhập, xóa từ localStorage
        const updatedItems = cart.items.filter(item => item.id !== cartItemId);
        const updatedCart = {
          ...cart,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems)
        };

        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        toast.success({
          title: 'Xóa khỏi giỏ hàng',
          message: 'Đã xóa sản phẩm khỏi giỏ hàng thành công',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error({
        title: 'Lỗi',
        message: 'Không thể xóa sản phẩm khỏi giỏ hàng',
        duration: 3000
      });
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      if (currentUser) {
        // Nếu đã đăng nhập, cập nhật trong database
        const itemToUpdate = cart.items.find(item =>
          item.cart_item_id === cartItemId || item.id === cartItemId
        );

        if (!itemToUpdate) {
          console.error('Cart item not found:', cartItemId);
          toast.error({
            title: 'Lỗi',
            message: 'Không tìm thấy sản phẩm trong giỏ hàng',
            duration: 3000
          });
          return;
        }

        // Đảm bảo quantity là số và nằm trong khoảng hợp lệ
        const newQuantity = Math.max(1, Math.min(parseInt(quantity), 99));

        // Cập nhật state local trước
        const updatedItems = cart.items.map(item => {
          if (item.cart_item_id === cartItemId || item.id === cartItemId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        const updatedCart = {
          ...cart,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems)
        };

        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));

        // Sau đó cập nhật lên server nếu có cart_item_id
        if (itemToUpdate.cart_item_id) {
          try {
            // Kiểm tra xem cart_item_id có tồn tại trên server không
            const serverCart = await userService.getCart();
            const serverItem = serverCart.find(item => item.cart_item_id === itemToUpdate.cart_item_id);

            if (serverItem) {
              // Nếu item tồn tại trên server, cập nhật số lượng
              await userService.updateCartItem(itemToUpdate.cart_item_id, newQuantity);
              toast.success({
                title: 'Cập nhật số lượng',
                message: 'Đã cập nhật số lượng sản phẩm thành công',
                duration: 3000
              });
            } else {
              // Nếu item không tồn tại trên server, thêm lại vào giỏ hàng
              console.log('Item not found on server, adding it back to cart');
              await userService.addToCart({
                product_id: itemToUpdate.id,
                quantity: newQuantity
              });

              // Tải lại giỏ hàng từ server
              const updatedServerCart = await userService.getCart();
              if (updatedServerCart && updatedServerCart.length > 0) {
                // Format server cart items
                const formattedItems = updatedServerCart.map(item => ({
                  id: item.product_id,
                  cart_item_id: item.cart_item_id,
                  name: item.product?.name || 'Unknown Product',
                  price: item.product?.price || 0,
                  originalPrice: item.product?.original_price,
                  quantity: item.quantity || 0,
                  image: item.product?.images && item.product.images.length > 0
                    ? item.product.images.find(img => img.is_primary)?.image_url || item.product.images[0].image_url
                    : null,
                  unit: item.product?.unit || 'kg',
                  notes: item.notes || ''
                }));

                // Update cart with server data
                const newCart = {
                  ...cart,
                  items: formattedItems,
                  totalAmount: formattedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
                };

                setCart(newCart);
                localStorage.setItem('cart', JSON.stringify(newCart));

                toast.success({
                  title: 'Cập nhật số lượng',
                  message: 'Đã cập nhật số lượng sản phẩm thành công',
                  duration: 3000
                });
              }
            }
          } catch (error) {
            console.error('Error updating cart item on server:', error);
            toast.error({
              title: 'Lỗi',
              message: 'Không thể cập nhật số lượng sản phẩm',
              duration: 3000
            });
          }
        }
      } else {
        // Nếu chưa đăng nhập, cập nhật trong localStorage
        const itemToUpdate = cart.items.find(item => item.id === cartItemId);

        if (!itemToUpdate) {
          console.error('Cart item not found:', cartItemId);
          toast.error({
            title: 'Lỗi',
            message: 'Không tìm thấy sản phẩm trong giỏ hàng',
            duration: 3000
          });
          return;
        }

        // Đảm bảo quantity là số và nằm trong khoảng hợp lệ
        const newQuantity = Math.max(1, Math.min(parseInt(quantity), 99));

        const updatedItems = cart.items.map(item => {
          if (item.id === cartItemId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        const updatedCart = {
          ...cart,
          items: updatedItems,
          totalAmount: calculateTotalAmount(updatedItems)
        };

        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        toast.success({
          title: 'Cập nhật số lượng',
          message: 'Đã cập nhật số lượng sản phẩm thành công',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error({
        title: 'Lỗi',
        message: 'Không thể cập nhật số lượng sản phẩm',
        duration: 3000
      });
    }
  };

  const clearCart = async () => {
    try {
      if (currentUser) {
        // Nếu đã đăng nhập, xóa tất cả items trong database
        const currentCart = JSON.parse(localStorage.getItem('cart') || '{"items": [], "totalAmount": 0}');

        // Xóa từng item một cách an toàn, không hiển thị toast cho từng item
        for (const item of currentCart.items) {
          if (item.cart_item_id) {
            try {
              await userService.removeFromCart(item.cart_item_id);
            } catch (error) {
              // Bỏ qua lỗi nếu item không tồn tại (có thể đã bị xóa)
              console.warn('Item already removed or not found:', item.cart_item_id);
            }
          }
        }

        // Cập nhật giỏ hàng trống từ server
        try {
          const updatedCart = await authService.getUserCart();

          // Đảm bảo cấu trúc dữ liệu giỏ hàng nhất quán
          const formattedCart = {
            items: updatedCart.items || [],
            totalAmount: updatedCart.totalAmount || 0,
            totalItems: updatedCart.totalItems || 0,
            discount: 0,
            couponCode: null,
            discountedTotal: updatedCart.discountedTotal || 0
          };

          setCart(formattedCart);
          localStorage.setItem('cart', JSON.stringify(formattedCart));
        } catch (error) {
          // Nếu không lấy được từ server, set cart trống
          const emptyCart = {
            items: [],
            totalAmount: 0,
            totalItems: 0,
            discount: 0,
            couponCode: null,
            discountedTotal: 0
          };
          setCart(emptyCart);
          localStorage.setItem('cart', JSON.stringify(emptyCart));
        }

        // Chỉ hiển thị 1 toast duy nhất
        toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
      } else {
        // Nếu chưa đăng nhập, xóa từ localStorage
        const emptyCart = {
          items: [],
          totalAmount: 0,
          totalItems: 0,
          discount: 0,
          couponCode: null,
          discountedTotal: 0
        };
        setCart(emptyCart);
        localStorage.setItem('cart', JSON.stringify(emptyCart));
        toast.success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Vẫn set cart trống để đảm bảo UI được cập nhật
      const emptyCart = {
        items: [],
        totalAmount: 0,
        totalItems: 0,
        discount: 0,
        couponCode: null,
        discountedTotal: 0
      };
      setCart(emptyCart);
      localStorage.setItem('cart', JSON.stringify(emptyCart));
      toast.error('Không thể xóa giỏ hàng hoàn toàn, nhưng đã làm sạch giao diện');
    }
  };

  const clearCartSilently = async (skipApiCall = false) => {
    try {
      if (currentUser && !skipApiCall) {
        // Nếu đã đăng nhập và không skip API call, xóa tất cả items trong database
        const currentCart = JSON.parse(localStorage.getItem('cart') || '{"items": [], "totalAmount": 0}');

        // Chỉ xóa từng item nếu có items trong cart
        if (currentCart.items && currentCart.items.length > 0) {
          // Xóa từng item một cách an toàn, không hiển thị toast
          for (const item of currentCart.items) {
            if (item.cart_item_id) {
              try {
                await userService.removeFromCart(item.cart_item_id);
              } catch (error) {
                // Bỏ qua lỗi nếu item không tồn tại (có thể đã bị xóa bởi backend)
                console.warn('Item already removed or not found:', item.cart_item_id);
              }
            }
          }
        }

        // Cập nhật giỏ hàng trống từ server
        try {
          const updatedCart = await authService.getUserCart();

          const formattedCart = {
            items: updatedCart.items || [],
            totalAmount: updatedCart.totalAmount || 0,
            totalItems: updatedCart.totalItems || 0,
            discount: 0,
            couponCode: null,
            discountedTotal: updatedCart.discountedTotal || 0
          };

          setCart(formattedCart);
          localStorage.setItem('cart', JSON.stringify(formattedCart));
        } catch (error) {
          // Nếu không lấy được từ server, set cart trống
          const emptyCart = {
            items: [],
            totalAmount: 0,
            totalItems: 0,
            discount: 0,
            couponCode: null,
            discountedTotal: 0
          };
          setCart(emptyCart);
          localStorage.setItem('cart', JSON.stringify(emptyCart));
        }
      } else {
        // Nếu chưa đăng nhập hoặc skip API call (sau thanh toán), chỉ xóa local state
        const emptyCart = {
          items: [],
          totalAmount: 0,
          totalItems: 0,
          discount: 0,
          couponCode: null,
          discountedTotal: 0
        };
        setCart(emptyCart);
        localStorage.setItem('cart', JSON.stringify(emptyCart));
        console.log('Cart cleared locally (skipped API calls)');
      }
    } catch (error) {
      console.error('Error clearing cart silently:', error);
      // Vẫn set cart trống để đảm bảo UI được cập nhật
      const emptyCart = {
        items: [],
        totalAmount: 0,
        totalItems: 0,
        discount: 0,
        couponCode: null,
        discountedTotal: 0
      };
      setCart(emptyCart);
      localStorage.setItem('cart', JSON.stringify(emptyCart));
    }
  };

  // Thêm sản phẩm vào danh sách "Mua sau"
  const saveForLater = (product) => {
    try {
      setCart(prevCart => {
        const updatedCart = { ...prevCart };
        // Kiểm tra xem sản phẩm đã có trong danh sách chưa
        if (!updatedCart.savedForLater.some(item => item.id === product.id)) {
          updatedCart.savedForLater.push(product);
          localStorage.setItem('cart', JSON.stringify(updatedCart));
          toast.success('Đã lưu sản phẩm để mua sau');
        }
        return updatedCart;
      });
    } catch (error) {
      console.error('Error saving product for later:', error);
      toast.error('Không thể lưu sản phẩm để mua sau');
    }
  };

  // Xóa sản phẩm khỏi danh sách "Mua sau"
  const removeFromSavedForLater = (productId) => {
    try {
      setCart(prevCart => {
        const updatedCart = { ...prevCart };
        updatedCart.savedForLater = updatedCart.savedForLater.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        toast.success('Đã xóa sản phẩm khỏi danh sách mua sau');
        return updatedCart;
      });
    } catch (error) {
      console.error('Error removing from saved for later:', error);
      toast.error('Không thể xóa sản phẩm khỏi danh sách mua sau');
    }
  };

  // Cập nhật ghi chú cho giỏ hàng
  const updateCartNotes = (notes) => {
    try {
      setCart(prevCart => {
        const updatedCart = { ...prevCart, notes };
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });
      toast.success('Đã cập nhật ghi chú cho giỏ hàng');
    } catch (error) {
      console.error('Error updating cart notes:', error);
      toast.error('Không thể cập nhật ghi chú cho giỏ hàng');
    }
  };

  // Cập nhật ghi chú cho sản phẩm
  const updateItemNotes = (cartItemId, notes) => {
    try {
      if (currentUser) {
        // Nếu đã đăng nhập, cập nhật trong database
        userService.updateCartItemNotes(cartItemId, notes);
      }

      setCart(prevCart => {
        const updatedCart = { ...prevCart };
        const itemIndex = updatedCart.items.findIndex(item => item.cart_item_id === cartItemId);
        if (itemIndex >= 0) {
          updatedCart.items[itemIndex].notes = notes;
          localStorage.setItem('cart', JSON.stringify(updatedCart));
          toast.success('Đã cập nhật ghi chú cho sản phẩm');
        }
        return updatedCart;
      });
    } catch (error) {
      console.error('Error updating item notes:', error);
      toast.error('Không thể cập nhật ghi chú cho sản phẩm');
    }
  };

  // Cập nhật phí vận chuyển
  const updateShippingFee = (fee) => {
    try {
      setCart(prevCart => {
        const updatedCart = { ...prevCart, shippingFee: fee };
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });
    } catch (error) {
      console.error('Error updating shipping fee:', error);
      toast.error('Không thể cập nhật phí vận chuyển');
    }
  };

  // Cập nhật thuế
  const updateTax = (tax) => {
    try {
      setCart(prevCart => {
        const updatedCart = { ...prevCart, tax };
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });
    } catch (error) {
      console.error('Error updating tax:', error);
      toast.error('Không thể cập nhật thuế');
    }
  };

  // Cập nhật giảm giá
  const updateDiscount = (discount) => {
    try {
      setCart(prevCart => {
        const updatedCart = { ...prevCart, discount };
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
      });
    } catch (error) {
      console.error('Error updating discount:', error);
      toast.error('Không thể cập nhật giảm giá');
    }
  };

  // Tính tổng tiền cuối cùng
  const getFinalTotal = () => {
    return cart.totalAmount + cart.shippingFee + cart.tax - cart.discount;
  };

  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateTotals = (items) => {
    const totalAmount = items.reduce((total, item) => {
      const itemPrice = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (itemPrice * quantity);
    }, 0);

    const totalItems = items.reduce((total, item) => {
      return total + (Number(item.quantity) || 0);
    }, 0);

    return { totalAmount, totalItems };
  };

  // Cập nhật thông tin giảm giá trong giỏ hàng
  const updateCartDiscountInfo = (discount, couponCode) => {
    // Đảm bảo chuyển đổi thành số và làm tròn 2 chữ số thập phân
    const discountNumber = Number(parseFloat(discount).toFixed(2)) || 0;
    const totalAmount = Number(parseFloat(cart.totalAmount).toFixed(2)) || 0;

    // Đảm bảo discountedTotal không âm
    const discountedTotal = Math.max(0, totalAmount - discountNumber);

    console.log('Cập nhật thông tin giảm giá:', {
      original: {
        discount,
        couponCode
      },
      calculated: {
        discountNumber,
        totalAmount,
        discountedTotal
      }
    });

    const updatedCart = {
      ...cart,
      discount: discountNumber,
      couponCode,
      discountedTotal
    };

    // Lưu vào state 
    setCart(updatedCart);

    // Lưu vào localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    return { discountNumber, discountedTotal };
  };

  // Function để force refresh cart state
  const forceRefreshCart = () => {
    const currentCart = JSON.parse(localStorage.getItem('cart') || '{"items": [], "totalAmount": 0}');
    console.log('Force refreshing cart state:', currentCart);
    setCart(currentCart);
  };

  // Function chuyên dụng để clear cart sau khi thanh toán thành công
  const clearCartAfterPayment = async () => {
    try {
      console.log('=== CLEARING CART AFTER PAYMENT ===');
      console.log('Current cart before clearing:', cart);

      // Set flag để skip sync với server
      setSkipNextSync(true);

      // Sau khi thanh toán thành công, backend thường đã xử lý việc xóa cart
      // Nên chúng ta chỉ cần clear local state mà không gọi API
      const emptyCart = {
        items: [],
        totalAmount: 0,
        totalItems: 0,
        discount: 0,
        couponCode: null,
        discountedTotal: 0
      };

      // Clear localStorage trước
      localStorage.setItem('cart', JSON.stringify(emptyCart));

      // Sau đó update state
      setCart(emptyCart);

      console.log('Cart cleared locally after successful payment');
      console.log('=== CART CLEARING COMPLETED ===');

      // Force refresh để đảm bảo UI được cập nhật
      setTimeout(() => {
        forceRefreshCart();
      }, 100);

      // Không sync với server ngay lập tức để tránh load lại cart cũ
      // Server đã xử lý việc clear cart sau thanh toán thành công
    } catch (error) {
      console.error('Error clearing cart after payment:', error);
      // Vẫn clear local state để đảm bảo UI được cập nhật
      setSkipNextSync(true);
      const emptyCart = {
        items: [],
        totalAmount: 0,
        totalItems: 0,
        discount: 0,
        couponCode: null,
        discountedTotal: 0
      };
      localStorage.setItem('cart', JSON.stringify(emptyCart));
      setCart(emptyCart);
      setTimeout(() => {
        forceRefreshCart();
      }, 100);
    }
  };

  // Function để sync cart với server một cách an toàn
  const syncCartSafely = async () => {
    if (!currentUser) return;

    try {
      console.log('Syncing cart safely with server...');
      const serverCart = await authService.getUserCart();

      if (serverCart) {
        const formattedCart = {
          items: serverCart.items || [],
          totalAmount: serverCart.totalAmount || 0,
          totalItems: serverCart.totalItems || 0,
          discount: cart.discount || 0,
          couponCode: cart.couponCode || null,
          discountedTotal: serverCart.discountedTotal || serverCart.totalAmount || 0
        };

        setCart(formattedCart);
        localStorage.setItem('cart', JSON.stringify(formattedCart));
        console.log('Cart synced safely with server:', formattedCart);
      }
    } catch (error) {
      console.warn('Could not sync cart with server:', error);
      // Không throw error để tránh ảnh hưởng đến UI
    }
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearCartSilently,
    clearCartAfterPayment,
    syncCartSafely,
    getCartItemCount,
    saveForLater,
    removeFromSavedForLater,
    updateCartNotes,
    updateItemNotes,
    updateShippingFee,
    updateTax,
    updateDiscount,
    getFinalTotal,
    isSyncing,
    syncError,
    updateCartDiscountInfo,
    forceRefreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart with toast notifications
export const useCart = () => {
  const cartContext = useContext(CartContext);


  if (!cartContext) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return {
    ...cartContext
  };
};
