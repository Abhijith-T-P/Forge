import React, { useState, useEffect, useCallback } from 'react';
import './FinishedPage.css';
import { getDocs, collection, query, where, writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';

const FinishedPage = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [finishedQuantities, setFinishedQuantities] = useState({});
  const [itemCodes, setItemCodes] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    const today = new Date();
    setCurrentDate(today.toISOString().split('T')[0]);

    const fetchItemCodes = async () => {
      try {
        const tappingSnapshot = await getDocs(collection(db, 'Tapping'));
        const codes = tappingSnapshot.docs.map(doc => doc.data().itemCode);
        const uniqueCodes = [...new Set(codes)];
        const sortedCodes = uniqueCodes.sort((a, b) => a.localeCompare(b));
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
      const tappingCollection = collection(db, "Tapping");
      const q = query(tappingCollection, where("itemCode", "==", itemCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const aggregatedStockByColor = {};

        querySnapshot.forEach((doc) => {
          const itemData = doc.data();

          if (itemData.tapedQuantities && typeof itemData.tapedQuantities === 'object') {
            Object.entries(itemData.tapedQuantities).forEach(([color, quantity]) => {
              const currentQuantity = aggregatedStockByColor[color] || 0;
              aggregatedStockByColor[color] = currentQuantity + (typeof quantity === 'string' ? parseInt(quantity, 10) : quantity);
            });

            setSelectedItem({
              ...itemData,
              tapedQuantities: aggregatedStockByColor
            });
            setFinishedQuantities({});
          } else {
            console.warn("`tapedQuantities` is not available or not an object.");
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

  const handleFinishedQuantityChange = (color, quantity) => {
    setFinishedQuantities(prev => ({ ...prev, [color]: quantity }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      const batch = writeBatch(db);

      const tappingQuery = query(collection(db, "Tapping"), where("itemCode", "==", itemCode));
      const tappingSnapshot = await getDocs(tappingQuery);

      if (!tappingSnapshot.empty) {
        let totalSubtracted = {};

        tappingSnapshot.docs.forEach((doc) => {
          const tappingRef = doc.ref;
          const itemData = doc.data();
          const currentTapedQuantities = itemData.tapedQuantities || {};

          const updatedItemTapedQuantities = { ...currentTapedQuantities };
          Object.entries(finishedQuantities).forEach(([color, quantity]) => {
            const currentQuantity = parseInt(updatedItemTapedQuantities[color], 10) || 0;
            const subtractQuantity = Math.min(currentQuantity, parseInt(quantity, 10));
            updatedItemTapedQuantities[color] = Math.max(currentQuantity - subtractQuantity, 0);

            totalSubtracted[color] = (totalSubtracted[color] || 0) + subtractQuantity;
          });

          batch.update(tappingRef, { tapedQuantities: updatedItemTapedQuantities });
        });

        // Use itemCode as the document ID for the Finished collection
        const finishedRef = doc(db, "Finished", itemCode);
        const finishedDoc = await getDoc(finishedRef);
        
        let existingFinishedQuantities = {};
        if (finishedDoc.exists()) {
          existingFinishedQuantities = finishedDoc.data().finishedQuantities || {};
        }

        const mergedFinishedQuantities = { ...existingFinishedQuantities };
        Object.entries(totalSubtracted).forEach(([color, quantity]) => {
          mergedFinishedQuantities[color] = (parseInt(mergedFinishedQuantities[color], 10) || 0) + quantity;
        });

        const finishedData = {
          itemCode: itemCode,
          finishedQuantities: mergedFinishedQuantities,
          lastUpdated: currentDate,
        };

        batch.set(finishedRef, finishedData, { merge: true });

        await batch.commit();

        console.log('Stock updated in Tapping and Finished');
        setItemCode('');
        setSelectedItem(null);
        setFinishedQuantities({});
        setFeedbackMessage("Stock moved to finished and updated successfully!");

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
    <div className="finished-page-container">
      <h2 className="finished-header">Move Stock to Finished</h2>
      <form onSubmit={handleSubmit} className="finished-form">
        <div className="finished-row">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            required
          />
        </div>
        <div className="finished-row">
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
            <h3 className="finished-subheader">Available Colors and Quantities</h3>
            {Object.entries(selectedItem.tapedQuantities).map(([color, quantity]) => (
              <div key={color} className="finished-row">
                <label>{color}</label>
                <span className="available-quantity">{quantity}</span>
                <input
                  type="number"
                  value={finishedQuantities[color] || ''}
                  onChange={(e) => handleFinishedQuantityChange(color, e.target.value)}
                  placeholder="Quantity to finish"
                  max={quantity}
                  min="0"
                />
              </div>
            ))}
          </>
        )}
        <div className="finished-row">
          <button type="submit" className="submit-button">Finished</button>
        </div>
      </form>
      {feedbackMessage && (
        <div className="feedback-message">{feedbackMessage}</div>
      )}
    </div>
  );
};

export default FinishedPage;