import { ref, push, onValue, off, query, orderByChild } from 'firebase/database';
import { rtdb } from './firebase';
import { Message } from '../types';

// Activity chat — stored at messages/{activityId}
export function sendMessage(
  activityId: string,
  senderId: string,
  senderName: string,
  message: string
): Promise<void> {
  return push(ref(rtdb, `messages/${activityId}`), {
    activityId,
    senderId,
    senderName,
    message,
    timestamp: Date.now(),
  }).then(() => undefined);
}

export function subscribeToMessages(
  activityId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(ref(rtdb, `messages/${activityId}`), orderByChild('timestamp'));
  const listener = onValue(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((child) => {
      messages.push({ messageId: child.key!, ...child.val() } as Message);
    });
    callback(messages);
  });
  return () => off(q, 'value', listener);
}

// Pod chat — stored at podChats/{podId}/messages
export function sendPodMessage(
  podId: string,
  senderId: string,
  senderName: string,
  message: string
): Promise<void> {
  return push(ref(rtdb, `podChats/${podId}/messages`), {
    podId,
    senderId,
    senderName,
    message,
    timestamp: Date.now(),
  }).then(() => undefined);
}

export function subscribeToPodMessages(
  podId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(ref(rtdb, `podChats/${podId}/messages`), orderByChild('timestamp'));
  const listener = onValue(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((child) => {
      messages.push({ messageId: child.key!, ...child.val() } as Message);
    });
    callback(messages);
  });
  return () => off(q, 'value', listener);
}
