// src/pages/cart/Checkout.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/common/Button/Button';
import CartSummary from '../../components/cart/CartSummary/CartSummary';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import orderService from '../../services/orderService';

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
  
  input {
    margin-right: 10px;
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

const Checkout = () => {
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const { currentUser } = useContext(AuthContext);
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [orderSummary, setOrderSummary] = useState({
    subtotal: cart.totalAmount,
    discount: 0,
    total: cart.totalAmount,
    coupon_applied: false,
    coupon_code: null
  });
  
  useEffect(() => {
    // Lấy orderSummary từ location state nếu có
    if (location.state && location.state.orderSummary) {
      setOrderSummary(location.state.orderSummary);
    }
  }, [location.state]);
  
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
      const fullName = `${values.firstName} ${values.lastName}`.trim();
      
      // Prepare order data
      const orderData = {
        user_id: currentUser.user_id,
        total_amount: orderSummary.total,
        payment_method: values.paymentMethod,
        recipient_name: fullName,
        recipient_phone: values.phone,
        shipping_address: values.address,
        shipping_city: values.city,
        shipping_province: '',
        shipping_postal_code: values.zipCode,
        items: cart.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      console.log('Order data being sent:', orderData);
      console.log('Order summary with coupon:', orderSummary);
      
      // Gọi API tạo đơn hàng
      let order;
      
      if (selectedPayment === 'payos') {
        // Gọi API thanh toán qua PayOS
        order = await orderService.createPayosOrder(orderData);
      } else {
        // Gọi API thanh toán COD
        order = await orderService.createOrder(orderData);
      }
      
      // Nếu đã áp dụng mã giảm giá, lưu vào đơn hàng
      if (orderSummary.coupon_applied && orderSummary.coupon_code) {
        try {
          console.log(`Applying coupon ${orderSummary.coupon_code} to order ${order.order_id}`);
          const couponResult = await orderService.applyCouponToOrder(order.order_id, orderSummary.coupon_code);
          console.log('Coupon application result:', couponResult);
        } catch (couponError) {
          console.error('Error applying coupon to order:', couponError);
        }
      }
      
      // Clear cart
      clearCart();
      
      // Redirect to success page hoặc trang thanh toán
      if (selectedPayment === 'payos' && order && order.payment_url) {
        window.location.href = order.payment_url;
      } else {
        navigate('/payment-success', { state: { order } });
      }
    } catch (error) {
      console.error('Failed to process order:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCartSummaryUpdate = (updatedSummary) => {
    setOrderSummary(updatedSummary);
  };
  
  return (
    <MainLayout>
      <CheckoutContainer>
        <CheckoutTitle>Checkout</CheckoutTitle>
        
        <CheckoutContent>
          <CheckoutForm>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                <Form>
                  <SectionTitle>Thông tin giao hàng</SectionTitle>
                  
                  <FormRow cols={2}>
                    <FormGroup>
                      <Label htmlFor="firstName">Tên</Label>
                      <Input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="Nhập tên"
                      />
                      <ErrorMessage name="firstName" component={ErrorText} />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="lastName">Họ</Label>
                      <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="Nhập họ"
                      />
                      <ErrorMessage name="lastName" component={ErrorText} />
                    </FormGroup>
                  </FormRow>
                  
                  <FormRow cols={2}>
                    <FormGroup>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Nhập địa chỉ email"
                      />
                      <ErrorMessage name="email" component={ErrorText} />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        type="text"
                        id="phone"
                        name="phone"
                        placeholder="Nhập số điện thoại"
                      />
                      <ErrorMessage name="phone" component={ErrorText} />
                    </FormGroup>
                  </FormRow>
                  
                  <FormGroup>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input
                      type="text"
                      id="address"
                      name="address"
                      placeholder="Nhập địa chỉ"
                    />
                    <ErrorMessage name="address" component={ErrorText} />
                  </FormGroup>
                  
                  <FormRow cols={2}>
                    <FormGroup>
                      <Label htmlFor="city">Thành phố</Label>
                      <Input
                        type="text"
                        id="city"
                        name="city"
                        placeholder="Nhập thành phố"
                      />
                      <ErrorMessage name="city" component={ErrorText} />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="zipCode">Mã bưu điện</Label>
                      <Input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        placeholder="Nhập mã bưu điện"
                      />
                      <ErrorMessage name="zipCode" component={ErrorText} />
                    </FormGroup>
                  </FormRow>
                  
                  <FormGroup>
                    <Label htmlFor="notes">Ghi chú</Label>
                    <TextArea
                      as="textarea"
                      id="notes"
                      name="notes"
                      placeholder="Ghi chú thêm về đơn hàng"
                    />
                  </FormGroup>
                  
                  <SectionTitle>Phương thức thanh toán</SectionTitle>
                  
                  <RadioGroup>
                    <RadioOption>
                      <Field
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="COD"
                        onChange={e => {
                          handleChange(e);
                          setSelectedPayment('cod');
                        }}
                        checked={selectedPayment === 'cod'}
                      />
                      Thanh toán khi nhận hàng (COD)
                    </RadioOption>
                    
                    <RadioOption>
                      <Field
                        type="radio"
                        id="payos"
                        name="paymentMethod"
                        value="payos"
                        onChange={e => {
                          handleChange(e);
                          setSelectedPayment('payos');
                        }}
                        checked={selectedPayment === 'payos'}
                      />
                      Thanh toán trực tuyến (PayOS)
                    </RadioOption>
                  </RadioGroup>
                  
                  <OrderButton
                    primary
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                  </OrderButton>
                </Form>
              )}
            </Formik>
          </CheckoutForm>
          
          <div>
            <CartSummary onCheckout={handleCartSummaryUpdate} />
          </div>
        </CheckoutContent>
      </CheckoutContainer>
    </MainLayout>
  );
};

export default Checkout;