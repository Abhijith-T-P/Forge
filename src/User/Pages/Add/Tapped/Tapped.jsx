import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import './Tapped.css';

const Tapped = () => {
  const [items, setItems] = useState([]);
  const [tappedQuantities, setTappedQuantities] = useState({});

  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, 'Cutting'));
      const fetchedItems = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ ...doc.data(), id: doc.id });
      });
      setItems(fetchedItems);
    };
    fetchItems();
  }, []);

  const handleTappedQuantityChange = (itemCode, color, value) => {
    setTappedQuantities({
      ...tappedQuantities,
      [itemCode]: {
        ...tappedQuantities[itemCode],
        [color]: value,
      },
    });
  };

  const handleTapItems = async (item) => {
    const tappedColors = tappedQuantities[item.itemCode] || {};
    let updatedStockByColor = { ...item.stockByColor };
    let tappedData = {};

    // Deduct tapped quantities from stockByColor
    Object.keys(tappedColors).forEach((color) => {
      const quantityToTap = Number(tappedColors[color] || 0);
      if (quantityToTap > 0 && quantityToTap <= updatedStockByColor[color]) {
        updatedStockByColor[color] -= quantityToTap;
        tappedData[color] = quantityToTap;
      }
    });

    // Remove colors with zero quantity
    Object.keys(updatedStockByColor).forEach((color) => {
      if (updatedStockByColor[color] === 0) {
        delete updatedStockByColor[color];
      }
    });

    const itemRef = doc(db, 'Cutting', item.id);

    if (Object.keys(updatedStockByColor).length === 0) {
      // Delete the entire item if all colors are zero
      await deleteDoc(itemRef);
    } else {
      // Update the item with the new stock quantities
      await updateDoc(itemRef, { stockByColor: updatedStockByColor });
    }

    // Add new entry to 'Tapped' collection
    await addDoc(collection(db, 'Tapped'), {
      itemCode: item.itemCode,
      itemName: item.itemName,
      tappedByColor: tappedData,
      timestamp: new Date()
    });

    // Update state to reflect changes
    setItems((prevItems) =>
      prevItems.filter((prevItem) => prevItem.itemCode !== item.itemCode)
    );
    setTappedQuantities({ ...tappedQuantities, [item.itemCode]: {} });
    window.location.reload()
  };

  return (
    <div className="tapped-container">
      <h2>Tapped Items</h2>
      <div className="item-list">
        {items.map((item) => (
          <div key={item.itemCode} className="item">
            <p>Item Code: {item.itemCode}</p>
            <p>Item Name: {item.itemName}</p>
            {Object.keys(item.stockByColor).map((color) => (
              <div key={color} className="color-stock">
                <p>{color}: {item.stockByColor[color]}</p>
                <input
                  type="number"
                  placeholder={`Enter quantity to tap for ${color}`}
                  value={(tappedQuantities[item.itemCode] && tappedQuantities[item.itemCode][color]) || ''}
                  onChange={(e) => handleTappedQuantityChange(item.itemCode, color, e.target.value)}
                  max={item.stockByColor[color]} // Set max value based on available stock
                />
              </div>
            ))}
            <button onClick={() => handleTapItems(item)}> Item tapped</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tapped;