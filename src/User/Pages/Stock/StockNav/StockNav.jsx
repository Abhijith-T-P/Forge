import React from 'react';
import { NavLink } from 'react-router-dom';
import './StockNav.css';

const StockNav = () => {
  return (
    <nav className="stock-nav">
      <NavLink to="../stock/cutting" className="nav-button" activeClassName="active">
        Cutting
      </NavLink>
      <NavLink to="../stock/tapped" className="nav-button" activeClassName="active">
        Tapped
      </NavLink>
      <NavLink to="../stock/Finished" className="nav-button" activeClassName="active">
        Finished
      </NavLink>
    </nav>
  );
};

export default StockNav;
