import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './FinishedPage.css';

const FinishedPage = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [finishedQuantities, setFinishedQuantities] = useState({});

  const itemCodes = Array.from({ length: 10 }, (_, i) => `40${i + 4}`);

  const dummyData = useMemo(() => ({
    '404': {
      stockByColor: { BLUE: 5, WHITE: 8, GREEN: 2 },
    },
    '405': {
      stockByColor: { RED: 3, ORANGE: 7, PURPLE: 0 },
    },
    '406': {
      stockByColor: { PINK: 6, BROWN: 0, GRAY: 10 },
    },
  }), []);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toISOString().split('T')[0]);
  }, []);

  const fetchAvailableItems = useCallback(() => {
    const item = dummyData[itemCode];
    if (item) {
      setSelectedItem(item);
      setFinishedQuantities({});
    } else {
      setSelectedItem(null);
    }
  }, [itemCode, dummyData]);

  useEffect(() => {
    if (itemCode) {
      fetchAvailableItems();
    }
  }, [itemCode, fetchAvailableItems]);

  const handleFinishedQuantityChange = (color, quantity) => {
    setFinishedQuantities(prev => ({ ...prev, [color]: quantity }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    // Simulate adding to Finished collection
    console.log('Move to Finished:', {
      date: currentDate,
      itemCode: itemCode,
      finishedQuantities: finishedQuantities,
    });

    // Simulate updating Cutting collection
    const updatedStockByColor = { ...selectedItem.stockByColor };
    Object.entries(finishedQuantities).forEach(([color, quantity]) => {
      updatedStockByColor[color] -= parseInt(quantity, 10);
    });

    console.log('Updated Stock:', updatedStockByColor);

    // Reset form
    setItemCode('');
    setSelectedItem(null);
    setFinishedQuantities({});
    alert("Stock moved to finished successfully!");
  };

  return (
    <div className="finished-page-container">
      <h2 className="finished-header">Move Stock to Finished</h2>
      <form onSubmit={handleSubmit} className="finished-form">
        <div className="finished-row">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            required
          />
        </div>
        <div className="finished-row">
          <label htmlFor="itemCode">Item Code</label>
          <select
            id="itemCode"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            required
            className="dropdown"
          >
            <option value="" disabled>Select item code</option>
            {itemCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>
        {selectedItem && (
          <>
            <h3 className="finished-subheader">Available Colors and Quantities</h3>
            {Object.entries(selectedItem.stockByColor).map(([color, quantity]) => (
              <div key={color} className="finished-row">
                <label>{color}</label>
                <span className="available-quantity">{quantity}</span>
                <input
                  type="number"
                  value={finishedQuantities[color] || ''}
                  onChange={(e) => handleFinishedQuantityChange(color, e.target.value)}
                  placeholder="Quantity to finish"
                  max={quantity}
                  min="0"
                />
              </div>
            ))}
          </>
        )}
        <div className="finished-row">
          <button type="submit" className="submit-button">Finished</button>
        </div>
      </form>
    </div>
  );
};

export default FinishedPage;
