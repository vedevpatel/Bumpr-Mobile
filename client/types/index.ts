export type UserStatus = "open" | "busy";

export interface Interest {
  id: string;
  name: string;
  category: string;
}

export interface User {
  id: string;
  displayName: string;
  avatarPreset: number;
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
  rating: number;
  imageUri?: string;
}

export interface HandshakeRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: number;
  fromUserInterests: Interest[];
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
}

export interface SpaceSummary {
  title: string;
  description: string;
  activeCount: number;
  vibe: string;
  topInterests: string[];
}
