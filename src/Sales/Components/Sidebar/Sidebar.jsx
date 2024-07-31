import React from 'react';
import './Sidebar.css';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data from local storage
    navigate('/'); // Redirect to login or home page
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <nav>
        <ul>
          <li>
            <Link onClick={toggleSidebar}>
              <svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="var(--text-color)">
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
              </svg>
            </Link>
          </li>
          <li><Link to='./' onClick={toggleSidebar}>Dashboard</Link></li>
          <li><Link to="./Stock/Finished" onClick={toggleSidebar}>StockList</Link></li>
          <li><Link to="/" onClick={handleLogout}>LogOut</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
