import { initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyDeGVbMjEk06vLDuNGmv-z4OJjpFJ4kqDw',
  authDomain: 'pods-e7fb0.firebaseapp.com',
  projectId: 'pods-e7fb0',
  storageBucket: 'pods-e7fb0.firebasestorage.app',
  messagingSenderId: '789911574374',
  appId: '1:789911574374:web:246fad73859d798e535aa7',
  databaseURL: 'https://pods-e7fb0-default-rtdb.firebaseio.com',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const reactNativeAuth = require('@firebase/auth') as {
  getReactNativePersistence?: (storage: typeof AsyncStorage) => unknown;
  initializeAuth?: (firebaseApp: typeof app, deps?: { persistence: unknown }) => Auth;
};

export const auth = (() => {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    if (!reactNativeAuth.initializeAuth || !reactNativeAuth.getReactNativePersistence) {
      return getAuth(app);
    }

    return reactNativeAuth.initializeAuth(app, {
      persistence: reactNativeAuth.getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
