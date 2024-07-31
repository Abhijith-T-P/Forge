import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check the credentials and navigate accordingly
    if (name === 'admin' && password === '123') {
      localStorage.setItem('user', JSON.stringify({ name, role: 'admin' }));
      navigate('/Admin');
    } else if (name === 'sales' && password === '123') {
      localStorage.setItem('user', JSON.stringify({ name, role: 'sales' }));
      navigate('/Sales');
    } else {
      console.log('Invalid credentials');
      // Optionally, add logic for handling invalid credentials, e.g., show an error message
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Welcome to SupplyCraft!</h1>
        <p>Sign in to your account</p>
        
        <div className="input-group">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <span className="icon">👤</span>
        </div>
        
        <div className="input-group">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="icon" onClick={togglePasswordVisibility}>
            {showPassword ? '🙈' : '👀'}
          </span>
        </div>
        
        <div className="checkbox-group">
          <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
        </div>
        
        <button type="submit" className="login-button">
          Login <span className="arrow">→</span>
        </button>
        
        <div className="register-link">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Login;
