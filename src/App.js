import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Admin from './Admin/App';
import Sales from './Sales/App';
import Guest from './Guest/App';
import './App.css';

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user data exists in local storage and redirect accordingly
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      if (userData.role === 'admin') {
        navigate('/Admin');
      } else if (userData.role === 'sales') {
        navigate('/Sales');
      }
    }
  }, [navigate]);

  return (
    <div>
      <Routes>
        <Route path="/*" element={<Guest />} />
        <Route path="/Admin/*" element={<Admin />} />
        <Route path="/Sales/*" element={<Sales />} />
      </Routes>
    </div>
  );
};

export default App;
