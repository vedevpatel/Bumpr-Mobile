import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - authentication
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Profiles - extended user information
export const profiles = pgTable("profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  name: text("name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  interests: jsonb("interests").$type<string[]>().default([]),
  status: text("status").notNull().default("open"), // "open" | "busy"
  lastLocationLat: real("last_location_lat"),
  lastLocationLng: real("last_location_lng"),
  lastLocationUpdated: timestamp("last_location_updated"),
  cliqueScore: integer("clique_score").notNull().default(50),
  totalHandshakes: integer("total_handshakes").notNull().default(0),
  totalMoments: integer("total_moments").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Handshakes - connection requests between users
export const handshakes = pgTable("handshakes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  status: text("status").notNull().default("pending"), // "pending" | "accepted" | "declined"
  senderLat: real("sender_lat").notNull(),
  senderLng: real("sender_lng").notNull(),
  receiverLat: real("receiver_lat"),
  receiverLng: real("receiver_lng"),
  distanceMeters: real("distance_meters"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

// Moments - location-anchored short videos
export const moments = pgTable("moments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  locationLat: real("location_lat").notNull(),
  locationLng: real("location_lng").notNull(),
  locationName: text("location_name"),
  durationSeconds: integer("duration_seconds").notNull().default(10),
  viewCount: integer("view_count").notNull().default(0),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Moment Views - track who viewed which moments
export const momentViews = pgTable("moment_views", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  momentId: varchar("moment_id").references(() => moments.id).notNull(),
  viewerId: varchar("viewer_id").references(() => users.id).notNull(),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

// Clique Reputation History - track reputation changes
export const reputationHistory = pgTable("reputation_history", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  changeAmount: integer("change_amount").notNull(),
  reason: text("reason").notNull(), // "handshake_sent" | "handshake_accepted" | "moment_created" | "moment_viewed"
  relatedId: varchar("related_id"), // ID of related handshake or moment
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Push notification tokens
export const pushTokens = pgTable("push_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  platform: text("platform").notNull(), // "ios" | "android" | "web"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProfileSchema = createInsertSchema(profiles).partial().omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertHandshakeSchema = createInsertSchema(handshakes).omit({
  id: true,
  createdAt: true,
  respondedAt: true,
  status: true,
  distanceMeters: true,
  receiverLat: true,
  receiverLng: true,
});

export const insertMomentSchema = createInsertSchema(moments).omit({
  id: true,
  createdAt: true,
  viewCount: true,
  isActive: true,
});

export const insertPushTokenSchema = createInsertSchema(pushTokens).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertHandshake = z.infer<typeof insertHandshakeSchema>;
export type Handshake = typeof handshakes.$inferSelect;

export type InsertMoment = z.infer<typeof insertMomentSchema>;
export type Moment = typeof moments.$inferSelect;

export type MomentView = typeof momentViews.$inferSelect;
export type ReputationHistory = typeof reputationHistory.$inferSelect;

export type InsertPushToken = z.infer<typeof insertPushTokenSchema>;
export type PushToken = typeof pushTokens.$inferSelect;
