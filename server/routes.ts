import type { Express } from "express";
import { createServer, type Server } from "node:http";

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
    [out:json][timeout:10];
    (
      ${tagQueries}
    );
    out body 20;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    });

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

    return venues.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  } catch (error) {
    console.log("Overpass API error, using fallback:", error);
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
