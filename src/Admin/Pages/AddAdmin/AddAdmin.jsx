import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import './AddAdmin.css';

const AddAdmin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [admins, setAdmins] = useState([]);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const adminCollection = collection(db, 'Admins');
    const adminSnapshot = await getDocs(adminCollection);
    const adminList = adminSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAdmins(adminList);
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    if (username && password) {
      try {
        await addDoc(collection(db, 'Admins'), { username, password });
        setUsername('');
        setPassword('');
        fetchAdmins();
      } catch (error) {
        console.error("Error adding admin: ", error);
      }
    }
  };

  const resetPassword = async (id) => {
    if (newPassword) {
      const adminRef = doc(db, 'Admins', id);
      await updateDoc(adminRef, { password: newPassword });
      setNewPassword('');
      fetchAdmins();
    }
  };

  const deleteAdmin = async (id) => {
    try {
      await deleteDoc(doc(db, 'Admins', id));
      fetchAdmins();
    } catch (error) {
      console.error("Error deleting admin: ", error);
    }
  };

  return (
    <div className="add-admin-container">
      <h2>Add Admin</h2>
      <form onSubmit={addAdmin} className="admin-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Add Admin</button>
      </form>
      <h3>Admin List</h3>
      <ul className="admin-list">
        {admins.map(admin => (
          <li key={admin.id} className="admin-item">
            <span>{admin.username}</span>
            <div>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button onClick={() => resetPassword(admin.id)}>Reset Password</button>
              {admins.length > 1 && (
                <button onClick={() => deleteAdmin(admin.id)} className="delete-button">Delete</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddAdmin;
