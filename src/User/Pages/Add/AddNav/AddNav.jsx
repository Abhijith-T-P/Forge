import React from 'react';
import { NavLink } from 'react-router-dom';
import './AddNav.css';

const AddNav = () => {
  return (
    <div className='AddNav'>
      <div className="navContainer">
        <div className="navItems">
          <ul>
            <li>
              <NavLink to="/Add/AddItem">Cutting</NavLink>
            </li>
            <li>
              <NavLink to="/Add/Tapped">Tapped</NavLink>
            </li>
            <li>
              <NavLink to="/Add/Finished">Finished</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AddNav;
