import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { Pod, PodCategory } from '../types';

export async function createPod(
  data: Omit<Pod, 'podId' | 'createdAt' | 'memberCount' | 'members' | 'admins'>,
  userId: string
): Promise<string> {
  const ref = await addDoc(collection(db, 'pods'), {
    ...data,
    createdBy: userId,
    createdAt: new Date().toISOString(),
    memberCount: 1,
    members: [userId],
    admins: [userId],
  });
  await updateDoc(ref, { podId: ref.id });

  // Add pod to user's joined list
  await updateDoc(doc(db, 'users', userId), {
    podsJoined: arrayUnion(ref.id),
  });

  return ref.id;
}

export async function getPod(podId: string): Promise<Pod | null> {
  const snap = await getDoc(doc(db, 'pods', podId));
  return snap.exists() ? (snap.data() as Pod) : null;
}

export async function getPublicPods(): Promise<Pod[]> {
  const q = query(
    collection(db, 'pods'),
    where('visibility', '==', 'public')
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as Pod)
    .sort((a, b) => b.memberCount - a.memberCount);
}

export async function getUserPods(podIds: string[]): Promise<Pod[]> {
  if (podIds.length === 0) return [];
  const pods: Pod[] = [];
  for (const id of podIds) {
    const p = await getPod(id);
    if (p) pods.push(p);
  }
  return pods;
}

export async function joinPod(podId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'pods', podId), {
    members: arrayUnion(userId),
    memberCount: (await getDoc(doc(db, 'pods', podId))).data()!.memberCount + 1,
  });
  await updateDoc(doc(db, 'users', userId), {
    podsJoined: arrayUnion(podId),
  });
}

export async function leavePod(podId: string, userId: string): Promise<void> {
  const podSnap = await getDoc(doc(db, 'pods', podId));
  const current = podSnap.data()?.memberCount ?? 1;
  await updateDoc(doc(db, 'pods', podId), {
    members: arrayRemove(userId),
    admins: arrayRemove(userId),
    memberCount: Math.max(0, current - 1),
  });
  await updateDoc(doc(db, 'users', userId), {
    podsJoined: arrayRemove(podId),
  });
}

export async function searchPods(searchTerm: string): Promise<Pod[]> {
  const all = await getPublicPods();
  const term = searchTerm.toLowerCase();
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
  );
}
