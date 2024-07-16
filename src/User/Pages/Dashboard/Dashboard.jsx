import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import './Dashboard.css';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockItems, setStockItems] = useState({});

  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Stock'));
        const items = {};
        querySnapshot.forEach((doc) => {
          const item = doc.data();
          const lowerCaseItemCode = item.itemCode.toLowerCase();
          if (items[lowerCaseItemCode]) {
            // Merge finishedByColor if item already exists
            items[lowerCaseItemCode].finishedByColor = {
              ...items[lowerCaseItemCode].finishedByColor,
              ...item.finishedByColor
            };
          } else {
            items[lowerCaseItemCode] = { ...item, id: doc.id };
          }
        });
        setStockItems(items);
      } catch (error) {
        console.error('Error fetcxhing stock items:', error);
      }
    };

    fetchStockItems();
  }, []);

  // Filter items based on search term
  const filteredItems = Object.values(stockItems).filter(
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
          <div key={item.id} className={`item-details ${calculateStockClass(item)}`}>
            <h3>{item.itemName}</h3>
            <p>Item Code: {item.itemCode}</p>
            <p>Availability: {Object.values(item.finishedByColor || {}).reduce((a, b) => a + b, 0) > 0 ? 'In Stock' : 'Out of Stock'}</p>
            <h4>Colors Available:</h4>
            <ul>
              {Object.keys(item.finishedByColor || {}).map((color, index) => (
                <li key={index}>
                  {color} - {item.finishedByColor[color]} available
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
  const totalStock = Object.values(item.finishedByColor || {}).reduce((a, b) => a + b, 0);
  return totalStock === 0 ? 'zero-stock' : '';
};

export default Dashboard;
