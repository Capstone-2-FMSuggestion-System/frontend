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
import zaloPayService from '../../services/zaloPayService';
import { toast } from 'react-hot-toast';

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

      // Calculate shipping fee
      const shippingFee = cart.totalAmount > 200000 ? 0 : 20000;

      // Calculate total amount
      const subtotal = cart.totalAmount;
      const discount = cart.discount || 0;
      const total = subtotal + shippingFee - discount;

      console.log('Cart details:', {
        subtotal,
        shippingFee,
        discount,
        total
      });

      // Prepare order data
      const orderData = {
        user_id: currentUser.user_id,
        customer: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone
        },
        shippingAddress: {
          address: values.address,
          city: values.city,
          zipCode: values.zipCode
        },
        orderItems: cart.items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.discountPrice || item.price
        })),
        paymentMethod: values.paymentMethod,
        notes: values.notes,
        subtotal: subtotal,
        shipping: shippingFee,
        discount: discount,
        total: total
      };

      console.log('Submitting order data:', orderData);

      let order;
      if (values.paymentMethod === 'cod') {
        console.log('Creating COD order...');
        order = await orderService.createOrder(orderData);
        console.log('COD order created:', order);
      } else if (values.paymentMethod.startsWith('zalopay')) {
        console.log('Creating ZaloPay order...');
        order = await zaloPayService.createOrder(orderData);
        console.log('ZaloPay order created:', order);
        // Redirect to ZaloPay payment page
        if (order.order_url) {
          window.location.href = order.order_url;
          return;
        }
      }

      console.log('Order created successfully, clearing cart...');
      // Clear cart
      clearCart();

      console.log('Redirecting to success page with order:', order);
      // Redirect to success page with complete order data
      navigate('/payment-success', {
        state: {
          order: {
            ...order,
            total: total,
            paymentMethod: values.paymentMethod,
            id: order.id || order.order_id
          }
        }
      });
    } catch (error) {
      console.error('Failed to process order:', error);
      // Show error message to user
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <CheckoutContainer>
        <CheckoutTitle>Checkout</CheckoutTitle>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting, setFieldValue }) => (
            <Form>
              <CheckoutContent>
                <CheckoutForm>
                  <SectionTitle>Shipping Information</SectionTitle>

                  <FormRow cols={2}>
                    <FormGroup>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input type="text" id="firstName" name="firstName" />
                      <ErrorMessage name="firstName" component={ErrorText} />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="lastName">Last Name</Label>
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
                      <Label htmlFor="phone">Phone</Label>
                      <Input type="tel" id="phone" name="phone" />
                      <ErrorMessage name="phone" component={ErrorText} />
                    </FormGroup>
                  </FormRow>

                  <FormGroup>
                    <Label htmlFor="address">Address</Label>
                    <Input type="text" id="address" name="address" />
                    <ErrorMessage name="address" component={ErrorText} />
                  </FormGroup>

                  <FormRow cols={2}>
                    <FormGroup>
                      <Label htmlFor="city">City</Label>
                      <Input type="text" id="city" name="city" />
                      <ErrorMessage name="city" component={ErrorText} />
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input type="text" id="zipCode" name="zipCode" />
                      <ErrorMessage name="zipCode" component={ErrorText} />
                    </FormGroup>
                  </FormRow>

                  <SectionTitle>Payment Method</SectionTitle>

                  <FormGroup>
                    <RadioGroup>
                      <RadioOption>
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
                        Thanh toán khi nhận hàng (COD)
                      </RadioOption>

                      <RadioOption>
                        <Field
                          type="radio"
                          name="paymentMethod"
                          value="zalopay"
                          checked={values.paymentMethod === 'zalopay'}
                          onChange={() => {
                            setFieldValue('paymentMethod', 'zalopay');
                            setSelectedPayment('zalopay');
                          }}
                        />
                        Thanh toán qua ZaloPay
                      </RadioOption>
                    </RadioGroup>

                    <PaymentDetails visible={selectedPayment === 'zalopay'}>
                      <p>Bạn sẽ được chuyển hướng đến cổng thanh toán ZaloPay để hoàn tất giao dịch.</p>
                      <p>Vui lòng không đóng cửa sổ trình duyệt cho đến khi thanh toán hoàn tất.</p>
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

                  <OrderButton
                    type="submit"
                    variant="secondary"
                    size="large"
                    fullWidth
                    disabled={isSubmitting}
                  >
                    Place Order
                  </OrderButton>
                </CheckoutForm>

                <CartSummary />
              </CheckoutContent>
            </Form>
          )}
        </Formik>
      </CheckoutContainer>
    </MainLayout>
  );
};

export default Checkout;