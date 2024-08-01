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
        <svg height="30px" width="30 px" viewBox="0 0 48 48">
          <g>
            <path d="M23.999,22.863c-10.014,0-18.131,8.119-18.131,18.133v1.727v3.34v1.906h36.264v-1.906v-2.189v-2.877 C42.132,30.982,34.013,22.863,23.999,22.863z" fill="#241F20"/>
            <path d="M14.479,15.936l1.859-0.656c0.502,0.837,1.148,1.593,1.916,2.236l-0.898,1.877l4.033,1.928l0.896-1.877 c0.963,0.189,1.933,0.22,2.88,0.095l0.682,1.934l3.371-1.191l-0.674-1.904c0.864-0.507,1.636-1.168,2.298-1.957l1.875,0.897 l1.923-4.02L32.763,12.4c0.195-0.986,0.225-1.983,0.09-2.951l1.858-0.655l-1.19-3.371l-1.859,0.655 c-0.499-0.834-1.144-1.587-1.907-2.229l0.898-1.879l-4.051-1.938l-0.898,1.881c-1.001-0.195-2.016-0.224-2.997-0.079l-0.63-1.785 l-3.373,1.191l0.641,1.815c-0.812,0.493-1.548,1.124-2.176,1.872l-1.879-0.898l-1.935,4.046l1.88,0.898 c-0.193,0.98-0.221,1.972-0.086,2.936l-1.859,0.655L14.479,15.936z M24,7.562c1.657,0,3,1.343,3,3s-1.343,3-3,3 c-1.657,0-3-1.343-3-3S22.343,7.562,24,7.562z" fill="#241F20"/>
          </g>
        </svg>
        <span>{userName}</span> {/* Display the username here */}
      </div>
    </header>
  );
};

export default Header;
