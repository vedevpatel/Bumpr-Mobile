import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";

interface VenueCategory {
  name: string;
  icon: string;
  osmTags: string[];
}

const VENUE_CATEGORIES: VenueCategory[] = [
  { name: "Cafe", icon: "coffee", osmTags: ["amenity=cafe"] },
  { name: "Restaurant", icon: "utensils", osmTags: ["amenity=restaurant"] },
  { name: "Bar", icon: "glass-martini", osmTags: ["amenity=bar", "amenity=pub"] },
  { name: "Park", icon: "sun", osmTags: ["leisure=park"] },
  { name: "Gym", icon: "activity", osmTags: ["leisure=fitness_centre", "leisure=sports_centre"] },
  { name: "Library", icon: "book", osmTags: ["amenity=library"] },
  { name: "Shopping", icon: "shopping-bag", osmTags: ["shop=mall", "shop=supermarket"] },
];

const AI_SUMMARIES: { [key: string]: string[] } = {
  Cafe: [
    "Cozy atmosphere with remote workers and casual meetups.",
    "Bustling spot popular with creatives and coffee lovers.",
    "Quiet corner perfect for reading or one-on-ones.",
  ],
  Restaurant: [
    "Lively crowd with a mix of professionals and locals.",
    "Great menu draws food enthusiasts. Perfect for group dinners.",
    "Casual dining with outdoor seating. Popular spot.",
  ],
  Bar: [
    "After-work crowd gathers here. Great atmosphere.",
    "Laid-back vibe with good drinks and conversation.",
    "Social atmosphere. Good for meeting new people.",
  ],
  Park: [
    "Relaxed outdoor atmosphere. Popular for walks.",
    "Community gathering spot with scenic views.",
    "Great trails and benches for casual hangouts.",
  ],
  Gym: [
    "Morning crowd is focused. Evening gets social.",
    "Popular with fitness enthusiasts. Great equipment.",
    "Well-equipped facility with friendly regulars.",
  ],
  Library: [
    "Quiet study spaces and community resources.",
    "Great for focused work with free Wi-Fi.",
  ],
  Shopping: [
    "Busy on weekends with diverse crowds.",
    "Mix of local shops and popular brands.",
  ],
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

async function fetchRealVenues(lat: number, lng: number): Promise<any[]> {
  const radius = 1600;
  const tagQueries = VENUE_CATEGORIES.flatMap(cat => 
    cat.osmTags.map(tag => {
      const [key, value] = tag.split("=");
      return `node["${key}"="${value}"](around:${radius},${lat},${lng});`;
    })
  ).join("\n");

  const overpassQuery = `
    [out:json][timeout:5];
    (
      ${tagQueries}
    );
    out body 15;
  `;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("Overpass API request failed");
    }

    const data = await response.json();
    const venues: any[] = [];

    if (data.elements && data.elements.length > 0) {
      let id = 1;
      for (const element of data.elements) {
        const tags = element.tags || {};
        const name = tags.name || tags["name:en"];
        if (!name) continue;

        let category = "Other";
        for (const cat of VENUE_CATEGORIES) {
          for (const osmTag of cat.osmTags) {
            const [key, value] = osmTag.split("=");
            if (tags[key] === value) {
              category = cat.name;
              break;
            }
          }
        }

        const distance = calculateDistance(lat, lng, element.lat, element.lon);
        const summaries = AI_SUMMARIES[category] || ["A great local spot."];

        venues.push({
          id: `venue-${id++}`,
          name: name,
          category: category,
          distance: distance < 0.1 ? "< 0.1 mi" : `${distance.toFixed(1)} mi`,
          aiSummary: summaries[Math.floor(Math.random() * summaries.length)],
          activeUsers: 0,
          rating: (4 + Math.random()).toFixed(1),
          lat: element.lat,
          lng: element.lon,
        });
      }
    }

    if (venues.length === 0) {
      return generateFallbackVenues(lat, lng);
    }

    return venues.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  } catch (error) {
    clearTimeout(timeoutId);
    console.log("Overpass API error, using fallback venues");
    return generateFallbackVenues(lat, lng);
  }
}

