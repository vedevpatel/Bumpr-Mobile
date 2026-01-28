import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User, UserStatus, NearbyUser, ARMoment, HandshakeRequest, Interest } from "@/types";
import { CURRENT_USER, NEARBY_USERS, AR_MOMENTS, HANDSHAKE_REQUESTS, INTERESTS } from "@/data/mockData";

const STORAGE_KEYS = {
  USER: "@bumpr/user",
  STATUS: "@bumpr/status",
  INTERESTS: "@bumpr/interests",
  HANDSHAKES: "@bumpr/handshakes",
  CONNECTIONS: "@bumpr/connections",
  ONBOARDING_COMPLETE: "@bumpr/onboarding_complete",
} as const;

export const storage = {
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (data) {
        return JSON.parse(data);
      }
      return CURRENT_USER;
    } catch {
      return CURRENT_USER;
    }
  },

  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  },

  async updateStatus(status: UserStatus): Promise<void> {
    try {
      const user = await this.getUser();
      if (user) {
        user.status = status;
        await this.saveUser(user);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  },

  async getHandshakeRequests(): Promise<HandshakeRequest[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HANDSHAKES);
      if (data) {
        return JSON.parse(data);
      }
      return HANDSHAKE_REQUESTS;
    } catch {
      return HANDSHAKE_REQUESTS;
    }
  },

  async saveHandshakeRequests(requests: HandshakeRequest[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HANDSHAKES, JSON.stringify(requests));
    } catch (error) {
      console.error("Failed to save handshake requests:", error);
    }
  },

  async acceptHandshake(requestId: string): Promise<void> {
    try {
      const requests = await this.getHandshakeRequests();
      const updated = requests.filter((r) => r.id !== requestId);
      await this.saveHandshakeRequests(updated);

      const connections = await this.getConnections();
      const request = requests.find((r) => r.id === requestId);
      if (request) {
        connections.push(request.fromUserId);
        await AsyncStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
      }
    } catch (error) {
      console.error("Failed to accept handshake:", error);
    }
  },

  async declineHandshake(requestId: string): Promise<void> {
    try {
      const requests = await this.getHandshakeRequests();
      const updated = requests.filter((r) => r.id !== requestId);
      await this.saveHandshakeRequests(updated);
    } catch (error) {
      console.error("Failed to decline handshake:", error);
    }
  },

  async getConnections(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CONNECTIONS);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch {
      return [];
    }
  },

  async addConnection(userId: string): Promise<void> {
    try {
      const connections = await this.getConnections();
      if (!connections.includes(userId)) {
        connections.push(userId);
        await AsyncStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections));
      }
    } catch (error) {
      console.error("Failed to add connection:", error);
    }
  },

  async isConnected(userId: string): Promise<boolean> {
    try {
      const connections = await this.getConnections();
      return connections.includes(userId);
    } catch {
      return false;
    }
  },

  async updateInterests(interests: Interest[]): Promise<void> {
    try {
      const user = await this.getUser();
      if (user) {
        user.interests = interests;
        await this.saveUser(user);
      }
    } catch (error) {
      console.error("Failed to update interests:", error);
    }
  },

  async isOnboardingComplete(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      return data === "true";
    } catch {
      return false;
    }
  },

  async completeOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, "true");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  },
};
