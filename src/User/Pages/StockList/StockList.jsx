import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import dummyData from '../../Components/Assets/Data/dummyData';
import './StockList.css';

const StockList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items based on search term
  const filteredItems = dummyData.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="stock-list">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by name or code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* Display filtered items in a grid */}
      <div className="item-grid">
        {filteredItems.map((item) => (
          <div key={item.itemCode} className={`stock-item ${calculateStockClass(item)}`}>
            <Link to={`/item/${item.itemCode}`}>
              {/* <img src={item.imageUrl} alt={item.itemName} /> */}
              <h3>{item.itemName}</h3>
              <p>Item Code: {item.itemCode}</p>
              <p>Total Stock: {Object.values(item.stockByColor).reduce((a, b) => a + b, 0)}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

// Function to calculate CSS class based on total stock count
const calculateStockClass = (item) => {
  const totalStock = Object.values(item.stockByColor).reduce((a, b) => a + b, 0);
  return totalStock === 0 ? 'zero-stock' : '';
};

export default StockList;
