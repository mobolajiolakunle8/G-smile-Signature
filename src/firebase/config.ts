import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getDatabase, type Database } from "firebase/database";

const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyBvgsBOliVG9JnY4KBJH6sQE-8QPCeGKPU",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "g-smile-signature.firebaseapp.com",
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || "https://g-smile-signature-default-rtdb.firebaseio.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "g-smile-signature",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "g-smile-signature.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "152769829580",
  appId: env.VITE_FIREBASE_APP_ID || "1:152769829580:web:89fd1af0100fd4daccc069",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZTKJ1LQWEE",
};

function isConfigured(config: typeof firebaseConfig) {
  return (
    config.apiKey &&
    config.apiKey !== "YOUR_API_KEY" &&
    config.databaseURL &&
    !config.databaseURL.includes("your-app")
  );
}

export const firebaseEnabled = isConfigured(firebaseConfig);

let database: Database | null = null;
let analytics: Analytics | null = null;

if (firebaseEnabled) {
  try {
    const app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    isSupported()
      .then((supported) => {
        if (supported) analytics = getAnalytics(app);
      })
      .catch(() => {
        analytics = null;
      });
  } catch (err) {
    console.warn("Firebase initialization failed:", err);
  }
}

export { analytics, database };
