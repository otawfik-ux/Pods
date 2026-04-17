import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';
import { getUniversityFromEmail } from '../constants/categories';

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return error.message || 'Something went wrong. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  try {
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
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function loginUser(email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
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
