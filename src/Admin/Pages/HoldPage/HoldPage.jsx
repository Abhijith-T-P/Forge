import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './HoldPage.css';

const HoldPage = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [holdQuantities, setHoldQuantities] = useState({});

  const itemCodes = useMemo(() => ['404', '405', '406'], []);

  const dummyData = useMemo(() => ({
    '404': {
      stockByColor: { BLUE: 5, WHITE: 8, GREEN: 2 },
      cuttingQuantities: [2, 4, 1],
      tapingQuantities: [1, 2, 0],
      finished: [1, 2, 1],
      hold: [1, 2, 1]
    },
    '405': {
      stockByColor: { RED: 3, ORANGE: 7, PURPLE: 0 },
      cuttingQuantities: [1, 3, 0],
      tapingQuantities: [1, 2, 0],
      finished: [0, 2, 0],
      hold: [1, 0, 0]
    },
    '406': {
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

  const fetchAvailableItems = useCallback(() => {
    const item = dummyData[itemCode];
    if (item) {
      setSelectedItem(item);
      setHoldQuantities(
        Object.keys(item.stockByColor).reduce((acc, color) => {
          acc[color] = '';
          return acc;
        }, {})
      );
    } else {
      setSelectedItem(null);
    }
  }, [itemCode, dummyData]);

  useEffect(() => {
    if (itemCode) {
      fetchAvailableItems();
    }
  }, [itemCode, fetchAvailableItems]);

  const handleHoldQuantityChange = (color) => (e) => {
    setHoldQuantities({
      ...holdQuantities,
      [color]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const updatedHold = [...selectedItem.hold];
    Object.keys(holdQuantities).forEach((color) => {
      const index = Object.keys(selectedItem.stockByColor).indexOf(color);
      if (index >= 0) {
        const quantity = parseInt(holdQuantities[color], 10) || 0;
        updatedHold[index] += quantity;
      }
    });

    console.log('Move to Hold:', {
      date: currentDate,
      itemCode: itemCode,
      holdQuantities: holdQuantities,
    });

    dummyData[itemCode].hold = updatedHold;

    console.log('Updated Hold:', updatedHold);

    setItemCode('');
    setSelectedItem(null);
    setHoldQuantities({});
    alert("Stock moved to hold successfully!");
  };

  const getCellClass = (value) => {
    if (value > 5) return 'high';
    if (value <= 5 && value > 0) return 'medium';
    return 'low';
  };

  const renderTable = (item, itemCode) => (
    <table className="excel-table">
      <thead>
        <tr>
          <th className="item-header">ITEM</th>
          <th className="code-header" colSpan={2}>
            {itemCode}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="label">COLOUR</td>
          <td className="label">HOLD</td>
        </tr>
        {Object.keys(item.stockByColor).map((color, index) => (
          <tr key={index}>
            <td className="color-cell">{color}</td>
            <td className={`quantity ${getCellClass(item.hold[index])}`}>
              {item.hold[index]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderHoldSummary = () => {
    if (!selectedItem) return null;

    const totalHold = selectedItem.hold.reduce((sum, qty) => sum + qty, 0);
    return (
      <div className="hold-summary">
        <h3>Total Hold: {totalHold}</h3>
      </div>
    );
  };

  return (
    <div className="hold-page-container">
      <h2 className="hold-header">Hold Stock</h2>
      <form onSubmit={handleSubmit} className="hold-form">
        <div className="hold-row">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            required
          />
        </div>
        <div className="hold-row">
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
            {Object.keys(selectedItem.stockByColor).map(color => (
              <div className="hold-row" key={color}>
                <label htmlFor={`quantity-${color}`}>{color}</label>
                <input
                  type="number"
                  id={`quantity-${color}`}
                  value={holdQuantities[color] || ''}
                  onChange={handleHoldQuantityChange(color)}
                  placeholder={`Enter quantity for ${color}`}
                  min="0"
                />
              </div>
            ))}
            <div className="hold-row">
              <button type="submit" className="submit-button">Hold</button>
            </div>
          </>
        )}
      </form>
      {selectedItem && (
        <>
          {renderTable(selectedItem, itemCode)}
          {renderHoldSummary()}
        </>
      )}
    </div>
  );
};

export default HoldPage;
