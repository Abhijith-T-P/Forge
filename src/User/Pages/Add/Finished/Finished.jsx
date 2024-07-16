import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import './Finished.css';

const Finished = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'Tapped'));
      const fetchedItems = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ ...doc.data(), id: doc.id });
      });
      setItems(fetchedItems);
    };
    fetchItems();
  }, []);

  const handleMoveToStock = async (item) => {
    const tappedColors = item.tappedByColor || {};
    let updatedTappedByColor = { ...item.tappedByColor };
    let finishedData = {};

    Object.keys(tappedColors).forEach((color) => {
      const quantityToMove = Number(tappedColors[color] || 0);
      if (quantityToMove > 0) {
        finishedData[color] = quantityToMove;
        updatedTappedByColor[color] -= quantityToMove;
      }
    });

    // Remove colors with zero quantity
    Object.keys(updatedTappedByColor).forEach((color) => {
      if (updatedTappedByColor[color] === 0) {
        delete updatedTappedByColor[color];
      }
    });

    // Add new entry to 'Finished' collection
    await addDoc(collection(db, 'Stock'), {
      itemCode: item.itemCode,
      itemName: item.itemName,
      finishedByColor: finishedData,
      timestamp: new Date()
    });

    const itemRef = doc(db, 'Tapped', item.id);

    if (Object.keys(updatedTappedByColor).length === 0) {
      // Delete the entire item if all colors are zero
      await deleteDoc(itemRef);
    } else {
      // Update the item with the new tapped quantities
      await updateDoc(itemRef, { tappedByColor: updatedTappedByColor });
    }

    // Update state to reflect changes
    setItems((prevItems) =>
      prevItems.filter((prevItem) => prevItem.id !== item.id)
    );
  };

  return (
    <div className="finished-container">
      <h2>Finished Items</h2>
      <div className="item-list">
        {items.map((item) => (
          <div key={item.itemCode} className="item">
            <p>Item Code: {item.itemCode}</p>
            <p>Item Name: {item.itemName}</p>
            {Object.keys(item.tappedByColor).map((color) => (
              <div key={color} className="color-stock">
                <p>{color}: {item.tappedByColor[color]}</p>
              </div>
            ))}
            <button onClick={() => handleMoveToStock(item)}>Move to Stock</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Finished;
