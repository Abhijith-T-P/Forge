import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import './Login.css';

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const db = getFirestore(); // Initialize Firestore

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const { role } = JSON.parse(storedUser);
      if (role === 'admin') {
        navigate('/Admin');
      } else if (role === 'sales') {
        navigate('/Sales');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous error messages

    try {
      // Fetch all documents from Admins collection
      const adminSnapshot = await getDocs(collection(db, 'Admins'));
      const admins = adminSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch all documents from SalesMen collection
      const salesSnapshot = await getDocs(collection(db, 'SalesMen'));
      const salesMen = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Check Admins collection
      const adminUser = admins.find(admin => admin.username === name);
      if (adminUser && adminUser.password === password) {
        localStorage.setItem('user', JSON.stringify({ name, role: 'admin', id: adminUser.id }));
        navigate('/Admin');
        return;
      }

      // Check SalesMen collection
      const salesUser = salesMen.find(sales => sales.username === name);
      if (salesUser && salesUser.password === password) {
        localStorage.setItem('user', JSON.stringify({ name, role: 'sales', id: salesUser.id }));
        navigate('/Sales');
        return;
      }

      // If no user is found or password doesn't match
      setError('Invalid credentials');
    } catch (error) {
      console.error('Error checking credentials:', error);
      setError('An error occurred. Please try again.');
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
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="input-group">
          <input
            type="text"
            placeholder="Username"
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
          <Link to="/ForgotPassword" className="forgot-password">Forgot password?</Link>
        </div>
        
        <button type="submit" className="login-button">
          Login <span className="arrow">→</span>
        </button>
        
        <div className="register-link">
        </div>
      </form>
    </div>
  );
};

export default Login;
