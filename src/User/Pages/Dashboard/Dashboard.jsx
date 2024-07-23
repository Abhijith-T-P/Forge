import React, { useState, useMemo, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [itemDetails, setItemDetails] = useState(null);

  const itemsData = useMemo(
    () => ({
      401: {
        colors: ["RED", "BLUE", "GREEN"],
        finished: [10, 15, 5],
        cuttingQuantities: [3, 8, 2],
        tapingQuantities: [1, 4, 0],
        hold: [2, 3, 1],
      },
      402: {
        colors: ["YELLOW", "PURPLE", "ORANGE"],
        finished: [8, 12, 7],
        cuttingQuantities: [2, 5, 3],
        tapingQuantities: [1, 3, 2],
        hold: [1, 1, 1],
      },
      403: {
        colors: ["BLACK", "WHITE", "GRAY"],
        finished: [20, 18, 15],
        cuttingQuantities: [5, 4, 3],
        tapingQuantities: [2, 2, 1],
        hold: [3, 2, 2],
      },
      404: {
        colors: ["PINK", "CYAN", "MAGENTA"],
        finished: [6, 9, 4],
        cuttingQuantities: [1, 3, 1],
        tapingQuantities: [1, 2, 1],
        hold: [1, 2, 1],
      },
      405: {
        colors: ["BROWN", "BEIGE", "MAROON"],
        finished: [14, 11, 8],
        cuttingQuantities: [4, 3, 2],
        tapingQuantities: [2, 1, 1],
        hold: [2, 3, 2],
      },
    }),
    []
  );

  const sortedItemsData = useMemo(() => {
    return Object.entries(itemsData)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  }, [itemsData]);

  useEffect(() => {
    if (searchTerm) {
      const details = itemsData[searchTerm];
      if (details) {
        setItemDetails(details);
      } else {
        setItemDetails(null);
      }
    } else {
      setItemDetails(null);
    }
  }, [searchTerm, itemsData]);

  const getCellClass = (value) => {
    if (value === 0) return "quantity-zero";
    if (value > 0 && value < 5) return "quantity-low";
    if (value >= 5 && value < 10) return "quantity-medium";
    return "quantity-high";
  };

  const renderTable = (item, itemCode) => (
    <table className="excel-table">
      <thead>
        <tr>
          <th className="item-header">ITEM</th>
          <th className="code-header" colSpan={4}>
            {itemCode}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="label">COLOUR</td>
          <td className="label">CUTTING</td>
          <td className="label">TAPING</td>
          <td className="label">FINISHED</td>
          <td className="label">HOLD</td>
        </tr>
        {item.colors.map((color, index) => (
          <tr key={index}>
            <td className="color-cell">{color}</td>
            <td className={`quantity ${getCellClass(item.cuttingQuantities[index])}`}>
              {item.cuttingQuantities[index]}
            </td>
            <td className={`quantity ${getCellClass(item.tapingQuantities[index])}`}>
              {item.tapingQuantities[index]}
            </td>
            <td className={`quantity ${getCellClass(item.finished[index])}`}>
              {item.finished[index]}
            </td>
            <td className="quantity">{item.hold[index]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="dashboard">
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
          renderTable(itemDetails, searchTerm)
        ) : (
          searchTerm && (
            <p className="no-item-found">Enter a valid item code to search.</p>
          )
        )}
      </div>

      <div className="excel-sheet items-list">
        <h3 className="sheet-title">All Items</h3>
        {Object.entries(sortedItemsData).map(([itemCode, item]) => (
          <div key={itemCode} className="item-table-container">
            {renderTable(item, itemCode)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
