import React from 'react';
import { NavLink } from 'react-router-dom';
import './AddNav.css'; // Add your styles here

const AddNav = () => {
  return (
    <nav className="add-nav">
      <NavLink to="./AddItem" className="nav-button" activeClassName="active">
        Cutting
      </NavLink>
      <NavLink to="./TapePage" className="nav-button" activeClassName="active">
        Taping
      </NavLink>
      <NavLink to="./FinishedPage" className="nav-button" activeClassName="active">
        Finished
      </NavLink>
    </nav>
  );
};

export default AddNav;
