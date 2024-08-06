import React, { useState, useEffect, useMemo } from 'react';
import { getDocs, collection, updateDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Sold.css'; // Ensure this file exists and is correctly named

const Sold = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsData, setItemsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [availableColors, setAvailableColors] = useState([]);
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collections = ['Cutting', 'Finished', 'Tapping'];
        const data = {};

        // Fetch available colors
        const colorsSnapshot = await getDocs(collection(db, 'colors'));
        const colors = [];
        colorsSnapshot.forEach(doc => {
          colors.push(doc.data().color);
        });
        setAvailableColors(colors);

        // Fetch and aggregate data
        for (const collectionName of collections) {
          const querySnapshot = await getDocs(collection(db, collectionName));
          querySnapshot.forEach(doc => {
            const docData = doc.data();
            if (docData.itemCode) {
              if (!data[docData.itemCode]) {
                data[docData.itemCode] = {};
                colors.forEach(color => data[docData.itemCode][color] = 0);
              }
              
              let quantityField;
              if (collectionName === 'Cutting') {
                quantityField = 'stockByColor';
              } else if (collectionName === 'Finished') {
                quantityField = 'finishedQuantities';
              } else if (collectionName === 'Tapping') {
                quantityField = 'tapedQuantities';
              }

              if (docData[quantityField]) {
                Object.entries(docData[quantityField]).forEach(([color, quantity]) => {
                  if (colors.includes(color)) {
                    data[docData.itemCode][color] += parseInt(quantity, 10);
                  }
                });
              }
            }
          });
        }
        
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
    return Object.entries(itemsData).filter(([itemCode]) =>
      itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, itemsData]);

  const handleInputChange = (itemCode, color, value) => {
    setInputValues(prevValues => ({
      ...prevValues,
      [itemCode]: {
        ...prevValues[itemCode],
        [color]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const itemCode of Object.keys(inputValues)) {
        const colors = inputValues[itemCode];
        for (const color of Object.keys(colors)) {
          const quantityToSubtract = parseInt(colors[color], 10);
          if (quantityToSubtract > 0) {
            // Fetch the current finishedQuantities for the itemCode
            const finishedSnapshot = await getDocs(collection(db, 'Finished'));
            finishedSnapshot.forEach(async (docSnapshot) => {
              const docData = docSnapshot.data();
              if (docData.itemCode === itemCode && docData.finishedQuantities && docData.finishedQuantities[color]) {
                const currentQuantity = parseInt(docData.finishedQuantities[color], 10);
                const newQuantity = currentQuantity - quantityToSubtract;
                
                if (newQuantity < 0) {
                  throw new Error(`Not enough quantity for ${itemCode} in color ${color}`);
                }
                
                const updatedQuantities = { ...docData.finishedQuantities, [color]: newQuantity };

                // Update Firestore document in Finished collection
                const docRef = doc(db, 'Finished', docSnapshot.id);
                await updateDoc(docRef, { finishedQuantities: updatedQuantities });

                // Update Firestore document in Sold collection
                const soldDocRef = doc(db, 'Sold', docSnapshot.id);
                const soldSnapshot = await getDocs(collection(db, 'Sold'));
                let soldData = {};
                soldSnapshot.forEach(soldDoc => {
                  if (soldDoc.data().itemCode === itemCode) {
                    soldData = soldDoc.data();
                  }
                });

                const updatedSoldQuantities = { 
                  ...soldData.soldQuantities, 
                  [color]: (soldData.soldQuantities?.[color] || 0) + quantityToSubtract 
                };

                await setDoc(soldDocRef, {
                  itemCode: itemCode,
                  soldQuantities: updatedSoldQuantities
                }, { merge: true });
              }
            });
          }
        }
      }
      alert('Quantities updated successfully');
      setInputValues({}); // Clear input values after successful submission
    } catch (error) {
      console.error("Error updating data:", error);
      alert(`Failed to update quantities: ${error.message}`);
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
            ) : (
              filteredItems.length > 0 ? (
                filteredItems.map(([itemCode, data]) => (
                  <tr key={itemCode}>
                    <td className="item-code">{itemCode}</td>
                    {availableColors.map(color => {
                      const total = data[color] || 0;
                      return (
                        <td key={`${itemCode}-${color}`} data-label={color} className="sold-quantity-input">
                          <input
                            type="number"
                            value={inputValues[itemCode]?.[color] || ''}
                            onChange={(e) => handleInputChange(itemCode, color, e.target.value)}
                            min="0"
                            max={total}
                          />
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
              )
            )}
          </tbody>
        </table>
        <button type="submit" className="sold-submit-button">Submit</button>
      </form>
    </div>
  );
};

export default Sold;
