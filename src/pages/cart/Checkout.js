import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button/Button';
import CartSummary from '../../components/cart/CartSummary/CartSummary';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import orderService from '../../services/orderService';
import payosService from '../../services/payosService';
import { toast } from 'react-hot-toast';
import { FaCreditCard, FaMoneyBillWave, FaInfoCircle } from 'react-icons/fa';

const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const CheckoutTitle = styled.h1`
  margin-bottom: 30px;
  font-size: 24px;
`;

const CheckoutContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CheckoutForm = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.cols || 1}, 1fr);
  gap: 15px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const Input = styled(Field)`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const TextArea = styled(Field)`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const Select = styled(Field)`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
  
  &:focus {
    outline: none;
    border-color: #4CAF50;
  }
`;

const ErrorText = styled.div`
  color: #d32f2f;
  font-size: 14px;
  margin-top: 5px;
`;

const RadioGroup = styled.div`
  margin-top: 10px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
  padding: 12px;
  border: 1px solid ${props => props.selected ? '#4CAF50' : '#ddd'};
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #4CAF50;
    background-color: #f9f9f9;
  }
  
  input {
    margin-right: 10px;
  }
`;

const PaymentIcon = styled.div`
  margin-right: 12px;
  font-size: 1.5rem;
  color: ${props => props.color || '#333'};
`;

const PaymentInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 5px 0;
    font-size: 1rem;
  }
  
  p {
    margin: 0;
    font-size: 0.85rem;
    color: #666;
  }
`;

const PaymentDetails = styled.div`
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  margin-top: 10px;
  display: ${props => props.visible ? 'block' : 'none'};
`;

const OrderButton = styled(Button)`
  margin-top: 20px;
