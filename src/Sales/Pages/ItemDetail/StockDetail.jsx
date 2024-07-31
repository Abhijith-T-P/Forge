import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import dummyData from '../../Components/Assets/Data/dummyData';
import './StockDetail.css';

const StockDetail = () => {
  const { itemCode } = useParams();
  const [item, setItem] = useState(dummyData.find((item) => item.itemCode === itemCode));
  const [updatedItem, setUpdatedItem] = useState(null); // State to track updated item

  if (!item) {
    return <div>Item not found</div>;
  }

  // Function to update stock count for a color
  const updateStock = (color, amount) => {
    const updatedItem = { ...item };
    updatedItem.stockByColor[color] += amount;
    setUpdatedItem(updatedItem); // Store updated item in state
  };

  // Function to confirm and apply updates
  const handleSubmit = () => {
    if (updatedItem) {
      setItem(updatedItem); // Apply updated item to main state
      setUpdatedItem(null); // Reset updatedItem state after applying
    }
  };

  return (
    <div className="stock-detail">
      <img src={item.imageUrl} alt={item.itemName} />
      <h2>{item.itemName}</h2>
      <p>Item Code: {item.itemCode}</p>
      <p>Stock Available: {Object.values(item.stockByColor).reduce((a, b) => a + b, 0) > 0 ? 'Yes' : 'No'}</p>
      
      {/* Display colors and stock counts */}
      <div className="colors">
        <h3>Available Colors</h3>
        {Object.keys(item.stockByColor).map((color) => (
          <div key={color} className="color-item">
            <span>{color}: </span>
            <span>{item.stockByColor[color]}</span>
            <div className="stock-actions">
              <button onClick={() => updateStock(color, 1)}>+</button>
              <button onClick={() => updateStock(color, -1)} disabled={item.stockByColor[color] === 0}>-</button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit button to confirm update */}
      <button className="submit-button" onClick={handleSubmit}>Submit Update</button>
    </div>
  );
};

export default StockDetail;
