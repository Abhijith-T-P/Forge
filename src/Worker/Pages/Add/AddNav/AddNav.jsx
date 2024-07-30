import React from 'react';
import { NavLink } from 'react-router-dom';
import './AddNav.css'; // Add your styles here

const AddNav = () => {
  return (
    <nav className="add-nav">
      <NavLink to="../Add/AddItem" className="nav-button" activeClassName="active">
        Cutting
      </NavLink>
      <NavLink to="../Add/TapePage" className="nav-button" activeClassName="active">
        Taping
      </NavLink>
      <NavLink to="../Add/FinishedPage" className="nav-button" activeClassName="active">
        Finished
      </NavLink>
    </nav>
  );
};

export default AddNav;
