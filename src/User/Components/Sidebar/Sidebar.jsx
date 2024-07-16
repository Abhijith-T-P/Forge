import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => (
  <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
    <nav>
      <ul>
        <li>
          <Link  onClick={toggleSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="var(--text-color)">
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
            </svg>
          </Link>
        </li>
        <li><Link to='./' onClick={toggleSidebar}>Dashboard</Link></li>
        <li><Link to="./Add/AddItem" onClick={toggleSidebar}>Work</Link></li>
        <li><Link to="./StockList" onClick={toggleSidebar}>StockList</Link></li>
       
      </ul>
    </nav>
  </div>
);

export default Sidebar;
