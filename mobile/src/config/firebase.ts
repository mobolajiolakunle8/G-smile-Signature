import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

/**
 * Uses the SAME Firebase project as the G-Smile Signature website,
 * so products, orders, customers, and settings stay in sync
 * between the website and the mobile app in real time.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBvgsBOliVG9JnY4KBJH6sQE-8QPCeGKPU",
  authDomain: "g-smile-signature.firebaseapp.com",
  databaseURL: "https://g-smile-signature-default-rtdb.firebaseio.com",
  projectId: "g-smile-signature",
  storageBucket: "g-smile-signature.firebasestorage.app",
  messagingSenderId: "152769829580",
  appId: "1:152769829580:web:89fd1af0100fd4daccc069",
};

export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

export const DB_PATH = "gsmile_signature";
