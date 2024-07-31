import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ onToggleSidebar }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')); // Assuming user data is stored as a JSON object

    if (!user || user.role !== 'sales') {
      navigate('/'); // Redirect to home page if not sales
    }
  }, [navigate]);

  return (
    <header>
      <div className="slide">
        <button className="toggle-button" onClick={onToggleSidebar}>
          <svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="var(--text-color)">
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
          </svg>
        </button>
        <div className="logo">
          Supply<span>Craft</span>
        </div>
      </div>
      <nav className="navigation">
        <ul>
          <li><Link to="./">Dashboard</Link></li>       
          <li><Link to="./Stock/Finished">StockList</Link></li>
        </ul>
      </nav>
      <div className="user-profile">
        <img src="avatar.jpg" alt="User Avatar" />
        <span>Sales</span>
      </div>
    </header>
  );
};

export default Header;
