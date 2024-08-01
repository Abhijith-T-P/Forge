import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ onToggleSidebar }) => {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || user.role !== 'admin') {
      navigate('/');
    } else {
      setUserName(user.name); // Set the username from local storage
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
          <li><Link to="./Add/AddItem">Work</Link></li>
          <li><Link to="./Stock/Finished">StockList</Link></li>
          {/* <li><Link to="./AddColor">AddColor</Link></li> */}
          {/* <li><Link to="./AddCode">AddCode</Link></li> */}
        </ul>
      </nav>
      <div className="user-profile">
      <svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="var(--text-color)" preserveAspectRatio="xMinYMin meet" style={{ display: 'block' }}>
  <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
</svg>        <span>{userName}</span> {/* Display the username here */}
      </div>
    </header>
  );
};

export default Header;
