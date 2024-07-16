// src/Components/Dashboard/Dashboard.js

import React, { useState } from 'react';
import dummyData from '../../Components/Assets/Data/dummyData';
import './Dashboard.css';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items based on search term
  const filteredItems = dummyData.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <h2>Stock Checker</h2>
      <div className="search-section">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
      </div>

      {filteredItems.length > 0 ? (
        filteredItems.map((item) => (
          <div key={item.itemCode} className={`item-details ${calculateStockClass(item)}`}>
            <h3>{item.itemName}</h3>
            {/* <img src={item.imageUrl} alt={item.itemName} /> */}
            <p>Availability: {Object.values(item.stockByColor).reduce((a, b) => a + b, 0) > 0 ? 'In Stock' : 'Out of Stock'}</p>
            <h4>Colors Available:</h4>
            <ul>
              {Object.keys(item.stockByColor).map((color, index) => (
                <li key={index}>
                  {color} - {item.stockByColor[color]} available
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p className="no-item-found">No item found for the entered name or code.</p>
      )}
    </div>
  );
};

// Function to calculate CSS class based on total stock count
const calculateStockClass = (item) => {
  const totalStock = Object.values(item.stockByColor).reduce((a, b) => a + b, 0);
  return totalStock === 0 ? 'zero-stock' : '';
};

export default Dashboard;
