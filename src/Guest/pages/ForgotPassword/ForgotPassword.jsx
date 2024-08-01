import React from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  return (
    <div className="forgot-password-container">
      <h1>Forgot Password</h1>
      <p>If you forgot your password, please contact your administrator to reset it.</p>
      <Link to="/login" className="back-to-login-link">
        Back to Login
      </Link>
    </div>
  );
};

export default ForgotPassword;
