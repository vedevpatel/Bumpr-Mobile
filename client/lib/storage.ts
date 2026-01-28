import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User, UserStatus, Interest, Moment } from "@/types";

const STORAGE_KEYS = {
  USER: "@bumpr/user",
  ONBOARDING_COMPLETE: "@bumpr/onboarding_complete",
  PRIVACY_SETTINGS: "@bumpr/privacy_settings",
  THEME_MODE: "@bumpr/theme_mode",
  NOTIFICATIONS_ENABLED: "@bumpr/notifications_enabled",
  MOMENTS: "@bumpr/moments",
  INTERACTIONS: "@bumpr/interactions",
  REPUTATION_DATA: "@bumpr/reputation_data",
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

export interface ReputationData {
  baseScore: number;
  verifiedInteractions: number;
  positiveRatings: number;
  negativeRatings: number;
  uniqueContexts: string[];
  lastUpdated: string;
  ratingHistory: RatingEntry[];
}

export interface RatingEntry {
  id: string;
  fromUserId: string;
  fromUserReputation: number;
  rating: number;
  context: string;
  timestamp: string;
}

export interface Interaction {
  id: string;
  userId: string;
  type: "handshake" | "moment_view" | "rating";
  timestamp: string;
  location?: { lat: number; lng: number };
  outcome?: "positive" | "negative" | "neutral";
}

const DEFAULT_REPUTATION: ReputationData = {
  baseScore: 50,
  verifiedInteractions: 0,
  positiveRatings: 0,
  negativeRatings: 0,
  uniqueContexts: [],
  lastUpdated: new Date().toISOString(),
  ratingHistory: [],
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

  async getThemeMode(): Promise<"light" | "dark" | "system"> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (data === "light" || data === "dark" || data === "system") {
        return data;
      }
      return "system";
    } catch {
      return "system";
    }
  },

  async setThemeMode(mode: "light" | "dark" | "system"): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch (error) {
      console.error("Failed to set theme mode:", error);
    }
  },

  async getNotificationsEnabled(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
      return data !== "false";
    } catch {
      return true;
    }
  },

  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled.toString());
    } catch (error) {
      console.error("Failed to set notifications:", error);
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

  // Moments
  async getMoments(): Promise<Moment[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MOMENTS);
      if (data) {
        const moments: Moment[] = JSON.parse(data);
        const now = Date.now();
        // Filter out expired moments
        return moments.filter(m => new Date(m.expiresAt).getTime() > now);
      }
      return [];
    } catch {
      return [];
    }
  },

  async saveMoment(moment: Moment): Promise<void> {
    try {
      const moments = await this.getMoments();
      moments.push(moment);
      await AsyncStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(moments));
    } catch (error) {
      console.error("Failed to save moment:", error);
    }
  },

  async deleteMoment(momentId: string): Promise<void> {
    try {
      const moments = await this.getMoments();
      const filtered = moments.filter(m => m.id !== momentId);
      await AsyncStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to delete moment:", error);
    }
  },

  // Reputation System
  async getReputationData(): Promise<ReputationData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REPUTATION_DATA);
      if (data) {
        return JSON.parse(data);
      }
      return DEFAULT_REPUTATION;
    } catch {
      return DEFAULT_REPUTATION;
    }
  },

  async saveReputationData(data: ReputationData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REPUTATION_DATA, JSON.stringify(data));
      // Update user reputation score
      const user = await this.getUser();
      user.reputation = this.calculateReputationScore(data);
      await this.saveUser(user);
    } catch (error) {
      console.error("Failed to save reputation data:", error);
    }
  },

  calculateReputationScore(data: ReputationData): number {
    // Clique Reputation Algorithm per spec:
    // - Verified proximity interactions
    // - Consistent positive feedback
    // - Diversity of interaction contexts
    // - Rater credibility (weighted by rater's own reputation)
    // - Behavioral stability

    let score = data.baseScore;

    // Factor 1: Verified interactions (up to +20 points)
    const interactionBonus = Math.min(data.verifiedInteractions * 2, 20);
    score += interactionBonus;

    // Factor 2: Rating balance (up to +/-20 points)
    const totalRatings = data.positiveRatings + data.negativeRatings;
    if (totalRatings > 0) {
      const positiveRatio = data.positiveRatings / totalRatings;
      const ratingBonus = (positiveRatio - 0.5) * 40; // -20 to +20
      score += ratingBonus;
    }

    // Factor 3: Context diversity (up to +10 points)
    const contextBonus = Math.min(data.uniqueContexts.length * 2, 10);
    score += contextBonus;

    // Factor 4: Weighted ratings by rater credibility
    if (data.ratingHistory.length > 0) {
      const weightedSum = data.ratingHistory.reduce((sum, entry) => {
        const credibilityWeight = entry.fromUserReputation / 100;
        return sum + (entry.rating - 3) * credibilityWeight;
      }, 0);
      const weightedBonus = Math.max(-10, Math.min(10, weightedSum));
      score += weightedBonus;
    }

    // Factor 5: Time decay (reputation decays 1 point per 30 days without interaction)
    const lastUpdate = new Date(data.lastUpdated).getTime();
    const daysSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24);
    const decayPenalty = Math.floor(daysSinceUpdate / 30);
    score -= decayPenalty;

    // Clamp score between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  },

  async addInteraction(interaction: Interaction): Promise<void> {
    try {
      const repData = await this.getReputationData();
      repData.verifiedInteractions += 1;
      
      // Add context diversity
      if (interaction.location) {
        const contextKey = `${Math.round(interaction.location.lat * 100)}_${Math.round(interaction.location.lng * 100)}`;
        if (!repData.uniqueContexts.includes(contextKey)) {
          repData.uniqueContexts.push(contextKey);
        }
      }
      
      repData.lastUpdated = new Date().toISOString();
      await this.saveReputationData(repData);
    } catch (error) {
      console.error("Failed to add interaction:", error);
    }
  },

  async addRating(rating: RatingEntry): Promise<void> {
    try {
      const repData = await this.getReputationData();
      repData.ratingHistory.push(rating);
      
      if (rating.rating >= 4) {
        repData.positiveRatings += 1;
      } else if (rating.rating <= 2) {
        repData.negativeRatings += 1;
      }
      
      // Add context
      if (rating.context && !repData.uniqueContexts.includes(rating.context)) {
        repData.uniqueContexts.push(rating.context);
      }
      
      repData.lastUpdated = new Date().toISOString();
      await this.saveReputationData(repData);
    } catch (error) {
      console.error("Failed to add rating:", error);
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
