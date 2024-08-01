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
        <svg height="30px" width="30px" viewBox="0 0 24 24">
          <g id="info"/>
          <g id="icons">
            <path d="M12,0C5.4,0,0,5.4,0,12c0,6.6,5.4,12,12,12s12-5.4,12-12C24,5.4,18.6,0,12,0z M12,4c2.2,0,4,2.2,4,5s-1.8,5-4,5   
            s-4-2.2-4-5S9.8,4,12,4z M18.6,19.5C16.9,21,14.5,22,12,22s-4.9-1-6.6-2.5c-0.4-0.4-0.5-1-0.1-1.4c1.1-1.3,2.6-2.2,4.2-2.7   
            c0.8,0.4,1.6,0.6,2.5,0.6s1.7-0.2,2.5-0.6c1.7,0.5,3.1,1.4,4.2,2.7C19.1,18.5,19.1,19.1,18.6,19.5z" id="user2"/>
          </g>
        </svg>
        <span>Sales</span>
      </div>
    </header>
  );
};

export default Header;
