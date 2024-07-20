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
        tapingQuantities: [1, 4, 1],
      },
      402: {
        colors: ["YELLOW", "PURPLE", "ORANGE"],
        finished: [8, 12, 7],
        cuttingQuantities: [2, 5, 3],
        tapingQuantities: [1, 3, 2],
      },
      403: {
        colors: ["BLACK", "WHITE", "GRAY"],
        finished: [20, 18, 15],
        cuttingQuantities: [5, 4, 3],
        tapingQuantities: [2, 2, 1],
      },
      404: {
        colors: ["PINK", "CYAN", "MAGENTA"],
        finished: [6, 9, 4],
        cuttingQuantities: [1, 3, 1],
        tapingQuantities: [1, 2, 1],
      },
      405: {
        colors: ["BROWN", "BEIGE", "MAROON"],
        finished: [14, 11, 8],
        cuttingQuantities: [4, 3, 2],
        tapingQuantities: [2, 1, 1],
      }
    }),
    []
  );

  const dataWithSlNo = useMemo(() => {
    return Object.entries(itemsData).map(([code, details], index) => ({
      slNo: index + 1,
      item: code,
      ...details,
    }));
  }, [itemsData]);

  const sortedAndFilteredData = useMemo(() => {
    return dataWithSlNo
      .filter((item) => item.item.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const aIsNum = /^\d+$/.test(a.item);
        const bIsNum = /^\d+$/.test(b.item);

        if (aIsNum && bIsNum) {
          return parseInt(a.item) - parseInt(b.item);
        } else if (aIsNum) {
          return -1;
        } else if (bIsNum) {
          return 1;
        } else {
          return a.item.localeCompare(b.item);
        }
      });
  }, [searchTerm, dataWithSlNo]);

  const getCellClass = (value) => {
    if (value === 0) return 'stock-zero';
    return 'stock-non-zero';
  };

  const getTotalClass = (total) => {
    return total === 0 ? 'total-zero' : 'total-non-zero';
  };

  const calculateTotals = (item) => {
    const cutting = item.cuttingQuantities.reduce((a, b) => a + b, 0);
    const taping = item.tapingQuantities.reduce((a, b) => a + b, 0);
    const finished = item.finished.reduce((a, b) => a + b, 0);
    const total = cutting + taping + finished;
    return { cutting, taping, finished, total };
  };

  useEffect(() => {
    if (searchTerm) {
      const details = itemsData[searchTerm];
      if (details) {
        setItemDetails({
          ...details,
          ...calculateTotals(details)
        });
      } else {
        setItemDetails(null);
      }
    } else {
      setItemDetails(null);
    }
  }, [searchTerm, itemsData]);

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
          <table className="excel-table">
            <thead>
              <tr>
                <th className="item-header">ITEM</th>
                <th className="code-header" colSpan={4}>
                  {searchTerm.toUpperCase()}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">COLOUR</td>
                <td className="label">CUTTING</td>
                <td className="label">TAPING</td>
                <td className="label">FINISHED</td>
                <td className="label">TOTAL</td>
              </tr>
              {itemDetails.colors.map((color, index) => (
                <tr key={index}>
                  <td className={`color-cell ${color.toLowerCase()}`}>{color}</td>
                  <td className={`quantity ${getCellClass(itemDetails.cuttingQuantities[index])}`}>
                    {itemDetails.cuttingQuantities[index]}
                  </td>
                  <td className={`quantity ${getCellClass(itemDetails.tapingQuantities[index])}`}>
                    {itemDetails.tapingQuantities[index]}
                  </td>
                  <td className={`quantity ${getCellClass(itemDetails.finished[index])}`}>
                    {itemDetails.finished[index]}
                  </td>
                  {index === 0 && (
                    <td rowSpan={itemDetails.colors.length} className={`total ${getTotalClass(itemDetails.total)}`}>
                      {itemDetails.total}
                    </td>
                  )}
                </tr>
              ))}
              <tr>
                <td className="label">TOTAL</td>
                <td className={`cutting ${getTotalClass(itemDetails.cutting)}`}>
                  {itemDetails.cutting}
                </td>
                <td className={`taping ${getTotalClass(itemDetails.taping)}`}>
                  {itemDetails.taping}
                </td>
                <td className={`finished ${getTotalClass(itemDetails.finished)}`}>
                  {itemDetails.finished}
                </td>
                <td className={`total ${getTotalClass(itemDetails.total)}`}>
                  {itemDetails.total}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          searchTerm && (
            <p className="no-item-found">Enter a valid item code to search.</p>
          )
        )}
      </div>

      <div className="excel-sheet items-list">
        <h3 className="sheet-title">All Items</h3>
        {sortedAndFilteredData.map((item, index) => {
          const totals = calculateTotals(item);
          return (
            <div className="item-table-container" key={index}>
              <table className="excel-table">
                <thead>
                  <tr>
                    <th className="item-header">ITEM</th>
                    <th className="code-header" colSpan={4}>
                      {item.item}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="label">COLOUR</td>
                    <td className="label">CUTTING</td>
                    <td className="label">TAPING</td>
                    <td className="label">FINISHED</td>
                    <td className="label">TOTAL</td>
                  </tr>
                  {item.colors.map((color, colorIndex) => (
                    <tr key={colorIndex}>
                      <td className={`color-cell ${color.toLowerCase()}`}>{color}</td>
                      <td className={`quantity ${getCellClass(item.cuttingQuantities[colorIndex])}`}>
                        {item.cuttingQuantities[colorIndex]}
                      </td>
                      <td className={`quantity ${getCellClass(item.tapingQuantities[colorIndex])}`}>
                        {item.tapingQuantities[colorIndex]}
                      </td>
                      <td className={`quantity ${getCellClass(item.finished[colorIndex])}`}>
                        {item.finished[colorIndex]}
                      </td>
                      {colorIndex === 0 && (
                        <td rowSpan={item.colors.length} className={`total ${getTotalClass(totals.total)}`}>
                          {totals.total}
                        </td>
                      )}
                    </tr>
                  ))}
                  <tr>
                    <td className="label">TOTAL</td>
                    <td className={`cutting ${getTotalClass(totals.cutting)}`}>
                      {totals.cutting}
                    </td>
                    <td className={`taping ${getTotalClass(totals.taping)}`}>
                      {totals.taping}
                    </td>
                    <td className={`finished ${getTotalClass(totals.finished)}`}>
                      {totals.finished}
                    </td>
                    <td className={`total ${getTotalClass(totals.total)}`}>
                      {totals.total}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;