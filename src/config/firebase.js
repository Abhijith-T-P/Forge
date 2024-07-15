import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: "AIzaSyBMRV515DsKNeF3LSibl_jmACUI2DwEA7I",
    authDomain: "supplycraft-3673c.firebaseapp.com",
    projectId: "supplycraft-3673c",
    storageBucket: "supplycraft-3673c.appspot.com",
    messagingSenderId: "479305029690",
    appId: "1:479305029690:web:bacfc9598b8b9e1d4c7d03",
    measurementId: "G-Y8ZVDYN044"
  };
  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)