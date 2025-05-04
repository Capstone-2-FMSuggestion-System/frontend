import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/common/Button/Button';
import authService from '../../services/authService';
import { toast } from 'react-hot-toast';

const ForgotContainer = styled.div`
  max-width: 500px;
  width: 100%;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #ffffff, #f9f9f9);
  transition: all 0.3s ease;
`;

const ForgotTitle = styled.h1`
  text-align: center;
  color: #0A4D7C;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
  min-height: 90px;
  position: relative;
  padding-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 600;
`;

const Input = styled(Field)`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  &:focus {
    outline: none;
    border-color: #0A4D7C;
    box-shadow: 0 0 5px rgba(10, 77, 124, 0.3);
  }
`;

const ErrorText = styled.div`
  color: #d32f2f;
  font-size: 14px;
  margin-top: 5px;
  min-height: 20px;
  display: block;
  position: absolute;
`;

const BackToLogin = styled(Link)`
  display: flex;
  align-items: center;
  margin-top: 20px;
  color: #0A4D7C;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;

  svg {
    margin-right: 8px;
  }

  &:hover {
    color: #083b5c;
    text-decoration: underline;
  }
`;

const SuccessMessage = styled.div`
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
`;

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);

  const initialValues = {
    email: ''
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Địa chỉ email không hợp lệ')
      .required('Email là trường bắt buộc')
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Call the forgot password endpoint
      await authService.forgotPassword(values.email);
      setEmailSent(true);
      setError(null);
      toast.success('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư đến của bạn.');
    } catch (error) {
      const errorMessage = error.message || 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.';
      setError(errorMessage);
      setFieldError('email', errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <ForgotContainer>
        <ForgotTitle>Quên mật khẩu</ForgotTitle>
        <Subtitle>Nhập email của bạn để đặt lại mật khẩu</Subtitle>

        {error && (
          <ErrorText style={{ position: 'static', marginBottom: '20px' }}>
            {error}
          </ErrorText>
        )}

        {emailSent && (
          <SuccessMessage>
            Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư đến của bạn.
          </SuccessMessage>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  autoComplete="off"
                  required
                  disabled={emailSent}
                />
                <ErrorMessage name="email" component={ErrorText} />
              </FormGroup>

              <Button
                type="submit"
                variant="secondary"
                fullWidth
                size="large"
                disabled={isSubmitting || emailSent}
              >
                {emailSent ? 'Đã gửi email' : 'Gửi yêu cầu đặt lại mật khẩu'}
              </Button>
            </Form>
          )}
        </Formik>

        <BackToLogin to="/login">
          <FaArrowLeft /> Quay lại đăng nhập
        </BackToLogin>
      </ForgotContainer>
    </AuthLayout>
  );
};

export default ForgotPassword;