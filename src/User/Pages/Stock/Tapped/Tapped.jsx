import React, { useMemo, useState } from 'react';
import './Tapped.css';

const Tapped = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample item data
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
      }
    }),
    []
  );
  
  // Filter items based on the search term
  const filteredItems = useMemo(() => {
    return Object.entries(itemsData).filter(([itemCode]) =>
      itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, itemsData]);

  return (
    <div className="tapped-list">
      <input
        type="text"
        placeholder="Search by item code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      {filteredItems.map(([itemCode, data]) => (
        <div className="item-table-container" key={itemCode}>
          <table className="excel-table">
            <thead>
              <tr>
                <th className="item-header">ITEM</th>
                <th className="code-header" colSpan={data.colors.length + 1}>
                  {itemCode}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">COLOR</td>
                <td className="label">TAPED</td>
              </tr>
              {data.colors.map((color, index) => (
                <tr key={index}>
                  <td className={`color-cell ${color.toLowerCase()}`}>
                    {color}
                  </td>
                  <td className={`taped ${data.tapingQuantities[index] === 0 ? 'taped-zero' : ''}`}>
                    {data.tapingQuantities[index]}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="label">TOTAL TAPED</td>
                <td className={`taped ${data.tapingQuantities.reduce((acc, qty) => acc + qty, 0) === 0 ? 'taped-zero' : ''}`}>
                  {data.tapingQuantities.reduce((acc, qty) => acc + qty, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default Tapped;