`;

const InfoMessage = styled.div`
  background-color: #f8f9fa;
  border-left: 4px solid #4CAF50;
  padding: 10px 15px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  
  svg {
    margin-right: 10px;
    margin-top: 2px;
    color: #4CAF50;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const Checkout = () => {
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const { currentUser } = useContext(AuthContext);
  const { cart, clearCartSilently } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart.items.length, navigate]);

  const initialValues = {
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: '',
    zipCode: '',
    paymentMethod: 'cod',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    notes: ''
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    zipCode: Yup.string().required('ZIP code is required'),
    paymentMethod: Yup.string().required('Payment method is required'),
    cardNumber: Yup.string().when('paymentMethod', {
      is: 'card',
      then: () => Yup.string().required('Card number is required')
    }),
    cardName: Yup.string().when('paymentMethod', {
      is: 'card',
      then: () => Yup.string().required('Name on card is required')
    }),
    cardExpiry: Yup.string().when('paymentMethod', {
      is: 'card',
      then: () => Yup.string().required('Expiry date is required')
    }),
    cardCvv: Yup.string().when('paymentMethod', {
      is: 'card',
      then: () => Yup.string().required('CVV is required')
    })
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log('Starting order submission...');
      console.log('Current user:', currentUser);

      if (!currentUser?.user_id) {
        console.log('No user ID found, showing error message');
        toast.error('Vui lòng đăng nhập để tiếp tục');
        return;
      }

      // Sử dụng giá đã được giảm nếu có
      const subtotal = Number(parseFloat(cart.totalAmount).toFixed(2)) || 0;
      const discount = Number(parseFloat(cart.discount).toFixed(2)) || 0;
      const finalTotalItemsPrice = Number(parseFloat(cart.discountedTotal).toFixed(2)) || subtotal;

      // Tính phần trăm giảm giá thực tế
      const discountPercentage = subtotal > 0 ? (discount / subtotal) * 100 : 0;

      // Phí vận chuyển đã được loại bỏ, nên không cần tính toán hay cộng vào total nữa.
      const totalForOrder = finalTotalItemsPrice;

      console.log('Cart details (shipping excluded):', {
        subtotal, // Tổng tiền hàng ban đầu
        discount,
        discountPercentage,
        finalItemsPrice: finalTotalItemsPrice, // Giá cuối cùng của các mặt hàng sau giảm giá
        totalForOrder, // Tổng tiền cuối cùng cho đơn hàng (bằng finalItemsPrice vì không có ship)
        couponCode: cart.couponCode
      });

      // Prepare cart items in the format backend expects
      const cartItems = cart.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: Number(item.discountPrice || item.price) || 0
      }));

      // Prepare order data theo phương thức thanh toán
      const orderData = {
        user_id: currentUser.user_id,
        total_amount: totalForOrder,
        payment_method: values.paymentMethod === 'cod' ? 'COD' : 'PayOS',
        items: cartItems,
        status: values.paymentMethod === 'payos' ? 'processing' : 'pending', // PayOS -> processing, COD -> pending
        recipient_name: `${values.firstName} ${values.lastName}`,
        recipient_phone: values.phone,
        shipping_address: values.address,
        shipping_city: values.city,
        shipping_province: values.province || '',
        shipping_postal_code: values.zipCode,
        discount_amount: discount,
        coupon_code: cart.couponCode,
        subtotal: subtotal,
        notes: values.notes || ''
      };

      console.log('Submitting order data:', orderData);

      let order;
      if (values.paymentMethod === 'cod') {
        console.log('Creating COD order...');
        // Gọi API tạo đơn hàng COD
        order = await orderService.createOrder(orderData);
        console.log('COD order created:', order);

        // Xóa giỏ hàng
        clearCartSilently();

        // Chuyển đến trang thành công
        navigate('/payment-success', {
          state: {
            order: {
              ...order,
              id: order.order_id || order.id,
              payment_method: 'COD',
              discount_amount: discount,
              coupon_code: cart.couponCode,
              subtotal: subtotal
            }
          }
        });
      } else if (values.paymentMethod === 'payos') {
        console.log('Creating PayOS order...');
        // Gọi API thanh toán PayOS
        // orderData ở đây đã có total_amount là totalForOrder (không ship)
        const payosResponse = await payosService.createOrder(orderData);
        console.log('PayOS order created:', payosResponse);

        if (payosResponse && payosResponse.payment_url) {
          // Nếu có URL thanh toán, chuyển hướng người dùng đến trang thanh toán
          window.location.href = payosResponse.payment_url;
        } else {
          throw new Error('Không nhận được URL thanh toán từ PayOS');
        }
      } else {
        throw new Error('Phương thức thanh toán không hợp lệ');
      }
    } catch (error) {
      console.error('Failed to process order:', error);
      // Hiển thị thông báo lỗi
      toast.error(error.message || 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <CheckoutContainer>
        <CheckoutTitle>Hoàn tất thanh toán</CheckoutTitle>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting, setFieldValue }) => {
            // Tính toán giá trị đơn hàng
            const subtotal = Number(parseFloat(cart.totalAmount).toFixed(2)) || 0;
            const discount = Number(parseFloat(cart.discount).toFixed(2)) || 0;
            const finalTotalPrice = Number(parseFloat(cart.discountedTotal).toFixed(2)) || subtotal;

            // Tính phần trăm giảm giá thực tế
            const discountPercentage = subtotal > 0 ? (discount / subtotal) * 100 : 0;

            // Chỉ coi là giảm 100% khi thực sự giảm gần như toàn bộ giá trị (>=99.9%) VÀ có mã giảm giá được áp dụng
            const hasCouponApplied = cart.couponCode && cart.couponCode.length > 0;
            const isFullyDiscounted = (discountPercentage >= 99.9 || finalTotalPrice === 0) && hasCouponApplied;

            console.log('Checkout info:', {
              subtotal,
              discount,
              finalTotalPrice,
              discountPercentage,
              isFullyDiscounted,
              hasCouponApplied
            });

            // Nếu tổng tiền là 0 và phương thức thanh toán hiện tại là PayOS, tự động chuyển về COD
            if (isFullyDiscounted && values.paymentMethod === 'payos') {
              // Sử dụng setTimeout để tránh warning "Cannot update a component while rendering a different component"
              setTimeout(() => {
                setFieldValue('paymentMethod', 'cod');
                setSelectedPayment('cod');
              }, 0);
            }

            return (
              <Form>
                <CheckoutContent>
                  <CheckoutForm>
                    <SectionTitle>Thông tin vận chuyển</SectionTitle>

                    <FormRow cols={2}>
                      <FormGroup>
                        <Label htmlFor="firstName">Tên đầu tiên</Label>
                        <Input type="text" id="firstName" name="firstName" />
                        <ErrorMessage name="firstName" component={ErrorText} />
                      </FormGroup>

                      <FormGroup>
                        <Label htmlFor="lastName">Họ</Label>
                        <Input type="text" id="lastName" name="lastName" />
                        <ErrorMessage name="lastName" component={ErrorText} />
                      </FormGroup>
                    </FormRow>

                    <FormRow cols={2}>
                      <FormGroup>
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" id="email" name="email" />
                        <ErrorMessage name="email" component={ErrorText} />
                      </FormGroup>

                      <FormGroup>
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input type="tel" id="phone" name="phone" />
                        <ErrorMessage name="phone" component={ErrorText} />
                      </FormGroup>
                    </FormRow>

                    <FormGroup>
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input type="text" id="address" name="address" />
                      <ErrorMessage name="address" component={ErrorText} />
                    </FormGroup>

                    <FormRow cols={2}>
                      <FormGroup>
                        <Label htmlFor="city">Thành phố</Label>
                        <Input type="text" id="city" name="city" />
                        <ErrorMessage name="city" component={ErrorText} />
                      </FormGroup>

                      <FormGroup>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input type="text" id="zipCode" name="zipCode" />
                        <ErrorMessage name="zipCode" component={ErrorText} />
                      </FormGroup>
                    </FormRow>

                    <SectionTitle>Phương thức thanh toán</SectionTitle>

                    <InfoMessage>
                      <FaInfoCircle />
                      <p>{isFullyDiscounted
                        ? 'Đơn hàng đã được giảm 100% giá trị. Phương thức thanh toán khi nhận hàng được tự động chọn.'
                        : 'Vui lòng chọn một trong hai phương thức thanh toán dưới đây để hoàn tất đơn hàng.'}</p>
                    </InfoMessage>

                    <FormGroup>
                      <RadioGroup>
                        <RadioOption selected={values.paymentMethod === 'cod'}>
                          <Field
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={values.paymentMethod === 'cod'}
                            onChange={() => {
                              setFieldValue('paymentMethod', 'cod');
                              setSelectedPayment('cod');
                            }}
                          />
                          <PaymentIcon color="#ffc107">
                            <FaMoneyBillWave />
                          </PaymentIcon>
                          <PaymentInfo>
                            <h4>Thanh toán khi nhận hàng (COD)</h4>
                            <p>Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng</p>
                          </PaymentInfo>
                        </RadioOption>

                        <RadioOption
                          selected={values.paymentMethod === 'payos'}
                          style={{
                            opacity: isFullyDiscounted ? 0.5 : 1,
                            cursor: isFullyDiscounted ? 'not-allowed' : 'pointer',
                            position: 'relative'
                          }}
                        >
                          <Field
                            type="radio"
                            name="paymentMethod"
                            value="payos"
                            checked={values.paymentMethod === 'payos'}
                            onChange={() => {
                              if (!isFullyDiscounted) {
                                setFieldValue('paymentMethod', 'payos');
                                setSelectedPayment('payos');
                              }
                            }}
                            disabled={isFullyDiscounted}
                          />
                          <PaymentIcon color="#2196f3">
                            <FaCreditCard />
                          </PaymentIcon>
                          <PaymentInfo>
                            <h4>Thanh toán online qua PayOS</h4>
                            <p>Thanh toán an toàn bằng thẻ ATM, VISA, MasterCard và các ví điện tử</p>
                          </PaymentInfo>
                        </RadioOption>
                      </RadioGroup>

                      <PaymentDetails visible={selectedPayment === 'cod'}>
                        <p>Bạn sẽ thanh toán khi nhận hàng. Vui lòng chuẩn bị đúng số tiền.</p>
                      </PaymentDetails>

                      <PaymentDetails visible={selectedPayment === 'payos'}>
                        <p>Bạn sẽ được chuyển đến cổng thanh toán PayOS để hoàn tất giao dịch.</p>
                        <p>Hỗ trợ thanh toán bằng thẻ ATM/VISA/Mastercard và ví điện tử.</p>
                      </PaymentDetails>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <TextArea
                        as="textarea"
                        id="notes"
                        name="notes"
                        placeholder="Special instructions for delivery"
                      />
                    </FormGroup>
                  </CheckoutForm>

                  <CartSummary />
                </CheckoutContent>
              </Form>
            );
          }}
        </Formik>
      </CheckoutContainer>
    </MainLayout>
  );
};

export default Checkout;