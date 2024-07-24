// Cutting.js
import React, { useMemo, useState } from 'react';
import './Cutting.css';

const Cutting = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const itemsData = useMemo(
    () => ({
      401: {
        colors: ["RED", "BLUE", "GREEN"],
        finished: [10, 15, 5],
        cuttingQuantities: [3, 8, 2],
        tapingQuantities: [1, 4, 1],
      },
      402: {
        colors: ["YELLOW", "BLACK", "WHITE"],
        finished: [20, 0, 5],
        cuttingQuantities: [6, 0, 2],
        tapingQuantities: [2, 0, 1],
      },
      403: {
        colors: ["YELLOW", "BLACK", "VEETY"],
        finished: [0, 12, 0],
        cuttingQuantities: [5, 10, 19],
        tapingQuantities: [2, 7, 3],
      },
      404: {
        colors: ["BLUE", "WHITE", "GREEN"],
        finished: [5, 8, 2],
        cuttingQuantities: [10, 15, 20],
        tapingQuantities: [5, 8, 10],
      },
      405: {
        colors: ["RED", "ORANGE", "PURPLE"],
        finished: [3, 7, 0],
        cuttingQuantities: [8, 15, 33],
        tapingQuantities: [3, 9, 22],
      },
      406: {
        colors: ["PINK", "BROWN", "GRAY"],
        finished: [6, 0, 10],
        cuttingQuantities: [12, 5, 6],
        tapingQuantities: [8, 0, 59],
      },
      407: {
        colors: ["PINK", "BROWN", "GRAY"],
        finished: [0, 0, 0],
        cuttingQuantities: [0, 0, 0],
        tapingQuantities: [0, 0, 0],
      },
      408: {
        colors: ["PURPLE", "CYAN", "MAGENTA"],
        finished: [0, 0, 0],
        cuttingQuantities: [0, 0, 0],
        tapingQuantities: [0, 0, 0],
      },
      409: {
        colors: ["RED", "BLACK", "WHITE"],
        finished: [10, 5, 12],
        cuttingQuantities: [2, 7, 6],
        tapingQuantities: [3, 2, 4],
      },
      410: {
        colors: ["BLUE", "GREEN", "YELLOW"],
        finished: [4, 8, 6],
        cuttingQuantities: [3, 5, 7],
        tapingQuantities: [1, 2, 3],
      },
      411: {
        colors: ["PURPLE", "MAGENTA", "CYAN"],
        finished: [7, 3, 9],
        cuttingQuantities: [6, 2, 8],
        tapingQuantities: [5, 1, 4],
      },
      412: {
        colors: ["ORANGE", "PINK", "BROWN"],
        finished: [11, 2, 5],
        cuttingQuantities: [7, 4, 3],
        tapingQuantities: [3, 0, 6],
      },
      413: {
        colors: ["GREEN", "WHITE", "BLACK"],
        finished: [8, 7, 1],
        cuttingQuantities: [5, 6, 2],
        tapingQuantities: [4, 3, 1],
      },
      414: {
        colors: ["RED", "BLUE", "YELLOW"],
        finished: [15, 9, 6],
        cuttingQuantities: [8, 4, 3],
        tapingQuantities: [6, 2, 1],
      },
      415: {
        colors: ["PURPLE", "ORANGE", "CYAN"],
        finished: [12, 4, 3],
        cuttingQuantities: [2, 7, 5],
        tapingQuantities: [1, 3, 2],
      },
      416: {
        colors: ["MAGENTA", "GREEN", "WHITE"],
        finished: [9, 11, 2],
        cuttingQuantities: [6, 3, 4],
        tapingQuantities: [2, 1, 3],
      },
      417: {
        colors: ["BLUE", "BLACK", "RED"],
        finished: [7, 6, 10],
        cuttingQuantities: [4, 5, 7],
        tapingQuantities: [3, 2, 1],
      },
      418: {
        colors: ["BROWN", "GRAY", "PINK"],
        finished: [8, 4, 7],
        cuttingQuantities: [5, 3, 6],
        tapingQuantities: [2, 1, 4],
      },
      419: {
        colors: ["YELLOW", "BLUE", "GREEN"],
        finished: [11, 10, 5],
        cuttingQuantities: [6, 4, 2],
        tapingQuantities: [3, 1, 2],
      },
      420: {
        colors: ["PURPLE", "MAGENTA", "CYAN"],
        finished: [3, 5, 6],
        cuttingQuantities: [2, 5, 3],
        tapingQuantities: [1, 2, 4],
      },
      421: {
        colors: ["RED", "GREEN", "BLACK"],
        finished: [6, 8, 4],
        cuttingQuantities: [4, 5, 2],
        tapingQuantities: [1, 2, 3],
      },
      422: {
        colors: ["ORANGE", "WHITE", "BLUE"],
        finished: [5, 7, 9],
        cuttingQuantities: [3, 6, 5],
        tapingQuantities: [2, 1, 4],
      },
      423: {
        colors: ["GRAY", "BROWN", "PINK"],
        finished: [2, 9, 6],
        cuttingQuantities: [1, 7, 5],
        tapingQuantities: [3, 2, 1],
      },
      424: {
        colors: ["YELLOW", "PURPLE", "GREEN"],
        finished: [4, 11, 7],
        cuttingQuantities: [2, 8, 5],
        tapingQuantities: [1, 3, 2],
      },
      425: {
        colors: ["BLUE", "RED", "CYAN"],
        finished: [10, 6, 5],
        cuttingQuantities: [4, 5, 7],
        tapingQuantities: [2, 3, 4],
      },
      426: {
        colors: ["MAGENTA", "BLACK", "ORANGE"],
        finished: [7, 8, 6],
        cuttingQuantities: [3, 4, 2],
        tapingQuantities: [1, 2, 3],
      },
      427: {
        colors: ["WHITE", "GREEN", "PURPLE"],
        finished: [9, 3, 8],
        cuttingQuantities: [5, 2, 6],
        tapingQuantities: [3, 1, 4],
      },
      428: {
        colors: ["RED", "PINK", "BLUE"],
        finished: [6, 8, 10],
        cuttingQuantities: [4, 5, 3],
        tapingQuantities: [2, 2, 1],
      },
      429: {
        colors: ["BROWN", "GRAY", "YELLOW"],
        finished: [5, 7, 9],
        cuttingQuantities: [2, 6, 4],
        tapingQuantities: [1, 3, 2],
      },
      430: {
        colors: ["CYAN", "MAGENTA", "PURPLE"],
        finished: [8, 3, 7],
        cuttingQuantities: [6, 2, 5],
        tapingQuantities: [3, 1, 4],
      },
    }),
    []
  );

  const filteredItems = useMemo(() => {
    return Object.entries(itemsData).filter(([itemCode]) =>
      itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, itemsData]);

  const getCellClass = (value) => {
    if (value === 0) return "quantity-zero";
    if (value > 0 && value < 5) return "quantity-low";
    if (value >= 5 && value < 10) return "quantity-medium";
    return "quantity-high";
  };

  return (
    <div className="cutting-list">
      <input
        type="text"
        placeholder="Search by item code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <table className="excel-table">
        <thead>
          <tr>
            <th>ITEM</th>
            <th>COLOR</th>
            <th>CUTTING</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length > 0 ? (
            filteredItems.flatMap(([itemCode, data]) =>
              data.colors.map((color, index) => (
                <tr key={`${itemCode}-${index}`}>
                  {index === 0 && (
                    <td rowSpan={data.colors.length} className="item-code">
                      {itemCode}
                    </td>
                  )}
                  <td className={`color-cell ${color.toLowerCase()}`}>{color}</td>
                  <td className={`quantity ${getCellClass(data.cuttingQuantities[index])}`}>
                    {data.cuttingQuantities[index]}
                  </td>
                </tr>
              ))
            )
          ) : (
            <tr>
              <td colSpan="3" className="no-item-found">No items found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Cutting;