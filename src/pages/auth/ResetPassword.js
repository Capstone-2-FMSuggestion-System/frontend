import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/common/Button/Button';
import authService from '../../services/authService';

const ResetContainer = styled.div`
  max-width: 500px;
  width: 100%;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #ffffff, #f9f9f9);
  transition: all 0.3s ease;
`;

const ResetTitle = styled.h1`
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

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 18px;
  transition: color 0.3s ease;
  &:hover {
    color: #0A4D7C;
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

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const initialValues = {
    password: '',
    confirmPassword: ''
  };

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
        'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số'
      )
      .required('Mật khẩu là trường bắt buộc'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
      .required('Xác nhận mật khẩu là trường bắt buộc')
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await authService.confirmResetPassword(token, values.password);
      setResetSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setFieldError('password', 'Không thể đặt lại mật khẩu. Token có thể đã hết hạn.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <ResetContainer>
        <ResetTitle>Đặt lại mật khẩu</ResetTitle>
        <Subtitle>Nhập mật khẩu mới của bạn bên dưới</Subtitle>

        {resetSuccess ? (
          <SuccessMessage>
            Mật khẩu của bạn đã được đặt lại thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập...
          </SuccessMessage>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <FormGroup>
                  <Label htmlFor="password">Mật khẩu mới</Label>
                  <PasswordContainer>
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="••••••••"
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </PasswordToggle>
                  </PasswordContainer>
                  <ErrorMessage name="password" component={ErrorText} />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                  <PasswordContainer>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="••••••••"
                    />
                    <PasswordToggle
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </PasswordToggle>
                  </PasswordContainer>
                  <ErrorMessage name="confirmPassword" component={ErrorText} />
                </FormGroup>

                <Button
                  type="submit"
                  variant="secondary"
                  fullWidth
                  size="large"
                  disabled={isSubmitting}
                >
                  Đặt lại mật khẩu
                </Button>
              </Form>
            )}
          </Formik>
        )}

        <BackToLogin to="/login">
          <FaArrowLeft /> Quay lại đăng nhập
        </BackToLogin>
      </ResetContainer>
    </AuthLayout>
  );
};

export default ResetPassword;