import { eq, and, or, desc, gt, lt, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  profiles,
  handshakes,
  moments,
  momentViews,
  reputationHistory,
  pushTokens,
  type User,
  type InsertUser,
  type Profile,
  type InsertProfile,
  type UpdateProfile,
  type Handshake,
  type InsertHandshake,
  type Moment,
  type InsertMoment,
  type PushToken,
  type InsertPushToken,
} from "@shared/schema";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export class DatabaseStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Profile methods
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async getProfileById(id: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async createProfile(data: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(data).returning();
    return profile;
  }

  async updateProfile(userId: string, data: UpdateProfile): Promise<Profile | undefined> {
    const [profile] = await db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async updateLocation(userId: string, lat: number, lng: number): Promise<void> {
    await db
      .update(profiles)
      .set({
        lastLocationLat: lat,
        lastLocationLng: lng,
        lastLocationUpdated: new Date(),
      })
      .where(eq(profiles.userId, userId));
  }

  async getNearbyProfiles(lat: number, lng: number, radiusMeters: number = 500): Promise<Profile[]> {
    const allProfiles = await db
      .select()
      .from(profiles)
      .where(
        and(
          eq(profiles.status, "open"),
          gt(profiles.lastLocationUpdated, new Date(Date.now() - 15 * 60 * 1000))
        )
      );

    return allProfiles.filter(profile => {
      if (!profile.lastLocationLat || !profile.lastLocationLng) return false;
      const distance = calculateDistance(lat, lng, profile.lastLocationLat, profile.lastLocationLng);
      return distance <= radiusMeters;
    });
  }

  // Handshake methods
  async createHandshake(data: InsertHandshake): Promise<Handshake> {
    const [handshake] = await db.insert(handshakes).values({
      ...data,
      status: "pending",
    }).returning();

    await this.addReputationChange(data.senderId, 2, "handshake_sent", handshake.id);

    return handshake;
  }

  async getHandshake(id: string): Promise<Handshake | undefined> {
    const [handshake] = await db.select().from(handshakes).where(eq(handshakes.id, id));
    return handshake;
  }

  async getPendingHandshakesForUser(userId: string): Promise<Handshake[]> {
    return db
      .select()
      .from(handshakes)
      .where(
        and(
          eq(handshakes.receiverId, userId),
          eq(handshakes.status, "pending")
        )
      )
      .orderBy(desc(handshakes.createdAt));
  }

  async getSentHandshakes(userId: string): Promise<Handshake[]> {
    return db
      .select()
      .from(handshakes)
      .where(eq(handshakes.senderId, userId))
      .orderBy(desc(handshakes.createdAt));
  }

  async getAcceptedHandshakes(userId: string): Promise<Handshake[]> {
    return db
      .select()
      .from(handshakes)
      .where(
        and(
          or(
            eq(handshakes.senderId, userId),
            eq(handshakes.receiverId, userId)
          ),
          eq(handshakes.status, "accepted")
        )
      )
      .orderBy(desc(handshakes.respondedAt));
  }

  async respondToHandshake(
    handshakeId: string,
    response: "accepted" | "declined",
    receiverLat?: number,
    receiverLng?: number
  ): Promise<Handshake | undefined> {
    const handshake = await this.getHandshake(handshakeId);
    if (!handshake) return undefined;

    let distanceMeters: number | undefined;
    if (receiverLat && receiverLng) {
      distanceMeters = calculateDistance(
        handshake.senderLat,
        handshake.senderLng,
        receiverLat,
        receiverLng
      );
    }

    const [updated] = await db
      .update(handshakes)
      .set({
        status: response,
        receiverLat,
        receiverLng,
        distanceMeters,
        respondedAt: new Date(),
      })
      .where(eq(handshakes.id, handshakeId))
      .returning();

    if (response === "accepted") {
      await this.addReputationChange(handshake.senderId, 5, "handshake_accepted", handshakeId);
      await this.addReputationChange(handshake.receiverId, 5, "handshake_accepted", handshakeId);
      
      await db.update(profiles).set({
        totalHandshakes: sql`${profiles.totalHandshakes} + 1`
      }).where(eq(profiles.userId, handshake.senderId));
      
      await db.update(profiles).set({
        totalHandshakes: sql`${profiles.totalHandshakes} + 1`
      }).where(eq(profiles.userId, handshake.receiverId));
    }

    return updated;
  }

  async checkExistingHandshake(senderId: string, receiverId: string): Promise<Handshake | undefined> {
    const [existing] = await db
      .select()
      .from(handshakes)
      .where(
        and(
          or(
            and(eq(handshakes.senderId, senderId), eq(handshakes.receiverId, receiverId)),
            and(eq(handshakes.senderId, receiverId), eq(handshakes.receiverId, senderId))
          ),
          or(
            eq(handshakes.status, "pending"),
            eq(handshakes.status, "accepted")
          )
        )
      );
    return existing;
  }

  // Moment methods
  async createMoment(data: InsertMoment): Promise<Moment> {
    const [moment] = await db.insert(moments).values(data).returning();

    await this.addReputationChange(data.userId, 3, "moment_created", moment.id);
    
    await db.update(profiles).set({
      totalMoments: sql`${profiles.totalMoments} + 1`
    }).where(eq(profiles.userId, data.userId));

    return moment;
  }

  async getMoment(id: string): Promise<Moment | undefined> {
    const [moment] = await db.select().from(moments).where(eq(moments.id, id));
    return moment;
  }

  async getNearbyMoments(lat: number, lng: number, radiusMeters: number = 500): Promise<Moment[]> {
    const activeMoments = await db
      .select()
      .from(moments)
      .where(
        and(
          eq(moments.isActive, true),
          gt(moments.expiresAt, new Date())
        )
      )
      .orderBy(desc(moments.createdAt));

    return activeMoments.filter(moment => {
      const distance = calculateDistance(lat, lng, moment.locationLat, moment.locationLng);
      return distance <= radiusMeters;
    });
  }

  async getUserMoments(userId: string): Promise<Moment[]> {
    return db
      .select()
      .from(moments)
      .where(eq(moments.userId, userId))
      .orderBy(desc(moments.createdAt));
  }

  async viewMoment(momentId: string, viewerId: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(momentViews)
      .where(
        and(
          eq(momentViews.momentId, momentId),
          eq(momentViews.viewerId, viewerId)
        )
      );

    if (!existing) {
      await db.insert(momentViews).values({ momentId, viewerId });
      await db.update(moments).set({
        viewCount: sql`${moments.viewCount} + 1`
      }).where(eq(moments.id, momentId));

      const moment = await this.getMoment(momentId);
      if (moment) {
        await this.addReputationChange(moment.userId, 1, "moment_viewed", momentId);
      }
    }
  }

  async deactivateExpiredMoments(): Promise<void> {
    await db
      .update(moments)
      .set({ isActive: false })
      .where(
        and(
          eq(moments.isActive, true),
          lt(moments.expiresAt, new Date())
        )
      );
  }

  // Reputation methods
  async addReputationChange(userId: string, amount: number, reason: string, relatedId?: string): Promise<void> {
    await db.insert(reputationHistory).values({
      userId,
      changeAmount: amount,
      reason,
      relatedId,
    });

    await db.update(profiles).set({
      cliqueScore: sql`LEAST(100, GREATEST(0, ${profiles.cliqueScore} + ${amount}))`
    }).where(eq(profiles.userId, userId));
  }

  async getReputationHistory(userId: string, limit: number = 20): Promise<any[]> {
    return db
      .select()
      .from(reputationHistory)
      .where(eq(reputationHistory.userId, userId))
      .orderBy(desc(reputationHistory.createdAt))
      .limit(limit);
  }

  // Push token methods
  async savePushToken(data: InsertPushToken): Promise<PushToken> {
    const [existing] = await db
      .select()
      .from(pushTokens)
      .where(eq(pushTokens.token, data.token));

    if (existing) {
      const [updated] = await db
        .update(pushTokens)
        .set({ userId: data.userId })
        .where(eq(pushTokens.token, data.token))
        .returning();
      return updated;
    }

    const [token] = await db.insert(pushTokens).values(data).returning();
    return token;
  }

  async getPushTokensForUser(userId: string): Promise<PushToken[]> {
    return db.select().from(pushTokens).where(eq(pushTokens.userId, userId));
  }

  async deletePushToken(token: string): Promise<void> {
    await db.delete(pushTokens).where(eq(pushTokens.token, token));
  }
}

export const storage = new DatabaseStorage();
