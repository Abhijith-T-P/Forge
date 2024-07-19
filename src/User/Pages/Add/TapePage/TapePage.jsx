import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './TapePage.css';

const TapePage = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [tapedQuantities, setTapedQuantities] = useState({});

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
      setTapedQuantities({});
    } else {
      setSelectedItem(null);
    }
  }, [itemCode, dummyData]);

  useEffect(() => {
    if (itemCode) {
      fetchAvailableItems();
    }
  }, [itemCode, fetchAvailableItems]);

  const handleTapedQuantityChange = (color, quantity) => {
    setTapedQuantities(prev => ({ ...prev, [color]: quantity }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    console.log('Move to Tape:', {
      date: currentDate,
      itemCode: itemCode,
      tapedQuantities: tapedQuantities,
    });

    const updatedStockByColor = { ...selectedItem.stockByColor };
    Object.entries(tapedQuantities).forEach(([color, quantity]) => {
      updatedStockByColor[color] -= parseInt(quantity, 10);
    });

    console.log('Updated Stock:', updatedStockByColor);

    setItemCode('');
    setSelectedItem(null);
    setTapedQuantities({});
    alert("Stock moved to tape successfully!");
  };

  return (
    <div className="tape-page-container">
      <h2 className="tape-header">Move Stock to Tape</h2>
      <form onSubmit={handleSubmit} className="tape-form">
        <div className="tape-row">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            required
          />
        </div>
        <div className="tape-row">
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
            <h3 className="tape-subheader">Available Colors and Quantities</h3>
            {Object.entries(selectedItem.stockByColor).map(([color, quantity]) => (
              <div key={color} className="tape-row">
                <label>{color}</label>
                <span className="available-quantity">{quantity}</span>
                <input
                  type="number"
                  value={tapedQuantities[color] || ''}
                  onChange={(e) => handleTapedQuantityChange(color, e.target.value)}
                  placeholder="Quantity to tape"
                  max={quantity}
                  min="0"
                />
              </div>
            ))}
          </>
        )}
        <div className="tape-row">
          <button type="submit" className="submit-button">Taped</button>
        </div>
      </form>
    </div>
  );
};

export default TapePage;
