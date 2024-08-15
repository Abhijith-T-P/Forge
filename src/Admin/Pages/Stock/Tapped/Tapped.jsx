import React, { useState, useEffect, useMemo } from 'react';
import { getDocs, collection, setDoc, doc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import './Tapped.css';

const Tapped = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState({});
  const [itemCodes, setItemCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableColors, setAvailableColors] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [showInStock, setShowInStock] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch item codes
        const itemCodesSnapshot = await getDocs(collection(db, 'itemCodes'));
        const codes = itemCodesSnapshot.docs.map(doc => doc.data().code);

        codes.sort((a, b) => {
          const aIsNum = /^\d+$/.test(a);
          const bIsNum = /^\d+$/.test(b);
          const aHasNum = /\d/.test(a);
          const bHasNum = /\d/.test(b);

          if (aIsNum && bIsNum) return parseInt(a) - parseInt(b);
          if (aIsNum) return -1;
          if (bIsNum) return 1;
          if (aHasNum && bHasNum) return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
          if (aHasNum) return -1;
          if (bHasNum) return 1;
          return a.localeCompare(b);
        });

        setItemCodes(codes);

        // Fetch colors
        const colorsSnapshot = await getDocs(collection(db, 'colors'));
        const colors = colorsSnapshot.docs.map(doc => doc.data().color);
        setAvailableColors(colors);

        // Fetch Tapped data
        const tappedSnapshot = await getDocs(collection(db, 'Tapping'));
        const data = Object.fromEntries(
          codes.map(code => [code, { itemCode: code, tapedQuantities: {} }])
        );

        tappedSnapshot.forEach((doc) => {
          const docData = doc.data();
          if (docData.itemCode && docData.tapedQuantities) {
            data[docData.itemCode] = docData;
          }
        });

        setItemsData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return itemCodes.filter(itemCode => {
      const itemData = itemsData[itemCode];
      if (!itemData) return false;

      const matchesSearch = itemCode.toLowerCase().includes(searchTerm.toLowerCase());
      const isInStock = Object.values(itemData.tapedQuantities).some(quantity => quantity && quantity > 0);
      const isOutOfStock = Object.values(itemData.tapedQuantities).every(quantity => !quantity || quantity === 0);

      if (showInStock && !showOutOfStock) {
        return matchesSearch && isInStock;
      } else if (showOutOfStock && !showInStock) {
        return matchesSearch && isOutOfStock;
      } else {
        return matchesSearch;
      }
    });
  }, [searchTerm, itemCodes, itemsData, showInStock, showOutOfStock]);

  const handleEditClick = () => setEditMode(prev => !prev);

  const handleQuantityChange = (itemCode, color, value) => {
    const parsedValue = parseInt(value, 10);
    const newValue = isNaN(parsedValue) ? '' : Math.max(0, parsedValue);

    setItemsData(prevData => ({
      ...prevData,
      [itemCode]: {
        ...prevData[itemCode],
        tapedQuantities: {
          ...prevData[itemCode].tapedQuantities,
          [color]: newValue,
        },
      },
    }));
  };

  const saveChanges = async () => {
    try {
      await Promise.all(
        Object.entries(itemsData).map(async ([itemCode, data]) => {
          const itemRef = doc(db, 'Tapping', itemCode);
          const tapedQuantities = Object.fromEntries(
            Object.entries(data.tapedQuantities)
              .filter(([_, value]) => value !== '')
              .map(([color, value]) => [color, Math.max(0, parseInt(value, 10))])
          );
          await setDoc(itemRef, { itemCode, tapedQuantities }, { merge: true });
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
    if (!value) return "quantity-zero";
    if (value > 0 && value < 5) return "quantity-low";
    if (value >= 5 && value < 10) return "quantity-medium";
    return "quantity-high";
  };

  const toggleInStock = () => {
    setShowInStock(prev => !prev);
    setShowOutOfStock(false);
  };

  const toggleOutOfStock = () => {
    setShowOutOfStock(prev => !prev);
    setShowInStock(false);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="tapped-list">
      <input
        type="text"
        placeholder="Search by item code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />
      <button onClick={handleEditClick}>
        {editMode ? 'Cancel' : 'Edit'}
      </button>
      {editMode && (
        <button onClick={saveChanges} className="save-button">
          Save All Changes
        </button>
      )}
      <button 
        onClick={toggleInStock} 
        className={`filter-button ${showInStock ? 'active' : ''}`}
      >
        In-Stock
      </button>
      <button 
        onClick={toggleOutOfStock} 
        className={`filter-button ${showOutOfStock ? 'active' : ''}`}
      >
        Out of Stock
      </button>
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
            filteredItems.map((itemCode) => (
              <tr key={itemCode}>
                <td className="item-code">{itemCode}</td>
                {availableColors.map((color) => {
                  const quantity = itemsData[itemCode]?.tapedQuantities?.[color] || '';
                  return (
                    <td key={`${itemCode}-${color}`} className={`quantity ${getCellClass(quantity)}`}>
                      {editMode ? (
                        <input
                          type="number"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(itemCode, color, e.target.value)}
                          min="0"
                          className="quantity-input"
                        />
                      ) : (
                        quantity || 0
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

export default Tapped;