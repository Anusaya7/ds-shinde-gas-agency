import React from 'react';
import { OtpLoginPage } from './OtpLoginPage';

export const RegisterPage: React.FC = () => (
  <OtpLoginPage role="CUSTOMER" initialMode="REGISTER" />
);

export default RegisterPage;
