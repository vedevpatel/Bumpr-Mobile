import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User, UserStatus, Interest } from "@/types";

const STORAGE_KEYS = {
  USER: "@bumpr/user",
  ONBOARDING_COMPLETE: "@bumpr/onboarding_complete",
  PRIVACY_SETTINGS: "@bumpr/privacy_settings",
} as const;

const DEFAULT_USER: User = {
  id: "current-user",
  displayName: "You",
  avatarPreset: 1,
  status: "open",
  interests: [],
  reputation: 50,
  isVerified: false,
  bio: "",
};

export const storage = {
  async getUser(): Promise<User> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (data) {
        return JSON.parse(data);
      }
      await this.saveUser(DEFAULT_USER);
      return DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
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
      user.status = status;
      await this.saveUser(user);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  },

  async updateInterests(interests: Interest[]): Promise<void> {
    try {
      const user = await this.getUser();
      user.interests = interests;
      await this.saveUser(user);
    } catch (error) {
      console.error("Failed to update interests:", error);
    }
  },

  async updateDisplayName(displayName: string): Promise<void> {
    try {
      const user = await this.getUser();
      user.displayName = displayName;
      await this.saveUser(user);
    } catch (error) {
      console.error("Failed to update display name:", error);
    }
  },

  async updateBio(bio: string): Promise<void> {
    try {
      const user = await this.getUser();
      user.bio = bio;
      await this.saveUser(user);
    } catch (error) {
      console.error("Failed to update bio:", error);
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

  async getPrivacySettings(): Promise<{
    showOnMap: boolean;
    showDistance: boolean;
    showInterests: boolean;
    allowHandshakes: boolean;
  }> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
      return {
        showOnMap: true,
        showDistance: true,
        showInterests: true,
        allowHandshakes: true,
      };
    } catch {
      return {
        showOnMap: true,
        showDistance: true,
        showInterests: true,
        allowHandshakes: true,
      };
    }
  },

  async savePrivacySettings(settings: {
    showOnMap: boolean;
    showDistance: boolean;
    showInterests: boolean;
    allowHandshakes: boolean;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save privacy settings:", error);
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
