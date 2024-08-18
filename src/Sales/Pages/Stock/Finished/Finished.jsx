import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import './Finished.css';

const Finished = () => {
  const [itemsData, setItemsData] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const finishedSnapshot = await getDocs(collection(db, 'Finished'));
        const data = [];
        const allColors = new Set();

        finishedSnapshot.forEach((doc) => {
          const docData = doc.data();
          if (docData.itemCode && docData.finishedQuantities) {
            data.push({
              itemCode: docData.itemCode,
              quantities: docData.finishedQuantities,
            });
            Object.keys(docData.finishedQuantities).forEach(color => allColors.add(color));
          }
        });

        setItemsData(data);
        setAvailableColors([...allColors]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = itemsData.filter(item => {
    const quantities = Object.values(item.quantities);
    const hasStock = quantities.some(qty => qty > 0);
    const isOutOfStock = quantities.every(qty => qty === 0);

    if (filter === 'inStock') {
      return hasStock;
    }
    if (filter === 'outOfStock') {
      return isOutOfStock;
    }
    return true;
  });

  const toggleFilter = (selectedFilter) => setFilter(selectedFilter);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="finished-list">
      <div className="filter-buttons">
        <button 
          onClick={() => toggleFilter('all')} 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
        >
          All
        </button>
        <button 
          onClick={() => toggleFilter('inStock')} 
          className={`filter-button ${filter === 'inStock' ? 'active' : ''}`}
        >
          In-Stock
        </button>
        <button 
          onClick={() => toggleFilter('outOfStock')} 
          className={`filter-button ${filter === 'outOfStock' ? 'active' : ''}`}
        >
          Out of Stock
        </button>
      </div>
      <table className="excel-table">
        <thead>
          <tr>
            <th>ITEM</th>
            {availableColors.map(color => (
              <th key={color}>{color}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredItems.length > 0 ? (
            filteredItems.map(({ itemCode, quantities }) => (
              <tr key={itemCode}>
                <td className="item-code">{itemCode}</td>
                {availableColors.map((color) => {
                  const quantity = quantities[color] || 0;
                  return (
                    <td
                      key={`${itemCode}-${color}`}
                      className={`quantity ${quantity === 0 ? 'quantity-zero' : (quantity > 0 && quantity < 5) ? 'quantity-low' : (quantity >= 5 && quantity < 10) ? 'quantity-medium' : 'quantity-high'}`}
                    >
                      {quantity}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={availableColors.length + 1} className="no-item-found">No items found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Finished;
