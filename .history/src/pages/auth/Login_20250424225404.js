import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook } from 'react-icons/fa';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/common/Button/Button';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const LoginContainer = styled.div`
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  background: white;
  transition: all 0.3s ease;
`;

const LoginTitle = styled.h1`
  text-align: center;
  color: #0A4D7C;
  font-size: 22px;
  margin-bottom: 12px;
`;

const FormGroup = styled.div`
  margin-bottom: 12px;
  min-height: 65px;
  position: relative;
  padding-bottom: 8px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  color: #333;
  font-weight: 500;
  font-size: 13px;
`;

const Input = styled(Field)`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  &:focus {
    outline: none;
    border-color: #0A4D7C;
  }
`;

const PasswordContainer = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 13px;
  &:hover {
    color: #333;
  }
`;

const ErrorText = styled.div`
  color: #d32f2f;
  font-size: 11px;
  margin-top: 2px;
  min-height: 14px;
  display: block;
  position: absolute;
`;

const ForgotPassword = styled(Link)`
  display: block;
  text-align: right;
  margin-top: 5px;
  color: #0A4D7C;
  text-decoration: none;
  font-size: 12px;
  &:hover {
    text-decoration: underline;
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0;
  &:before, &:after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
  }
  span {
    margin: 0 10px;
    color: #666;
    font-size: 12px;
  }
`;

const SocialButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const SocialButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  
  svg {
    margin-right: 8px;
    font-size: 16px;
  }
  
  &:hover {
    background: #f9f9f9;
  }
`;

const GoogleButton = styled(SocialButton)`
  svg {
    color: #DB4437;
  }
`;

const FacebookButton = styled(SocialButton)`
  svg {
    color: #4267B2;
  }
`;

const SignupPrompt = styled.div`
  text-align: center;
  margin-top: 12px;
  color: #666;
  font-size: 13px;
  
  a {
    color: #0A4D7C;
    text-decoration: none;
    font-weight: 500;
    margin-left: 5px;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loginWithGoogle, loginWithFacebook } = useContext(AuthContext);
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';
  const [blockedAccountError, setBlockedAccountError] = useState(false);

  const initialValues = {
    username_or_email: '',
    password: ''
  };

  const validationSchema = Yup.object({
    username_or_email: Yup.string()
      .required('Tên đăng nhập hoặc email là trường bắt buộc'),
    password: Yup.string()
      .required('Mật khẩu là trường bắt buộc')
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await login(values.username_or_email, values.password);
      success({
        title: 'Đăng nhập thành công',
        message: 'Chào mừng bạn quay trở lại!',
        duration: 4000
      });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setFieldError('password', 'Tên đăng nhập hoặc mật khẩu không chính xác');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      success({
        title: 'Đăng nhập thành công',
        message: 'Chào mừng bạn quay trở lại!',
        duration: 4000
      });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook();
      success({
        title: 'Đăng nhập thành công',
        message: 'Chào mừng bạn quay trở lại!',
        duration: 4000
      });
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error('Facebook login failed:', error);
    }
  };

  return (
    <AuthLayout>
      <LoginContainer>
        <LoginTitle>Đăng Nhập</LoginTitle>

        {blockedAccountError && (
          <div style={{
            padding: '8px 12px',
            background: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <FormGroup>
                <Label htmlFor="username_or_email">Tên đăng nhập hoặc Email</Label>
                <Input
                  type="text"
                  id="username_or_email"
                  name="username_or_email"
                  placeholder="Nhập tên đăng nhập hoặc email"
                />
                <ErrorMessage name="username_or_email" component={ErrorText} />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">Mật khẩu</Label>
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
                <ForgotPassword to="/forgot-password">Quên mật khẩu?</ForgotPassword>
              </FormGroup>

              <Button
                type="submit"
                variant="secondary"
                fullWidth
                size="large"
                disabled={isSubmitting}
              >
                Tiếp tục
              </Button>
            </Form>
          )}
        </Formik>

        <OrDivider>
          <span>Hoặc đăng nhập / đăng ký với</span>
        </OrDivider>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
          <GoogleButton onClick={handleGoogleLogin}>
            <FaGoogle /> Tiếp tục với Google
          </GoogleButton>
          <FacebookButton onClick={handleFacebookLogin}>
            <FaFacebook /> Tiếp tục với Facebook
          </FacebookButton>
        </div>

        <SignupPrompt>
          Chưa có tài khoản?
          <Link to="/register">Đăng ký</Link>
        </SignupPrompt>
      </LoginContainer>
    </AuthLayout>
  );
};

export default Login;