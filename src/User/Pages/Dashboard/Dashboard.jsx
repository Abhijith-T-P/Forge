import React, { useState, useMemo, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [searchCode, setSearchCode] = useState('');
  const [itemDetails, setItemDetails] = useState(null);

  const itemsData = useMemo(() => ({
    '403': {
      colors: ['YELLOW', 'BLACK', 'VEETY'],
      quantities: [0, 12, 0],
    },
    '404': {
      colors: ['BLUE', 'WHITE', 'GREEN'],
      quantities: [5, 8, 2],
    },
    '405': {
      colors: ['RED', 'ORANGE', 'PURPLE'],
      quantities: [3, 7, 0],
    },
    '406': {
      colors: ['PINK', 'BROWN', 'GRAY'],
      quantities: [6, 0, 10],
    },
    '407': {
      colors: ['CYAN', 'MAGENTA', 'YELLOW'],
      quantities: [10, 5, 3],
    },
    '408': {
      colors: ['ORANGE', 'PURPLE', 'BROWN'],
      quantities: [7, 6, 2],
    },
    '409': {
      colors: ['RED', 'GREEN', 'BLUE'],
      quantities: [4, 9, 8],
    },
    '410': {
      colors: ['BLACK', 'WHITE', 'GRAY'],
      quantities: [11, 0, 7],
    },
    '411': {
      colors: ['VIOLET', 'INDIGO', 'BLUE'],
      quantities: [6, 3, 12],
    },
    '412': {
      colors: ['GREEN', 'YELLOW', 'RED'],
      quantities: [5, 8, 1],
    },
    '413': {
      colors: ['BROWN', 'WHITE', 'BLACK'],
      quantities: [0, 10, 4],
    },
    '414': {
      colors: ['ORANGE', 'PINK', 'PURPLE'],
      quantities: [3, 7, 5],
    },
    '415': {
      colors: ['GRAY', 'CYAN', 'MAGENTA'],
      quantities: [8, 0, 6],
    },
    '416': {
      colors: ['YELLOW', 'RED', 'BLUE'],
      quantities: [2, 4, 10],
    },
    '417': {
      colors: ['BLACK', 'GREEN', 'WHITE'],
      quantities: [7, 0, 12],
    },
    '418': {
      colors: ['PINK', 'PURPLE', 'BROWN'],
      quantities: [6, 3, 8],
    },
    '419': {
      colors: ['CYAN', 'MAGENTA', 'YELLOW'],
      quantities: [9, 5, 2],
    },
    '420': {
      colors: ['BLUE', 'GREEN', 'RED'],
      quantities: [11, 6, 4],
    },
    '421': {
      colors: ['WHITE', 'BLACK', 'GRAY'],
      quantities: [3, 8, 7],
    },
    '422': {
      colors: ['PURPLE', 'ORANGE', 'BROWN'],
      quantities: [2, 4, 9],
    },
    '423': {
      colors: ['RED', 'BLUE', 'GREEN'],
      quantities: [7, 5, 12],
    },
    '424': {
      colors: ['BLACK', 'WHITE', 'CYAN'],
      quantities: [0, 6, 8],
    },
    '425': {
      colors: ['MAGENTA', 'YELLOW', 'RED'],
      quantities: [3, 9, 4],
    },
    '426': {
      colors: ['GRAY', 'ORANGE', 'PURPLE'],
      quantities: [10, 5, 0],
    },
    '427': {
      colors: ['BLUE', 'GREEN', 'YELLOW'],
      quantities: [6, 8, 7],
    },
    '428': {
      colors: ['RED', 'WHITE', 'BLACK'],
      quantities: [2, 11, 4],
    },
    '429': {
      colors: ['PINK', 'MAGENTA', 'BROWN'],
      quantities: [5, 3, 7],
    },
    '430': {
      colors: ['CYAN', 'BLUE', 'GREEN'],
      quantities: [8, 6, 4],
    },
    '431': {
      colors: ['YELLOW', 'RED', 'BLACK'],
      quantities: [7, 2, 10],
    },
    '432': {
      colors: ['ORANGE', 'PURPLE', 'WHITE'],
      quantities: [3, 6, 8],
    },
    '433': {
      colors: ['BROWN', 'GREEN', 'CYAN'],
      quantities: [0, 12, 5],
    },
    '434': {
      colors: ['MAGENTA', 'YELLOW', 'BLUE'],
      quantities: [4, 9, 11],
    },
    '435': {
      colors: ['BLACK', 'WHITE', 'RED'],
      quantities: [10, 0, 6],
    },
    '436': {
      colors: ['GREEN', 'BLUE', 'PINK'],
      quantities: [8, 7, 3],
    },
    '437': {
      colors: ['GRAY', 'YELLOW', 'RED'],
      quantities: [5, 6, 4],
    },
    '438': {
      colors: ['PURPLE', 'ORANGE', 'BROWN'],
      quantities: [7, 3, 2],
    },
    '439': {
      colors: ['WHITE', 'BLACK', 'CYAN'],
      quantities: [6, 4, 9],
    },
    '440': {
      colors: ['MAGENTA', 'YELLOW', 'GREEN'],
      quantities: [2, 8, 5],
    },
  }), []); // No dependencies, itemsData is static

  useEffect(() => {
    if (searchCode) {
      const details = itemsData[searchCode];
      if (details) {
        setItemDetails(details);
      } else {
        setItemDetails(null);
      }
    } else {
      setItemDetails(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCode]);

  return (
    <div className="dashboard">
      <div className="search-form">
        <input
          type="text"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Enter item code"
          className="search-input"
        />
      </div>

      {itemDetails ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="item-header">ITEM</th>
                <th className="code-header">{searchCode.toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label">COLOUR</td>
                {itemDetails.colors.map((color, index) => (
                  <td key={index} className={`color-cell ${color.toLowerCase()}`}>{color}</td>
                ))}
              </tr>
              <tr>
                <td className="label">QUANTITY</td>
                {itemDetails.quantities.map((quantity, index) => (
                  <td key={index} className="quantity">{quantity}</td>
                ))}
              </tr>
              <tr>
                <td className="label">DATA</td>
                {itemDetails.quantities.map((quantity, index) => (
                  <td key={index} className={quantity === 0 ? 'out-of-stock' : 'in-stock'}>
                    {quantity === 0 ? 'OUT OF STOCK' : 'IN STOCK'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        searchCode && <p className="no-item-found">Enter a valid item code to search.</p>
      )}

      <div className="items-list">
        <h3>All Items</h3>
        <ul>
          {Object.keys(itemsData).map(code => (
            <li key={code}>
              <span className="item-code">{code}</span>
              <span className="item-details">
                {itemsData[code].colors.join(', ')} - {itemsData[code].quantities.join(', ')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
