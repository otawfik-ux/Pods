import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Activity } from '../types';

export async function createActivity(
  data: Omit<Activity, 'activityId' | 'currentParticipants' | 'participants' | 'pendingRequests' | 'status'>,
  userId: string
): Promise<string> {
  const ref = await addDoc(collection(db, 'activities'), {
    ...data,
    hostId: userId,
    currentParticipants: 1,
    participants: [userId],
    pendingRequests: [],
    status: 'active',
  });
  await updateDoc(ref, { activityId: ref.id });

  // Update host's postsCount
  await updateDoc(doc(db, 'users', userId), {
    postsCount: (await getDoc(doc(db, 'users', userId))).data()!.postsCount + 1,
  });

  return ref.id;
}

export async function getActivity(activityId: string): Promise<Activity | null> {
  const snap = await getDoc(doc(db, 'activities', activityId));
  if (!snap.exists()) return null;
  const data = snap.data() as Activity;
  // Auto-expire check
  if (data.status === 'active' && new Date(data.expiresAt) < new Date()) {
    await updateDoc(doc(db, 'activities', activityId), { status: 'expired' });
    data.status = 'expired';
  }
  return data;
}

export async function getActivitiesForPod(podId: string): Promise<Activity[]> {
  const q = query(
    collection(db, 'activities'),
    where('podId', '==', podId)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as Activity)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

export async function getActivitiesForPods(podIds: string[]): Promise<Activity[]> {
  if (podIds.length === 0) return [];
  const activities: Activity[] = [];
  for (const podId of podIds) {
    const podActivities = await getActivitiesForPod(podId);
    activities.push(...podActivities);
  }
  return activities.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

export async function requestJoinActivity(activityId: string, userId: string): Promise<void> {
  const activity = await getActivity(activityId);
  if (!activity) throw new Error('Activity not found');

  if (activity.autoApprove) {
    await approveJoinRequest(activityId, userId);
    return;
  }

  await updateDoc(doc(db, 'activities', activityId), {
    pendingRequests: arrayUnion(userId),
  });
}

export async function approveJoinRequest(activityId: string, userId: string): Promise<void> {
  const activity = await getActivity(activityId);
  if (!activity) throw new Error('Activity not found');

  if (activity.currentParticipants >= activity.maxParticipants) {
    throw new Error('Activity is full');
  }

  await updateDoc(doc(db, 'activities', activityId), {
    participants: arrayUnion(userId),
    pendingRequests: arrayRemove(userId),
    currentParticipants: activity.currentParticipants + 1,
  });
}

export async function rejectJoinRequest(activityId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'activities', activityId), {
    pendingRequests: arrayRemove(userId),
  });
}

export async function leaveActivity(activityId: string, userId: string): Promise<void> {
  const activity = await getActivity(activityId);
  if (!activity) return;

  await updateDoc(doc(db, 'activities', activityId), {
    participants: arrayRemove(userId),
    currentParticipants: Math.max(0, activity.currentParticipants - 1),
  });
}
