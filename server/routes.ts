import type { Express } from "express";
import { createServer, type Server } from "node:http";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes for Bumpr

  // Get nearby users
  app.get("/api/nearby", (req, res) => {
    const nearbyUsers = [
      {
        id: "user-1",
        displayName: "Alex",
        avatarPreset: 2,
        status: "open",
        interests: [
          { id: "4", name: "Tech", category: "Professional" },
          { id: "6", name: "AI", category: "Professional" },
          { id: "9", name: "Coffee", category: "Lifestyle" },
        ],
        reputation: 85,
        distanceBand: "close",
        sharedInterests: ["Tech", "AI", "Coffee"],
        hasHandshake: false,
      },
      {
        id: "user-2",
        displayName: "Jordan",
        avatarPreset: 1,
        status: "open",
        interests: [
          { id: "1", name: "Photography", category: "Creative" },
          { id: "3", name: "Design", category: "Creative" },
          { id: "10", name: "Film", category: "Creative" },
        ],
        reputation: 72,
        distanceBand: "near",
        sharedInterests: [],
        hasHandshake: true,
      },
      {
        id: "user-3",
        displayName: "Sam",
        avatarPreset: 2,
        status: "busy",
        interests: [
          { id: "5", name: "Startups", category: "Professional" },
          { id: "8", name: "Travel", category: "Lifestyle" },
          { id: "12", name: "Reading", category: "Lifestyle" },
        ],
        reputation: 91,
        distanceBand: "near",
        sharedInterests: ["Startups"],
        hasHandshake: false,
      },
      {
        id: "user-4",
        displayName: "Riley",
        avatarPreset: 1,
        status: "open",
        interests: [
          { id: "2", name: "Music", category: "Creative" },
          { id: "7", name: "Fitness", category: "Lifestyle" },
          { id: "11", name: "Gaming", category: "Entertainment" },
        ],
        reputation: 65,
        distanceBand: "far",
        sharedInterests: [],
        hasHandshake: false,
      },
    ];

    res.json(nearbyUsers);
  });

  // Get AR moments
  app.get("/api/moments", (req, res) => {
    const moments = [
      {
        id: "moment-1",
        creatorId: "user-1",
        creatorName: "Alex",
        creatorAvatar: 2,
        creatorReputation: 85,
        thumbnailUri: "",
        location: {
          latitude: 37.7849,
          longitude: -122.4094,
          name: "Union Square",
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 45).toISOString(),
        watchCount: 24,
        engagementScore: 0.87,
        duration: 12,
      },
      {
        id: "moment-2",
        creatorId: "user-3",
        creatorName: "Sam",
        creatorAvatar: 2,
        creatorReputation: 91,
        thumbnailUri: "",
        location: {
          latitude: 37.7851,
          longitude: -122.4089,
          name: "Powell Street",
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
        watchCount: 42,
        engagementScore: 0.92,
        duration: 8,
      },
      {
        id: "moment-3",
        creatorId: "user-2",
        creatorName: "Jordan",
        creatorAvatar: 1,
        creatorReputation: 72,
        thumbnailUri: "",
        location: {
          latitude: 37.7855,
          longitude: -122.4085,
          name: "Market Street",
        },
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 55).toISOString(),
        watchCount: 8,
        engagementScore: 0.75,
        duration: 15,
      },
    ];

    res.json(moments);
  });

  // Get venues
  app.get("/api/venues", (req, res) => {
    const venues = [
      {
        id: "venue-1",
        name: "Blue Bottle Coffee",
        category: "Cafe",
        distance: "0.2 mi",
        aiSummary: "Buzzing with remote workers and casual meetups. Great for focused work or spontaneous conversations.",
        activeUsers: 12,
        rating: 4.5,
      },
      {
        id: "venue-2",
        name: "The Commons",
        category: "Co-working",
        distance: "0.4 mi",
        aiSummary: "Professional energy with startup founders and freelancers. Open networking vibe today.",
        activeUsers: 28,
        rating: 4.8,
      },
      {
        id: "venue-3",
        name: "Yerba Buena Gardens",
        category: "Park",
        distance: "0.3 mi",
        aiSummary: "Relaxed outdoor atmosphere. Mix of lunch crowds and creative professionals.",
        activeUsers: 15,
        rating: 4.6,
      },
      {
        id: "venue-4",
        name: "TechCrunch Meetup",
        category: "Event",
        distance: "0.5 mi",
        aiSummary: "Tech networking event with 50+ attendees. High energy, lots of founders.",
        activeUsers: 52,
        rating: 4.7,
      },
    ];

    res.json(venues);
  });

  // Get space summary
  app.get("/api/space-summary", (req, res) => {
    const summary = {
      title: "Downtown SF",
      description: "Active tech hub with coffee shops and co-working spaces",
      activeCount: 47,
      vibe: "Professional & Creative",
      topInterests: ["Tech", "Startups", "Design", "Coffee"],
    };

    res.json(summary);
  });

  // Send handshake
  app.post("/api/handshake", (req, res) => {
    const { toUserId } = req.body;
    
    if (!toUserId) {
      return res.status(400).json({ error: "Missing toUserId" });
    }

    res.json({
      success: true,
      message: "Handshake sent successfully",
      handshakeId: `hs-${Date.now()}`,
    });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
