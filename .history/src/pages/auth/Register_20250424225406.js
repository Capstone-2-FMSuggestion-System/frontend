import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/common/Button/Button';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RegisterContainer = styled.div`
  max-width: 500px;
  width: 100%;
  padding: 20px 30px;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  background: white;
  transition: all 0.3s ease;
`;

const RegisterTitle = styled.h1`
  text-align: center;
  color: #0A4D7C;
  font-size: 24px;
  margin-bottom: 15px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  min-height: 70px;
  position: relative;
  padding-bottom: 10px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  
  .required {
    color: #d32f2f;
    margin-left: 3px;
  }
`;

const Input = styled(Field)`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
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
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  &:hover {
    color: #333;
  }
`;

const ErrorText = styled.div`
  color: #d32f2f;
  font-size: 12px;
  margin-top: 3px;
  min-height: 16px;
  display: block;
  position: absolute;
`;

const TermsCheckbox = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  
  input {
    margin-top: 3px;
    margin-right: 8px;
  }
  
  label {
    font-size: 12px;
    color: #666;
    a {
      color: #0A4D7C;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const LoginPrompt = styled.div`
  text-align: center;
  margin-top: 15px;
  color: #666;
  font-size: 14px;
  
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

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useContext(AuthContext);
  const { success } = useToast();
  const navigate = useNavigate();

  const initialValues = {
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Họ và tên là trường bắt buộc'),
    username: Yup.string()
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
      .matches(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới')
      .required('Tên đăng nhập là trường bắt buộc'),
    email: Yup.string()
      .email('Địa chỉ email không hợp lệ')
      .required('Email là trường bắt buộc'),
    phone: Yup.string()
      .matches(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
      .required('Số điện thoại là trường bắt buộc'),
    password: Yup.string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .required('Mật khẩu là trường bắt buộc'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
      .required('Xác nhận mật khẩu là trường bắt buộc'),
    acceptTerms: Yup.boolean()
      .oneOf([true], 'Bạn phải đồng ý với điều khoản để đăng ký')
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      await register(values.name, values.email, values.phone, values.password, values.username);
      success({
        title: 'Đăng ký thành công',
        message: 'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.',
        duration: 4000
      });
      navigate('/login');
    } catch (error) {
      setFieldError('email', 'Email đã được sử dụng.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <RegisterContainer>
        <RegisterTitle>Hoàn tất đăng ký</RegisterTitle>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="name">
                    Họ và Tên <span className="required">*</span>
                  </Label>
                  <Input type="text" id="name" name="name" />
                  <ErrorMessage name="name" component={ErrorText} />
                </FormGroup>

                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="username">
                    Tên đăng nhập <span className="required">*</span>
                  </Label>
                  <Input type="text" id="username" name="username" />
                  <ErrorMessage name="username" component={ErrorText} />
                </FormGroup>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="email">Email <span className="required">*</span></Label>
                  <Input type="email" id="email" name="email" />
                  <ErrorMessage name="email" component={ErrorText} />
                </FormGroup>

                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="phone">
                    Số điện thoại <span className="required">*</span>
                  </Label>
                  <Input type="tel" id="phone" name="phone" />
                  <ErrorMessage name="phone" component={ErrorText} />
                </FormGroup>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="password">
                    Mật khẩu <span className="required">*</span>
                  </Label>
                  <PasswordContainer>
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
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

                <FormGroup style={{ flex: 1 }}>
                  <Label htmlFor="confirmPassword">
                    Nhập lại mật khẩu <span className="required">*</span>
                  </Label>
                  <PasswordContainer>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
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
              </div>

              <TermsCheckbox>
                <Field type="checkbox" id="acceptTerms" name="acceptTerms" />
                <label htmlFor="acceptTerms">
                  Bằng cách đăng ký, bạn đồng ý với <Link to="/terms">Điều khoản & Điều kiện</Link> và <Link to="/privacy">Chính sách Bảo mật</Link> của chúng tôi.
                </label>
              </TermsCheckbox>
              <ErrorMessage name="acceptTerms" component={ErrorText} />

              <Button
                type="submit"
                variant="secondary"
                fullWidth
                size="large"
                disabled={isSubmitting}
              >
                Hoàn tất
              </Button>
            </Form>
          )}
        </Formik>

        <LoginPrompt>
          Đã có tài khoản?
          <Link to="/login">Đăng nhập</Link>
        </LoginPrompt>
      </RegisterContainer>
    </AuthLayout>
  );
};

export default Register;