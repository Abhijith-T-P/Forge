import React, { useState, useEffect, useCallback } from 'react';
import './TapePage.css';
import { getDocs, collection, query, where, writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

const TapePage = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [tapedQuantities, setTapedQuantities] = useState({});
  const [itemCodes, setItemCodes] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toISOString().split('T')[0]);

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
            Object.entries(itemData.stockByColor).forEach(([color, quantity]) => {
              const currentQuantity = aggregatedStockByColor[color] || 0;
              aggregatedStockByColor[color] = currentQuantity + (typeof quantity === 'string' ? parseInt(quantity, 10) : quantity);
            });

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
      const batch = writeBatch(db);

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

          batch.update(cuttingRef, { stockByColor: updatedItemStockByColor });
        });

        // Use itemCode as the document ID for the Tapping collection
        const tappingRef = doc(db, "Tapping", itemCode);
        const tappingDoc = await getDoc(tappingRef);
        
        let existingTapedQuantities = {};
        if (tappingDoc.exists()) {
          existingTapedQuantities = tappingDoc.data().tapedQuantities || {};
        }

        const mergedTapedQuantities = { ...existingTapedQuantities };
        Object.entries(tapedQuantities).forEach(([color, quantity]) => {
          mergedTapedQuantities[color] = (parseInt(mergedTapedQuantities[color], 10) || 0) + parseInt(quantity, 10);
        });

        const tappingData = {
          itemCode: itemCode,
          tapedQuantities: mergedTapedQuantities,
          lastUpdated: currentDate,
        };

        batch.set(tappingRef, tappingData, { merge: true });

        await batch.commit();

        console.log('Stock updated in Cutting and Tapping');
        setItemCode('');
        setSelectedItem(null);
        setTapedQuantities({});
        setFeedbackMessage("Stock moved to tape and updated successfully!");

        setTimeout(() => {
          setFeedbackMessage('');
        }, 2000);
      } else {
        console.error("No matching document found for update");
        setFeedbackMessage("Error updating stock. Document not found.");
        setTimeout(() => {
          setFeedbackMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing data:', error);
      setFeedbackMessage("Error processing data. Please try again.");
      setTimeout(() => {
        setFeedbackMessage('');
      }, 2000);
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
      {feedbackMessage && (
        <div className={`feedback-message ${feedbackMessage ? '' : 'fade-out'}`}>
          {feedbackMessage}
        </div>
      )}
    </div>
  );
};

export default TapePage;