import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getDocs, collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Link } from 'react-router-dom';
import './Sold.css';

const Sold = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [availableColors, setAvailableColors] = useState([]);
  const [inputValues, setInputValues] = useState({});
  const inputRefs = useRef({});

  const fetchData = async () => {
    try {
      const data = {};

      // Fetch available colors
      const colorsSnapshot = await getDocs(collection(db, 'colors'));
      const colors = colorsSnapshot.docs.map(doc => doc.data().color);
      setAvailableColors(colors);

      // Fetch data from Finished collection only
      const finishedSnapshot = await getDocs(collection(db, 'Finished'));
      finishedSnapshot.forEach(doc => {
        const docData = doc.data();
        if (docData.itemCode && docData.finishedQuantities) {
          if (!data[docData.itemCode]) {
            data[docData.itemCode] = {};
          }
          colors.forEach(color => {
            data[docData.itemCode][color] = docData.finishedQuantities[color] || 0;
          });
        }
      });

      setItemsData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return Object.entries(itemsData).filter(([itemCode]) =>
      itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, itemsData]);

  const handleInputChange = (itemCode, color, value) => {
    // Ensure the value is a number and is not negative
    const numericValue = Math.max(0, parseInt(value, 10) || 0);
    setInputValues(prevValues => ({
      ...prevValues,
      [itemCode]: {
        ...prevValues[itemCode],
        [color]: numericValue
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const batch = writeBatch(db);

      for (const [itemCode, colors] of Object.entries(inputValues)) {
        for (const [color, inputValue] of Object.entries(colors)) {
          const quantityToSubtract = parseInt(inputValue, 10);
          if (quantityToSubtract > 0) {
            const finishedSnapshot = await getDocs(collection(db, 'Finished'));
            const finishedDoc = finishedSnapshot.docs.find(doc =>
              doc.data().itemCode === itemCode && doc.data().finishedQuantities?.[color]
            );

            if (!finishedDoc) {
              throw new Error(`No finished quantity found for ${itemCode} in color ${color}.`);
            }

            const currentQuantity = finishedDoc.data().finishedQuantities[color];

            if (currentQuantity < quantityToSubtract) {
              throw new Error(`Not enough quantity for ${itemCode} in color ${color}. Available: ${currentQuantity}, Requested: ${quantityToSubtract}`);
            }

            // Update Finished collection
            const newQuantity = currentQuantity - quantityToSubtract;
            batch.update(doc(db, 'Finished', finishedDoc.id), { [`finishedQuantities.${color}`]: newQuantity });

            // Update Sold collection
            const soldDocRef = doc(db, 'Sold', finishedDoc.id);
            const soldSnapshot = await getDocs(collection(db, 'Sold'));
            const soldDoc = soldSnapshot.docs.find(doc => doc.data().itemCode === itemCode);

            const updatedSoldQuantities = soldDoc
              ? { ...soldDoc.data().soldQuantities, [color]: (soldDoc.data().soldQuantities[color] || 0) + quantityToSubtract }
              : { [color]: quantityToSubtract };

            batch.set(soldDocRef, {
              itemCode: itemCode,
              soldQuantities: updatedSoldQuantities
            }, { merge: true });
          }
        }
      }

      await batch.commit();
      alert('Quantities updated successfully');
      setInputValues({});
      fetchData(); // Refresh data after submission
    } catch (error) {
      console.error("Error updating data:", error);
      alert(`Failed to update quantities: ${error.message}`);
    }
  };

  const handleKeyDown = (e, itemCode, color) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const currentRef = inputRefs.current[`${itemCode}-${color}`];
      const allInputs = Object.values(inputRefs.current);
      const currentIndex = allInputs.indexOf(currentRef);
      const nextIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1;

      if (nextIndex >= 0 && nextIndex < allInputs.length) {
        const nextInput = allInputs[nextIndex];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  return (
    <div className="sold-page-container">
      <input
        type="text"
        placeholder="Search by item code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="sold-search-bar"
      />
      <div className="sold-data-link-container">
        <Link to="../SoldData" className="sold-data-button">Sales data</Link>
      </div>
      <form onSubmit={handleSubmit}>
        <table className="sold-excel-table">
          <thead>
            <tr>
              <th>ITEM</th>
              {availableColors.map(color => (
                <th key={color}>{color}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={availableColors.length + 1} className="sold-loading">Loading...</td>
              </tr>
            ) : filteredItems.length > 0 ? (
              filteredItems.map(([itemCode, data]) => (
                <tr key={itemCode}>
                  <td className="item-code">{itemCode}</td>
                  {availableColors.map(color => {
                    const total = data[color] || 0;
                    return (
                      <td key={`${itemCode}-${color}`} data-label={color} className="sold-quantity-input">
                        <div className="input-container">
                          <input
                            type="text" // Changed to text to control input
                            value={inputValues[itemCode]?.[color] || ''}
                            onChange={(e) => handleInputChange(itemCode, color, e.target.value)}
                            pattern="\d*" // Ensures only numbers are accepted
                            onKeyDown={(e) => handleKeyDown(e, itemCode, color)}
                            ref={el => {
                              inputRefs.current[`${itemCode}-${color}`] = el;
                            }}
                          />
                          <span className="max-value">Max: {total}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={availableColors.length + 1} className="sold-no-item-found">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <button type="submit" className="sold-submit-button">Submit</button>
      </form>
    </div>
  );
};

export default Sold;
