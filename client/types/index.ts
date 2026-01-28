export type UserStatus = "open" | "busy" | "invisible";

export interface Interest {
  id: string;
  name: string;
  category?: string;
  icon?: string;
}

export interface User {
  id: string;
  displayName: string;
  avatarPreset: number;
  avatarUrl?: string;
  status: UserStatus;
  interests: Interest[];
  reputation: number;
  isVerified: boolean;
  bio?: string;
}

export interface NearbyUser {
  id: string;
  displayName: string;
  avatarPreset: number;
  status: UserStatus;
  interests: Interest[];
  reputation: number;
  distanceBand: "close" | "near" | "far";
  sharedInterests: string[];
  hasHandshake: boolean;
}

export interface Moment {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: number;
  creatorReputation?: number;
  videoUri: string;
  thumbnailUri?: string;
  location: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  createdAt: string;
  expiresAt: string;
  duration: number; // 5-15 seconds per spec
  visibilityRadius: number; // meters, default 50 per spec
  views: number;
  completions: number;
  engagement: number;
}

export interface ARMoment {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: number;
  creatorReputation: number;
  thumbnailUri: string;
  videoUri?: string;
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  createdAt: Date;
  expiresAt: Date;
  watchCount: number;
  engagementScore: number;
  duration: number;
}

export interface Venue {
  id: string;
  name: string;
  category: string;
  distance: string;
  aiSummary: string;
  activeUsers: number;
  rating?: string | number;
  imageUri?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface HandshakeRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: number;
  fromUserInterests: Interest[];
  status: "pending" | "accepted" | "declined" | "expired";
  createdAt: Date;
}

export interface SpaceSummary {
  title: string;
  description: string;
  activeCount: number;
  vibe: string;
  topInterests: string[];
}

export interface Notification {
  id: string;
  type: "handshake" | "moment" | "nearby" | "system";
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, any>;
}

export type ThemeMode = "light" | "dark" | "system";
