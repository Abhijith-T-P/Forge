import React, { useState, useMemo, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = () => {
  const [searchCode, setSearchCode] = useState("");
  const [itemDetails, setItemDetails] = useState(null);

  const itemsData = useMemo(
    () => ({
      403: {
        colors: ["YELLOW", "BLACK", "VEETY"],
        quantities: [0, 12, 0],
        cutting: 34,
        taping: 12,
      },
      404: {
        colors: ["BLUE", "WHITE", "GREEN"],
        quantities: [5, 8, 2],
        cutting: 45,
        taping: 23,
      },
      405: {
        colors: ["RED", "ORANGE", "PURPLE"],
        quantities: [3, 7, 0],
        cutting: 56,
        taping: 34,
      },
      406: {
        colors: ["PINK", "BROWN", "GRAY"],
        quantities: [6, 0, 10],
        cutting: 23,
        taping: 67,
      },
      407: {
        colors: ["PINK", "BROWN", "GRAY"],
        quantities: [0, 0, 0],
        cutting: 0,
        taping: 0,
      },
    }),
    []
  );

  useEffect(() => {
    if (searchCode) {
      const details = itemsData[searchCode];
      if (details) {
        details.finished = details.quantities.reduce(
          (acc, qty) => acc + qty,
          0
        );
        details.total = details.finished + details.cutting + details.taping;
        setItemDetails(details);
      } else {
        setItemDetails(null);
      }
    } else {
      setItemDetails(null);
    }
  }, [searchCode, itemsData]);

  return (
    <div className="dashboard">
      <div className="excel-toolbar">
        <input
          type="text"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Enter item code"
          className="search-input"
        />
      </div>

      <div className="excel-sheet">
        {itemDetails ? (
          <table className="excel-table">
            <thead>
              <tr>
                <th className="item-header">ITEM</th>
                <th className="code-header" colSpan={itemDetails.colors.length + 1}>
                  {searchCode.toUpperCase()}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">COLOUR</td>
                {itemDetails.colors.map((color, index) => (
                  <td key={index} className={`color-cell ${color.toLowerCase()}`}>
                    {color}
                  </td>
                ))}
                <td className="label">FINISHED</td>
              </tr>
              <tr>
                <td className="label">QUANTITY</td>
                {itemDetails.quantities.map((quantity, index) => (
                  <td key={index} className={`quantity ${quantity === 0 ? "out-of-stock" : ""}`}>
                    {quantity}
                  </td>
                ))}
                <td className="finished">{itemDetails.finished}</td>
              </tr>
              <tr>
                <td className="label">CUTTING</td>
                <td colSpan={itemDetails.colors.length + 1} className={`cutting ${itemDetails.cutting === 0 ? "out-of-stock" : ""}`}>
                  {itemDetails.cutting}
                </td>
              </tr>
              <tr>
                <td className="label">TAPING</td>
                <td colSpan={itemDetails.colors.length + 1} className={`taping ${itemDetails.taping === 0 ? "out-of-stock" : ""}`}>
                  {itemDetails.taping}
                </td>
              </tr>
              <tr>
                <td className="label">TOTAL</td>
                <td colSpan={itemDetails.colors.length + 1} className={`total ${itemDetails.total === 0 ? "out-of-stock" : ""}`}>
                  {itemDetails.total}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          searchCode && (
            <p className="no-item-found">Enter a valid item code to search.</p>
          )
        )}
      </div>

      <div className="excel-sheet items-list">
        <h3 className="sheet-title">All Items</h3>
        <table className="excel-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(itemsData).map(([code, data]) => {
              const isAvailable = data.quantities.some(quantity => quantity > 0);
              return (
                <tr key={code} onClick={() => setSearchCode(code)}>
                  <td className="item-code">{code}</td>
                  <td className={`item-status ${isAvailable ? "available" : "out-of-stock"}`}>
                    {isAvailable ? "Available" : "Out of Stock"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
