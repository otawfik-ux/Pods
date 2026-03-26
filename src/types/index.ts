export interface User {
  uid: string;
  displayName: string;
  email: string;
  university: string;
  profilePhoto?: string;
  bio?: string;
  joinDate: string;
  podsJoined: string[];
  commendations: number;
  postsCount: number;
}

export interface Pod {
  podId: string;
  name: string;
  description: string;
  category: PodCategory;
  createdBy: string;
  createdAt: string;
  memberCount: number;
  visibility: 'public' | 'private';
  members: string[];
  admins: string[];
  bannerColor: string;
}

export interface Activity {
  activityId: string;
  podId: string;
  hostId: string;
  hostName: string;
  title: string;
  category: ActivityCategory;
  tags: string[];
  startTime: string;
  expiresAt: string;
  maxParticipants: number;
  currentParticipants: number;
  participants: string[];
  pendingRequests: string[];
  status: 'active' | 'expired';
  visibility: 'pod' | 'university';
  autoApprove: boolean;
}

export interface Message {
  messageId: string;
  activityId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}

export interface ChatRoom {
  activityId: string;
  activityTitle: string;
  expiresAt: string;
  lastMessage?: string;
  lastMessageTime?: number;
  memberCount: number;
}

export type PodCategory = 'Sports' | 'Study' | 'Social' | 'Food' | 'Gaming' | 'Other';
export type ActivityCategory = 'Study' | 'Gym' | 'Social' | 'Sports' | 'Food' | 'Other';

// Navigation param lists
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Register: undefined;
  Login: undefined;
};

export type MainTabParamList = {
  Discover: undefined;
  MyPods: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type DiscoverStackParamList = {
  DiscoverFeed: undefined;
  ActivityDetail: { activityId: string };
  CreateActivity: { podId?: string };
  JoinRequests: { activityId: string; activityTitle: string };
  PodDiscovery: undefined;
  PodDetail: { podId: string };
};

export type PodsStackParamList = {
  MyPods: undefined;
  PodDiscovery: undefined;
  CreatePod: undefined;
  PodDetail: { podId: string };
  CreateActivity: { podId?: string };
  ActivityDetail: { activityId: string };
  JoinRequests: { activityId: string; activityTitle: string };
};

export type MessagesStackParamList = {
  MessagesList: undefined;
  Chat: { activityId: string; activityTitle: string; expiresAt: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  JoinRequests: { activityId: string; activityTitle: string };
};
