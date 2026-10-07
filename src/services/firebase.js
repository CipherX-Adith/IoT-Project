// src/services/firebase.js - Firebase Realtime Database Client Connection
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, query, limitToLast, orderByChild } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId
  );
};

let app = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getDatabase(app);
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
  }
}

export { app, db };

/**
 * Realtime listener for the latest telemetry readings
 */
export function subscribeToReadings(callback, limit = 50) {
  if (!db) {
    return () => {};
  }

  try {
    const readingsRef = ref(db, 'readings');
    const recentQuery = query(readingsRef, limitToLast(limit));

    const unsubscribe = onValue(recentQuery, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = Object.entries(val).map(([id, item]) => ({
          id,
          ...item
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        callback(list);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Firebase readings subscription error:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up readings listener:', error);
    return () => {};
  }
}

/**
 * Realtime listener for node registrations and live status
 */
export function subscribeToNodes(callback) {
  if (!db) {
    return () => {};
  }

  try {
    const nodesRef = ref(db, 'nodes');
    const unsubscribe = onValue(nodesRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = Object.entries(val).map(([id, item]) => ({
          id,
          ...item
        }));
        callback(list);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Firebase nodes subscription error:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up nodes listener:', error);
    return () => {};
  }
}

/**
 * Realtime listener for UV threshold alerts
 */
export function subscribeToAlerts(callback, limit = 20) {
  if (!db) {
    return () => {};
  }

  try {
    const alertsRef = ref(db, 'alerts');
    const recentAlertsQuery = query(alertsRef, limitToLast(limit));

    const unsubscribe = onValue(recentAlertsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list = Object.entries(val).map(([id, item]) => ({
          id,
          ...item
        })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        callback(list);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Firebase alerts subscription error:', error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up alerts listener:', error);
    return () => {};
  }
}
