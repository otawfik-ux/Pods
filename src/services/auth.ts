import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';
import { getUniversityFromEmail } from '../constants/categories';

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const university = getUniversityFromEmail(email);
  const userData: User = {
    uid: credential.user.uid,
    displayName,
    email,
    university,
    joinDate: new Date().toISOString(),
    podsJoined: [],
    commendations: 0,
    postsCount: 0,
  };

  await setDoc(doc(db, 'users', credential.user.uid), userData);
  return userData;
}

export async function loginUser(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
  await setDoc(doc(db, 'users', uid), updates, { merge: true });
}
