import React, { useState, useEffect, useCallback } from 'react';
import './FinishedPage.css';
import { getDocs, collection, query, where, writeBatch, doc } from 'firebase/firestore';
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

    // Fetch item codes from the Tapping collection
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
            console.log("Fetched item data:", itemData);

            // Aggregate stock by color
            Object.entries(itemData.tapedQuantities).forEach(([color, quantity]) => {
              const currentQuantity = aggregatedStockByColor[color] || 0;
              aggregatedStockByColor[color] = currentQuantity + (typeof quantity === 'string' ? parseInt(quantity, 10) : quantity);
            });

            console.log("Aggregated Stock by Color:", aggregatedStockByColor);

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
      // Create a batch instance
      const batch = writeBatch(db);

      // Fetch all Tapping documents for the given item code
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

            // Keep track of total subtracted quantities
            totalSubtracted[color] = (totalSubtracted[color] || 0) + subtractQuantity;
          });

          // Update the Tapping document in the batch
          batch.update(tappingRef, { tapedQuantities: updatedItemTapedQuantities });
        });

        // Check if a Finished document already exists for this itemCode and date
        const finishedQuery = query(
          collection(db, "Finished"),
          where("itemCode", "==", itemCode),
          where("date", "==", currentDate)
        );
        const finishedSnapshot = await getDocs(finishedQuery);

        let finishedRef;
        let existingFinishedQuantities = {};

        if (!finishedSnapshot.empty) {
          // Update existing Finished document
          finishedRef = finishedSnapshot.docs[0].ref;
          existingFinishedQuantities = finishedSnapshot.docs[0].data().finishedQuantities || {};
        } else {
          // Create new Finished document
          finishedRef = doc(collection(db, "Finished"));
        }

        // Merge existing and new finished quantities
        const mergedFinishedQuantities = { ...existingFinishedQuantities };
        Object.entries(totalSubtracted).forEach(([color, quantity]) => {
          mergedFinishedQuantities[color] = (parseInt(mergedFinishedQuantities[color], 10) || 0) + quantity;
        });

        // Prepare finished data
        const finishedData = {
          date: currentDate,
          itemCode: itemCode,
          finishedQuantities: mergedFinishedQuantities,
        };

        // Set or update the Finished document in the batch
        batch.set(finishedRef, finishedData, { merge: true });

        // Commit the batch
        await batch.commit();

        console.log('Stock updated in Tapping and Finished');
        setItemCode('');
        setSelectedItem(null);
        setFinishedQuantities({});
        setFeedbackMessage("Stock moved to finished and updated successfully!");

        // Hide the feedback message after 2 seconds
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
