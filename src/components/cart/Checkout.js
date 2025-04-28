// src/pages/cart/Checkout.js
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import MainLayout from "../../layouts/MainLayout";
import Button from "../../components/common/Button/Button";
import CartSummary from "../../components/cart/CartSummary/CartSummary";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import orderService from "../../services/orderService";

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
  grid-template-columns: repeat(${(props) => props.cols || 1}, 1fr);
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
    border-color: #4caf50;
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
    border-color: #4caf50;
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
    border-color: #4caf50;
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
  display: ${(props) => (props.visible ? "block" : "none")};
`;

const OrderButton = styled(Button)`
  margin-top: 20px;
`;

const Checkout = () => {
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const { currentUser } = useContext(AuthContext);
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cart.items.length === 0) {
      navigate("/cart");
    }
  }, [cart.items.length, navigate]);

  const initialValues = {
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    city: "",
    zipCode: "",
    paymentMethod: "cod",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    notes: "",
  };

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    zipCode: Yup.string().required("ZIP code is required"),
    paymentMethod: Yup.string().required("Payment method is required"),
    cardNumber: Yup.string().when("paymentMethod", {
      is: "card",
      then: () => Yup.string().required("Card number is required"),
    }),
    cardName: Yup.string().when("paymentMethod", {
      is: "card",
      then: () => Yup.string().required("Name on card is required"),
    }),
    cardExpiry: Yup.string().when("paymentMethod", {
      is: "card",
      then: () => Yup.string().required("Expiry date is required"),
    }),
    cardCvv: Yup.string().when("paymentMethod", {
      is: "card",
      then: () => Yup.string().required("CVV is required"),
    }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Prepare order data
      const orderData = {
        customer: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
        },
        shippingAddress: {
          address: values.address,
          city: values.city,
          zipCode: values.zipCode,
        },
        orderItems: cart.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.discountPrice || item.price,
        })),
        paymentMethod: values.paymentMethod,
        notes: values.notes,
        subtotal: cart.totalAmount,
        shipping: cart.totalAmount > 200000 ? 0 : 20000,
        discount: 0,
        total: cart.totalAmount + (cart.totalAmount > 200000 ? 0 : 20000),
      };

      // Create order
      const order = await orderService.createOrder(orderData);

      // Clear cart
      clearCart();

      // Redirect to success page
      navigate("/payment-success", { state: { order } });
    } catch (error) {
      console.error("Failed to create order:", error);
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
                          checked={values.paymentMethod === "cod"}
                          onChange={() => {
                            setFieldValue("paymentMethod", "cod");
                            setSelectedPayment("cod");
                          }}
                        />
                        Cash on Delivery (COD)
                      </RadioOption>

                      <RadioOption>
                        <Field
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={values.paymentMethod === "card"}
                          onChange={() => {
                            setFieldValue("paymentMethod", "card");
                            setSelectedPayment("card");
                          }}
                        />
                        Credit/Debit Card
                      </RadioOption>

                      <RadioOption>
                        <Field
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={values.paymentMethod === "bank"}
                          onChange={() => {
                            setFieldValue("paymentMethod", "bank");
                            setSelectedPayment("bank");
                          }}
                        />
                        Bank Transfer
                      </RadioOption>
                    </RadioGroup>

                    <PaymentDetails visible={selectedPayment === "card"}>
                      <FormGroup>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="XXXX XXXX XXXX XXXX"
                        />
                        <ErrorMessage name="cardNumber" component={ErrorText} />
                      </FormGroup>

                      <FormGroup>
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input type="text" id="cardName" name="cardName" />
                        <ErrorMessage name="cardName" component={ErrorText} />
                      </FormGroup>

                      <FormRow cols={2}>
                        <FormGroup>
                          <Label htmlFor="cardExpiry">Expiry Date</Label>
                          <Input
                            type="text"
                            id="cardExpiry"
                            name="cardExpiry"
                            placeholder="MM/YY"
                          />
                          <ErrorMessage
                            name="cardExpiry"
                            component={ErrorText}
                          />
                        </FormGroup>

                        <FormGroup>
                          <Label htmlFor="cardCvv">CVV</Label>
                          <Input
                            type="text"
                            id="cardCvv"
                            name="cardCvv"
                            placeholder="123"
                          />
                          <ErrorMessage name="cardCvv" component={ErrorText} />
                        </FormGroup>
                      </FormRow>
                    </PaymentDetails>

                    <PaymentDetails visible={selectedPayment === "bank"}>
                      <p>
                        Please transfer the amount to the following bank
                        account:
                      </p>
                      <p>
                        <strong>Account Name:</strong> SM Food Store
                      </p>
                      <p>
                        <strong>Account Number:</strong> 9353538222
                      </p>
                      <p>
                        <strong>Bank:</strong> Vietcombank
                      </p>
                      <p>
                        After making the payment, please send the transfer
                        details to support@sm.com
                      </p>
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
