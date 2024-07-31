import React, { useState, useEffect, useMemo } from 'react';
import './HoldPage.css';

const HoldPage = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemDetails, setItemDetails] = useState(null);
  const [holdQuantities, setHoldQuantities] = useState({});

  const dummyData = useMemo(() => ({
    '404': {
      colors: ['BLUE', 'WHITE', 'GREEN'],
      stockByColor: { BLUE: 5, WHITE: 8, GREEN: 2 },
      cuttingQuantities: [2, 4, 1],
      tapingQuantities: [1, 2, 0],
      finished: [1, 2, 1],
      hold: [1, 2, 1]
    },
    '405': {
      colors: ['RED', 'ORANGE', 'PURPLE'],
      stockByColor: { RED: 3, ORANGE: 7, PURPLE: 0 },
      cuttingQuantities: [1, 3, 0],
      tapingQuantities: [1, 2, 0],
      finished: [0, 2, 0],
      hold: [1, 0, 0]
    },
    '406': {
      colors: ['PINK', 'BROWN', 'GRAY'],
      stockByColor: { PINK: 6, BROWN: 0, GRAY: 10 },
      cuttingQuantities: [3, 0, 5],
      tapingQuantities: [2, 0, 3],
      finished: [1, 0, 2],
      hold: [0, 0, 0]
    },
  }), []);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const details = dummyData[searchTerm];
      if (details) {
        setItemDetails(details);
        setHoldQuantities(details.colors.reduce((acc, color) => {
          acc[color] = 0;
          return acc;
        }, {}));
      } else {
        setItemDetails(null);
        setHoldQuantities({});
      }
    } else {
      setItemDetails(null);
      setHoldQuantities({});
    }
  }, [searchTerm, dummyData]);

  const handleHoldQuantityChange = (color, index) => (e) => {
    const quantity = parseInt(e.target.value, 10) || 0;
    setHoldQuantities({
      ...holdQuantities,
      [color]: quantity
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemDetails) return;

    const updatedHold = itemDetails.hold.map((holdQty, index) => {
      const color = itemDetails.colors[index];
      return holdQty + (holdQuantities[color] || 0);
    });

    dummyData[searchTerm].hold = updatedHold;

    console.log('Updated Hold:', dummyData[searchTerm].hold);
    alert('Hold quantities updated successfully!');
    
    setHoldQuantities(itemDetails.colors.reduce((acc, color) => {
      acc[color] = 0;
      return acc;
    }, {}));
  };

  const getCellClass = (value) => {
    if (value === 0) return "quantity-zero";
    if (value > 0 && value < 5) return "quantity-low";
    if (value >= 5 && value < 10) return "quantity-medium";
    return "quantity-high";
  };

  const renderTable = (item, itemCode, showHold = false) => (
    <table className="excel-table">
      <thead>
        <tr>
          <th className="item-header">ITEM</th>
          <th className="code-header" colSpan={showHold ? 4 : 3}>
            {itemCode}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="label">COLOUR</td>
          <td className="label">TOTAL</td>
          <td className="label">HOLDING</td>
          {showHold && <td className="label">HOLD</td>}
        </tr>
        {item.colors.map((color, index) => {
          const total = item.cuttingQuantities[index] + item.tapingQuantities[index] + item.finished[index];
          return (
            <tr key={index}>
              <td className="color-cell">{color}</td>
              <td className={`quantity ${getCellClass(total)}`}>
                {total}
              </td>
              <td className="quantity">{item.hold[index]}</td>
              {showHold && (
                <td className="Hold">
                  <input
                    type="number"
                    value={holdQuantities[color] || ''}
                    onChange={handleHoldQuantityChange(color, index)}
                    placeholder={`Add hold for ${color}`}
                    min="0"
                  />
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="hold-page-container">
      <h2 className="hold-header">Hold Stock</h2>
      <div className="excel-toolbar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter item code"
          className="search-input"
        />
      </div>
      <div className="excel-sheet">
        {itemDetails ? (
          <>
            {renderTable(itemDetails, searchTerm, true)}
            <button className="submit-button" onClick={handleSubmit}>Submit</button>
          </>
        ) : (
          searchTerm && (
            <p className="no-item-found">Enter a valid item code to search.</p>
          )
        )}
      </div>
      <div className="excel-sheet items-list">
        <h3 className="sheet-title">All Items</h3>
        {Object.entries(dummyData).map(([itemCode, item]) => (
          <div key={itemCode} className="item-table-container">
            {renderTable(item, itemCode)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HoldPage;
