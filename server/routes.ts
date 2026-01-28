import type { Express } from "express";
import { createServer, type Server } from "node:http";

interface VenueCategory {
  name: string;
  icon: string;
  types: string[];
}

const VENUE_CATEGORIES: VenueCategory[] = [
  { name: "Cafe", icon: "coffee", types: ["cafe", "coffee_shop"] },
  { name: "Restaurant", icon: "utensils", types: ["restaurant", "food"] },
  { name: "Co-working", icon: "briefcase", types: ["coworking_space"] },
  { name: "Park", icon: "sun", types: ["park", "garden"] },
  { name: "Bar", icon: "glass-martini", types: ["bar", "pub"] },
  { name: "Gym", icon: "activity", types: ["gym", "fitness_center"] },
  { name: "Library", icon: "book", types: ["library"] },
  { name: "Shopping", icon: "shopping-bag", types: ["shopping_mall", "store"] },
];

function generateVenuesForLocation(lat: number, lng: number, city: string) {
  const venues = [];
  const venueNames: { [key: string]: string[] } = {
    Cafe: [
      `${city} Coffee House`,
      "The Local Roast",
      "Morning Brew Cafe",
      "Artisan Coffee Co.",
      "Bean & Leaf",
    ],
    Restaurant: [
      `${city} Kitchen`,
      "The Corner Bistro",
      "Urban Eats",
      "Farm & Table",
      "The Daily Grill",
    ],
    "Co-working": [
      "The Hub",
      "Workspace Collective",
      "Innovation Center",
      `${city} Work Club`,
      "The Commons",
    ],
    Park: [
      `${city} Central Park`,
      "Riverside Gardens",
      "Community Green",
      "Sunset Plaza",
      "Heritage Park",
    ],
    Bar: [
      "The Social",
      "Craft & Draft",
      "The Lounge",
      "Night Owl",
      "The Pub",
    ],
    Gym: [
      `${city} Fitness`,
      "Iron Works Gym",
      "FitLife Center",
      "Active Athletics",
      "Peak Performance",
    ],
    Library: [
      `${city} Public Library`,
      "Community Library",
      "Knowledge Hub",
    ],
    Shopping: [
      `${city} Mall`,
      "Market Square",
      "The Plaza",
      "Shopping District",
    ],
  };

  const summaries: { [key: string]: string[] } = {
    Cafe: [
      "Cozy atmosphere with remote workers and casual meetups. Great for focused work.",
      "Bustling spot popular with creatives. Excellent pour-over and pastries.",
      "Quiet corner cafe perfect for reading or one-on-ones.",
    ],
    Restaurant: [
      "Lively lunch crowd with a mix of professionals and locals.",
      "Farm-to-table menu draws food enthusiasts. Great for group dinners.",
      "Casual dining with outdoor seating. Popular for brunch.",
    ],
    "Co-working": [
      "Professional energy with startup founders and freelancers.",
      "Open networking vibe. Regular community events.",
      "Quiet focused workspace with private booths available.",
    ],
    Park: [
      "Relaxed outdoor atmosphere. Popular for lunch breaks and jogging.",
      "Community gathering spot with food trucks on weekends.",
      "Scenic walking trails and benches for casual conversations.",
    ],
    Bar: [
      "After-work crowd gathers here. Great craft cocktails.",
      "Laid-back vibe with live music on weekends.",
      "Sports bar atmosphere. Good for meeting new people.",
    ],
    Gym: [
      "Morning crowd is focused. Evening gets social.",
      "Popular with fitness enthusiasts. Group classes build community.",
      "Well-equipped facility with friendly regulars.",
    ],
    Library: [
      "Quiet study spaces and community programs.",
      "Great for focused work with free Wi-Fi.",
    ],
    Shopping: [
      "Busy on weekends with diverse crowds.",
      "Mix of local shops and popular brands.",
    ],
  };

  const distances = ["0.1 mi", "0.2 mi", "0.3 mi", "0.4 mi", "0.5 mi", "0.6 mi", "0.8 mi", "1.0 mi"];

  let id = 1;
  for (const category of VENUE_CATEGORIES) {
    const names = venueNames[category.name] || [];
    const catSummaries = summaries[category.name] || ["A great local spot."];
    
    const numVenues = Math.min(names.length, 2 + Math.floor(Math.random() * 2));
    
    for (let i = 0; i < numVenues; i++) {
      venues.push({
        id: `venue-${id++}`,
        name: names[i],
        category: category.name,
        distance: distances[Math.floor(Math.random() * distances.length)],
        aiSummary: catSummaries[i % catSummaries.length],
        activeUsers: Math.floor(Math.random() * 25) + 1,
        rating: (4 + Math.random()).toFixed(1),
      });
    }
  }

  return venues.sort((a, b) => {
    const distA = parseFloat(a.distance);
    const distB = parseFloat(b.distance);
    return distA - distB;
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get venues based on location
  app.get("/api/venues", (req, res) => {
    const lat = parseFloat(req.query.lat as string) || 0;
    const lng = parseFloat(req.query.lng as string) || 0;
    const city = (req.query.city as string) || "Your Area";

    const venues = generateVenuesForLocation(lat, lng, city);
    res.json(venues);
  });

  // Get space summary for location
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