function generateFallbackVenues(lat: number, lng: number): any[] {
  const venues = [];
  const distances = ["0.1 mi", "0.2 mi", "0.3 mi", "0.5 mi", "0.8 mi"];
  
  let id = 1;
  for (const category of VENUE_CATEGORIES.slice(0, 5)) {
    venues.push({
      id: `venue-${id++}`,
      name: `Local ${category.name}`,
      category: category.name,
      distance: distances[Math.floor(Math.random() * distances.length)],
      aiSummary: (AI_SUMMARIES[category.name] || ["A nice spot."])[0],
      activeUsers: 0,
      rating: (4 + Math.random()).toFixed(1),
    });
  }

  return venues.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============= VENUE ROUTES =============
  app.get("/api/venues", async (req, res) => {
    const lat = parseFloat(req.query.lat as string) || 0;
    const lng = parseFloat(req.query.lng as string) || 0;

    try {
      const venues = await fetchRealVenues(lat, lng);
      res.json(venues);
    } catch (error) {
      console.log("Error fetching venues:", error);
      res.json(generateFallbackVenues(lat, lng));
    }
  });

  app.get("/api/space-summary", (req, res) => {
    const city = (req.query.city as string) || "Your Area";

    const summary = {
      title: city,
      description: `Explore what's happening near you in ${city}`,
      activeCount: Math.floor(Math.random() * 30) + 5,
      vibe: ["Professional & Creative", "Relaxed & Social", "Energetic & Busy", "Quiet & Focused"][
        Math.floor(Math.random() * 4)
      ],
      topInterests: ["Coffee", "Tech", "Fitness", "Food"].slice(0, Math.floor(Math.random() * 4) + 1),
    };

    res.json(summary);
  });

  // ============= USER & PROFILE ROUTES =============
  app.post("/api/users", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({ username, password });
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const profile = await storage.createProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

  app.get("/api/profiles/:userId", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.patch("/api/profiles/:userId", async (req, res) => {
    try {
      const profile = await storage.updateProfile(req.params.userId, req.body);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.post("/api/profiles/:userId/location", async (req, res) => {
    try {
      const { lat, lng } = req.body;
      if (typeof lat !== "number" || typeof lng !== "number") {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
      await storage.updateLocation(req.params.userId, lat, lng);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ error: "Failed to update location" });
    }
  });

  app.get("/api/profiles/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 500;

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      const profiles = await storage.getNearbyProfiles(lat, lng, radius);
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching nearby profiles:", error);
      res.status(500).json({ error: "Failed to fetch nearby profiles" });
    }
  });

  app.get("/api/users/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 500;
      const excludeUserId = req.query.excludeUserId as string || "";

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      const profiles = await storage.getNearbyProfiles(lat, lng, radius);
      
      const nearbyUsers = profiles
        .filter(p => p.userId !== excludeUserId)
        .map(p => {
          const dLat = (p.lastLat! - lat) * Math.PI / 180;
          const dLon = (p.lastLng! - lng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat * Math.PI / 180) * Math.cos(p.lastLat! * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distanceMeters = Math.round(6371000 * c);

          return {
            id: p.userId,
            name: p.name,
            avatarUrl: p.avatarUrl || null,
            cliqueScore: p.cliqueScore,
            distance: distanceMeters,
            status: p.status,
            bio: p.bio || null,
            interests: p.interests || [],
          };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      res.json(nearbyUsers);
    } catch (error) {
      console.error("Error fetching nearby users:", error);
      res.status(500).json({ error: "Failed to fetch nearby users" });
    }
  });

  // ============= HANDSHAKE ROUTES =============
  app.post("/api/handshakes", async (req, res) => {
    try {
      const { senderId, receiverId, senderLat, senderLng, message } = req.body;

      if (!senderId || !receiverId || typeof senderLat !== "number" || typeof senderLng !== "number") {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existing = await storage.checkExistingHandshake(senderId, receiverId);
      if (existing) {
        if (existing.status === "pending") {
          return res.status(409).json({ error: "Handshake already pending", handshake: existing });
        }
        if (existing.status === "accepted") {
          return res.status(409).json({ error: "Already connected", handshake: existing });
        }
      }

      const handshake = await storage.createHandshake({
        senderId,
        receiverId,
        senderLat,
        senderLng,
        message,
      });

      res.status(201).json(handshake);
    } catch (error) {
      console.error("Error creating handshake:", error);
      res.status(500).json({ error: "Failed to send handshake" });
    }
  });

  app.get("/api/handshakes/pending/:userId", async (req, res) => {
    try {
      const handshakes = await storage.getPendingHandshakesForUser(req.params.userId);
      
      const enriched = await Promise.all(
        handshakes.map(async (h) => {
          const senderProfile = await storage.getProfile(h.senderId);
          return { ...h, senderProfile };
        })
      );

      res.json(enriched);
    } catch (error) {
      console.error("Error fetching pending handshakes:", error);
      res.status(500).json({ error: "Failed to fetch pending handshakes" });
    }
  });

  app.get("/api/handshakes/sent/:userId", async (req, res) => {
    try {
      const handshakes = await storage.getSentHandshakes(req.params.userId);
      
      const enriched = await Promise.all(
        handshakes.map(async (h) => {
          const receiverProfile = await storage.getProfile(h.receiverId);
          return { ...h, receiverProfile };
        })
      );

      res.json(enriched);
    } catch (error) {
      console.error("Error fetching sent handshakes:", error);
      res.status(500).json({ error: "Failed to fetch sent handshakes" });
    }
  });

  app.get("/api/handshakes/connections/:userId", async (req, res) => {
    try {
      const handshakes = await storage.getAcceptedHandshakes(req.params.userId);
      
      const enriched = await Promise.all(
        handshakes.map(async (h) => {
          const otherUserId = h.senderId === req.params.userId ? h.receiverId : h.senderId;
          const profile = await storage.getProfile(otherUserId);
          return { ...h, connectedProfile: profile };
        })
      );

      res.json(enriched);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ error: "Failed to fetch connections" });
    }
  });

  app.post("/api/handshakes/:id/respond", async (req, res) => {
    try {
      const { response, receiverLat, receiverLng } = req.body;

      if (!response || !["accepted", "declined"].includes(response)) {
        return res.status(400).json({ error: "Invalid response" });
      }

      const handshake = await storage.respondToHandshake(
        req.params.id,
        response,
        receiverLat,
        receiverLng
      );

      if (!handshake) {
        return res.status(404).json({ error: "Handshake not found" });
      }

      res.json(handshake);
    } catch (error) {
      console.error("Error responding to handshake:", error);
      res.status(500).json({ error: "Failed to respond to handshake" });
    }
  });

  // ============= MOMENTS ROUTES =============
  app.post("/api/moments", async (req, res) => {
    try {
      const { userId, videoUrl, thumbnailUrl, caption, locationLat, locationLng, locationName, durationSeconds, expiresAt } = req.body;

      if (!userId || typeof locationLat !== "number" || typeof locationLng !== "number") {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const moment = await storage.createMoment({
        userId,
        videoUrl,
        thumbnailUrl,
        caption,
        locationLat,
        locationLng,
        locationName,
        durationSeconds: durationSeconds || 10,
        expiresAt: new Date(expiresAt || Date.now() + 24 * 60 * 60 * 1000),
      });

      res.status(201).json(moment);
    } catch (error) {
      console.error("Error creating moment:", error);
      res.status(500).json({ error: "Failed to create moment" });
    }
  });

  app.get("/api/moments/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = parseFloat(req.query.radius as string) || 500;

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }

      await storage.deactivateExpiredMoments();
      const moments = await storage.getNearbyMoments(lat, lng, radius);

      const enriched = await Promise.all(
        moments.map(async (m) => {
          const profile = await storage.getProfile(m.userId);
          return { ...m, userProfile: profile };
        })
      );

      res.json(enriched);
    } catch (error) {
      console.error("Error fetching nearby moments:", error);
      res.status(500).json({ error: "Failed to fetch nearby moments" });
    }
  });

  app.get("/api/moments/user/:userId", async (req, res) => {
    try {
      const moments = await storage.getUserMoments(req.params.userId);
      res.json(moments);
    } catch (error) {
      console.error("Error fetching user moments:", error);
      res.status(500).json({ error: "Failed to fetch user moments" });
    }
  });

  app.get("/api/moments/:id", async (req, res) => {
    try {
      const moment = await storage.getMoment(req.params.id);
      if (!moment) {
        return res.status(404).json({ error: "Moment not found" });
      }

      const profile = await storage.getProfile(moment.userId);
      res.json({ ...moment, userProfile: profile });
    } catch (error) {
      console.error("Error fetching moment:", error);
      res.status(500).json({ error: "Failed to fetch moment" });
    }
  });

  app.post("/api/moments/:id/view", async (req, res) => {
    try {
      const { viewerId } = req.body;
      if (!viewerId) {
        return res.status(400).json({ error: "Viewer ID required" });
      }

      await storage.viewMoment(req.params.id, viewerId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error recording view:", error);
      res.status(500).json({ error: "Failed to record view" });
    }
  });

  // ============= REPUTATION ROUTES =============
  app.get("/api/reputation/:userId", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      const history = await storage.getReputationHistory(req.params.userId, 20);

      res.json({
        score: profile.cliqueScore,
        totalHandshakes: profile.totalHandshakes,
        totalMoments: profile.totalMoments,
        history,
      });
    } catch (error) {
      console.error("Error fetching reputation:", error);
      res.status(500).json({ error: "Failed to fetch reputation" });
    }
  });

  // ============= PUSH TOKEN ROUTES =============
  app.post("/api/push-tokens", async (req, res) => {
    try {
      const { userId, token, platform } = req.body;
      if (!userId || !token || !platform) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const saved = await storage.savePushToken({ userId, token, platform });
      res.status(201).json(saved);
    } catch (error) {
      console.error("Error saving push token:", error);
      res.status(500).json({ error: "Failed to save push token" });
    }
  });

  app.delete("/api/push-tokens/:token", async (req, res) => {
    try {
      await storage.deletePushToken(req.params.token);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting push token:", error);
      res.status(500).json({ error: "Failed to delete push token" });
    }
  });

  // ============= HEALTH CHECK =============
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
