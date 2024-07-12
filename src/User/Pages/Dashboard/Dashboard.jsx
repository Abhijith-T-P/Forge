import React, { useState } from 'react';
import './Dashboard.css'; // Import your CSS file for styling

const Dashboard = () => {
  const [itemCode, setItemCode] = useState('');
  const [itemDetails, setItemDetails] = useState(null); // State to hold item details

  const handleSearch = () => {
    // Dummy data - replace with actual logic to fetch item details from database or API
    const dummyData = [
      {
        id: '1',
        itemName: 'Sample Chair',
        imageUrl: 'https://via.placeholder.com/150',
        inStock: true,
        colorsAvailable: ['Red', 'Blue', 'Green'],
        stockByColor: {
          Red: 10,
          Blue: 5,
          Green: 3,
        },
      },
      {
        id: '2',
        itemName: 'Modern Desk',
        imageUrl: 'https://via.placeholder.com/150',
        inStock: false,
        colorsAvailable: ['Black', 'White'],
        stockByColor: {
          Black: 0,
          White: 0,
        },
      },
      {
        id: '3',
        itemName: 'Office Lamp',
        imageUrl: 'https://via.placeholder.com/150',
        inStock: true,
        colorsAvailable: ['Yellow', 'Silver'],
        stockByColor: {
          Yellow: 8,
          Silver: 12,
        },
      },
    ];

    // Simulating fetching data based on item code (in real app, fetch from backend)
    const foundItem = dummyData.find(item => item.id === itemCode);
    if (foundItem) {
      setItemDetails(foundItem);
    } else {
      setItemDetails(null); // Reset itemDetails if item code not found
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Stock Checker</h2>
      <div className="search-section">
        <input
          type="text"
          value={itemCode}
          onChange={(e) => setItemCode(e.target.value)}
          placeholder="Enter item code"
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {itemDetails && (
        <div className="item-details">
          <h3>{itemDetails.itemName}</h3>
          <img src={itemDetails.imageUrl} alt={itemDetails.itemName} />
          <p>Availability: {itemDetails.inStock ? 'In Stock' : 'Out of Stock'}</p>

          <h4>Colors Available:</h4>
          <ul>
            {itemDetails.colorsAvailable.map((color, index) => (
              <li key={index}>
                {color} - {itemDetails.stockByColor[color]} available
              </li>
            ))}
          </ul>
        </div>
      )}

      {itemDetails === null && (
        <p className="no-item-found">No item found for the entered item code.</p>
      )}
    </div>
  );
};

export default Dashboard;
