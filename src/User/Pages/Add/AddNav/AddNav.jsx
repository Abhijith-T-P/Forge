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
              <NavLink to="/Add/AddItem">Work</NavLink>
            </li>
            <li>
              <NavLink to="/Add/Product">Product</NavLink>
            </li>
            <li>
              <NavLink to="/Add/Material">Material</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AddNav;
