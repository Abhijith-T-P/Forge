import React, { useState, useEffect } from 'react';
import { getDocs, collection, setDoc, doc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import './Finished.css';

const Finished = () => {
  const [itemsData, setItemsData] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
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

        console.log('Fetched data:', data);
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

  const handleEditClick = () => setEditMode(prev => !prev);

  const handleQuantityChange = (itemCode, color, value) => {
    const numValue = value === '' ? 0 : Math.max(0, parseInt(value, 10));
    
    setItemsData(prevData => {
      return prevData.map(item => {
        if (item.itemCode === itemCode) {
          // Ensure existing quantities object is updated without altering other colors
          const updatedQuantities = { ...item.quantities, [color]: numValue };
  
          return {
            ...item,
            quantities: updatedQuantities
          };
        }
        return item;
      });
    });
  };
  

  const saveChanges = async () => {
    try {
      await Promise.all(
        itemsData.map(async ({ itemCode, quantities }) => {
          const itemRef = doc(db, 'Finished', itemCode);
          console.log(`Saving ${itemCode}:`, quantities);
          await setDoc(itemRef, { itemCode, finishedQuantities: quantities }, { merge: true });
        })
      );
      alert('Changes saved successfully!');
      setEditMode(false);
    } catch (error) {
      console.error("Error saving changes:", error);
      alert('Error saving changes. Please try again.');
    }
  };

  const getCellClass = (value) => {
    if (value === 0) return "quantity-zero";
    if (value > 0 && value < 5) return "quantity-low";
    if (value >= 5 && value < 10) return "quantity-medium";
    return "quantity-high";
  };

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
          onClick={handleEditClick} 
          className={`edit-button ${editMode ? 'cancel' : 'edit'}`}
        >
          {editMode ? 'Cancel' : 'Edit'}
        </button>
        {editMode && (
          <button onClick={saveChanges} className="save-button">
            Save All Changes
          </button>
        )}
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
                      className={`quantity ${getCellClass(quantity)}`}
                    >
                      {editMode ? (
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(itemCode, color, e.target.value)}
                          min="0"
                          className="quantity-input"
                        />
                      ) : (
                        quantity
                      )}
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