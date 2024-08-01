import React, { useState, useEffect, useCallback } from 'react';
import './TapePage.css';
import { getDocs, collection, query, where, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

const TapePage = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [tapedQuantities, setTapedQuantities] = useState({});
  const [itemCodes, setItemCodes] = useState([]);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toISOString().split('T')[0]);

    // Fetch item codes from the Cutting collection
    const fetchItemCodes = async () => {
      try {
        const cuttingSnapshot = await getDocs(collection(db, 'Cutting'));
        const codes = cuttingSnapshot.docs.map(doc => doc.data().itemCode);
        const sortedCodes = codes.sort((a, b) => a.localeCompare(b));
        setItemCodes(sortedCodes);
      } catch (error) {
        console.error("Error fetching item codes:", error);
      }
    };

    fetchItemCodes();
  }, []);

  const fetchAvailableItems = useCallback(async () => {
    if (!itemCode) return;

    try {
      const cuttingCollection = collection(db, "Cutting");
      const q = query(cuttingCollection, where("itemCode", "==", itemCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const aggregatedStockByColor = {};

        querySnapshot.forEach((doc) => {
          const itemData = doc.data();

          if (itemData.stockByColor && typeof itemData.stockByColor === 'object') {
            console.log("Fetched item data:", itemData);

            // Aggregate stock by color
            Object.entries(itemData.stockByColor).forEach(([color, quantity]) => {
              const currentQuantity = aggregatedStockByColor[color] || 0;
              aggregatedStockByColor[color] = currentQuantity + (typeof quantity === 'string' ? parseInt(quantity, 10) : quantity);
            });

            console.log("Aggregated Stock by Color:", aggregatedStockByColor);

            setSelectedItem({
              ...itemData,
              stockByColor: aggregatedStockByColor
            });
            setTapedQuantities({});
          } else {
            console.warn("`stockByColor` is not available or not an object.");
            setSelectedItem(null);
          }
        });
      } else {
        console.log("No matching document found for itemCode:", itemCode);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setSelectedItem(null);
    }
  }, [itemCode]);

  useEffect(() => {
    if (itemCode) {
      fetchAvailableItems();
    }
  }, [itemCode, fetchAvailableItems]);

  const handleTapedQuantityChange = (color, quantity) => {
    setTapedQuantities(prev => ({ ...prev, [color]: quantity }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
  
    try {
      // Create a batch instance
      const batch = writeBatch(db);
  
      // Fetch all Cutting documents for the given item code
      const cuttingQuery = query(collection(db, "Cutting"), where("itemCode", "==", itemCode));
      const cuttingSnapshot = await getDocs(cuttingQuery);
  
      if (!cuttingSnapshot.empty) {
        cuttingSnapshot.docs.forEach((doc) => {
          const cuttingRef = doc.ref;
          const itemData = doc.data();
          const currentStockByColor = itemData.stockByColor || {};
  
          const updatedItemStockByColor = { ...currentStockByColor };
          Object.entries(tapedQuantities).forEach(([color, quantity]) => {
            const currentQuantity = parseInt(updatedItemStockByColor[color], 10) || 0;
            updatedItemStockByColor[color] = Math.max(currentQuantity - parseInt(quantity, 10), 0);
          });
  
          // Update the Cutting document in the batch
          batch.update(cuttingRef, { stockByColor: updatedItemStockByColor });
        });
  
        // Check if a Tapping document already exists for this itemCode and date
        const tappingQuery = query(
          collection(db, "Tapping"),
          where("itemCode", "==", itemCode),
          where("date", "==", currentDate)
        );
        const tappingSnapshot = await getDocs(tappingQuery);
  
        let tappingRef;
        let existingTapedQuantities = {};
  
        if (!tappingSnapshot.empty) {
          // Update existing Tapping document
          tappingRef = tappingSnapshot.docs[0].ref;
          existingTapedQuantities = tappingSnapshot.docs[0].data().tapedQuantities || {};
        } else {
          // Create new Tapping document
          tappingRef = doc(collection(db, "Tapping"));
        }
  
        // Merge existing and new taped quantities
        const mergedTapedQuantities = { ...existingTapedQuantities };
        Object.entries(tapedQuantities).forEach(([color, quantity]) => {
          mergedTapedQuantities[color] = (parseInt(mergedTapedQuantities[color], 10) || 0) + parseInt(quantity, 10);
        });
  
        // Prepare tapping data
        const tappingData = {
          date: currentDate,
          itemCode: itemCode,
          tapedQuantities: mergedTapedQuantities,
        };
  
        // Set or update the Tapping document in the batch
        batch.set(tappingRef, tappingData, { merge: true });
  
        // Commit the batch
        await batch.commit();
  
        console.log('Stock updated in Cutting and Tapping');
        setItemCode('');
        setSelectedItem(null);
        setTapedQuantities({});
        alert("Stock moved to tape and updated successfully!");
      } else {
        console.error("No matching document found for update");
        alert("Error updating stock. Document not found.");
      }
    } catch (error) {
      console.error('Error processing data:', error);
      alert("Error processing data. Please try again.");
    }
  };

  return (
    <div className="tape-page-container">
      <h2 className="tape-header">Move Stock to Tape</h2>
      <form onSubmit={handleSubmit} className="tape-form">
        <div className="tape-row">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            required
          />
        </div>
        <div className="tape-row">
          <label htmlFor="itemCode">Item Code</label>
          <select
            id="itemCode"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            required
            className="dropdown"
          >
            <option value="" disabled>Select item code</option>
            {itemCodes.map((code, index) => (
              <option key={index} value={code}>{code}</option>
            ))}
          </select>
        </div>
        {selectedItem && (
          <>
            <h3 className="tape-subheader">Available Colors and Quantities</h3>
            {Object.entries(selectedItem.stockByColor).map(([color, quantity]) => (
              <div key={color} className="tape-row">
                <label>{color}</label>
                <span className="available-quantity">{quantity}</span>
                <input
                  type="number"
                  value={tapedQuantities[color] || ''}
                  onChange={(e) => handleTapedQuantityChange(color, e.target.value)}
                  placeholder="Quantity to tape"
                  max={quantity}
                  min="0"
                />
              </div>
            ))}
          </>
        )}
        <div className="tape-row">
          <button type="submit" className="submit-button">Taped</button>
        </div>
      </form>
    </div>
  );
};

export default TapePage;
