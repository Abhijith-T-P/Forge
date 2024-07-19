import React, { useMemo, useState } from 'react';
import './StockList.css';

const StockList = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dummy data based on the image
  const stockData = [
    { item: '201', yelloow: 5, black: 3, veety: 7 },
    { item: '202', yelloow: 12, black: 8, veety: 2 },
    { item: '203', yelloow: 0, black: 6, veety: 0 },
    { item: '204', yelloow: 0, black: 0, veety: 0 },
    { item: '205', yelloow: 7, black: 4, veety: 5 },
    { item: '206', yelloow: 15, black: 0, veety: 3 },
    { item: '207', yelloow: 4, black: 8, veety: 2 },
    { item: '208', yelloow: 0, black: 7, veety: 1 },
    { item: '209', yelloow: 9, black: 6, veety: 0 },
    { item: '210', yelloow: 2, black: 0, veety: 5 },
    { item: '211', yelloow: 0, black: 0, veety: 0 },
    { item: '212', yelloow: 3, black: 3, veety: 3 },
    { item: '213', yelloow: 10, black: 0, veety: 7 },
    { item: '214', yelloow: 0, black: 12, veety: 0 },
    { item: '215', yelloow: 6, black: 4, veety: 1 },
    { item: '216', yelloow: 0, black: 2, veety: 10 },
    { item: '217', yelloow: 14, black: 5, veety: 0 },
    { item: '218', yelloow: 0, black: 0, veety: 3 },
    { item: '219', yelloow: 7, black: 7, veety: 2 },
    { item: '220', yelloow: 0, black: 9, veety: 6 },
    { item: '221', yelloow: 8, black: 0, veety: 5 },
    { item: '222', yelloow: 5, black: 5, veety: 5 },
    { item: '223', yelloow: 0, black: 0, veety: 9 },
    { item: '224', yelloow: 4, black: 0, veety: 8 },
    { item: '225', yelloow: 12, black: 3, veety: 1 },
    { item: '226', yelloow: 6, black: 7, veety: 4 },
    { item: '227', yelloow: 0, black: 1, veety: 6 },
    { item: '228', yelloow: 9, black: 4, veety: 0 },
    { item: '229', yelloow: 0, black: 3, veety: 8 },
    { item: '230', yelloow: 2, black: 6, veety: 5 },
    { item: '231', yelloow: 8, black: 0, veety: 7 },
    { item: '232', yelloow: 0, black: 11, veety: 2 },
    { item: '233', yelloow: 4, black: 3, veety: 6 },
    { item: '234', yelloow: 0, black: 5, veety: 9 },
    { item: '235', yelloow: 7, black: 0, veety: 3 },
    { item: '236', yelloow: 10, black: 7, veety: 1 },
    { item: '237', yelloow: 5, black: 6, veety: 4 },
    { item: '238', yelloow: 3, black: 0, veety: 10 },
    { item: '239', yelloow: 0, black: 8, veety: 2 },
    { item: '240', yelloow: 6, black: 9, veety: 0 },
    { item: '241', yelloow: 0, black: 4, veety: 7 },
    { item: '242', yelloow: 8, black: 2, veety: 3 },
    { item: '243', yelloow: 0, black: 6, veety: 5 },
    { item: '244', yelloow: 5, black: 0, veety: 8 },
    { item: '245', yelloow: 12, black: 2, veety: 4 },
    { item: '246', yelloow: 0, black: 5, veety: 9 },
    { item: '247', yelloow: 7, black: 8, veety: 1 },
    { item: '248', yelloow: 4, black: 0, veety: 6 },
    { item: '249', yelloow: 9, black: 7, veety: 0 },
    { item: '250', yelloow: 0, black: 3, veety: 10 },
  ];

  const dataWithSlNo = stockData.map((item, index) => ({
    slNo: index + 1,
    ...item,
  }));

  const sortedAndFilteredData = useMemo(() => {
    return dataWithSlNo
      .filter(item =>
        item.item.toLowerCase().includes(searchTerm.toLowerCase())
      )
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
  }, [searchTerm, dataWithSlNo]); // Added dataWithSlNo as a dependency

  const getCellClass = (value) => {
    if (value === 0) return 'stock-zero';
    return 'stock-non-zero';
  };

  const getRowClass = (item) => {
    if (item.yelloow === 0 && item.black === 0 && item.veety === 0) {
      return 'stock-zero-row';
    }
    return '';
  };

  return (
    <div className="stock-list">
      <input
        type="text"
        placeholder="Search by item code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <table className="stock-table">
        <thead>
          <tr>
            <th>SI NO</th>
            <th>ITEM</th>
            <th>YELLOOW</th>
            <th>BLACK</th>
            <th>VEETY</th>
          </tr>
        </thead>
        <tbody>
          {sortedAndFilteredData.map((item) => (
            <tr key={item.slNo} className={getRowClass(item)}>
              <td>{item.slNo}</td>
              <td>{item.item}</td>
              <td className={getCellClass(item.yelloow)}>{item.yelloow}</td>
              <td className={getCellClass(item.black)}>{item.black}</td>
              <td className={getCellClass(item.veety)}>{item.veety}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockList;
