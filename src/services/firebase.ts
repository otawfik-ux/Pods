import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

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

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export default app;
