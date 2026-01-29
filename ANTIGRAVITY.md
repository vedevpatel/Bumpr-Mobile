# ANTIGRAVITY.md - Bumpr Complete Handoff Documentation

> **Last Updated:** January 2026  
> **Project Status:** MVP Development  
> **Platform:** Expo/React Native + Express/PostgreSQL

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Vision & Motive](#2-core-vision--motive)
3. [Design System & Aesthetic](#3-design-system--aesthetic)
4. [AR Components (Deep Research Interface)](#4-ar-components-deep-research-interface)
5. [Location Features & Venue Discovery](#5-location-features--venue-discovery)
6. [Handshake System](#6-handshake-system)
7. [Clique Reputation System](#7-clique-reputation-system)
8. [Moments System](#8-moments-system)
9. [Technical Architecture](#9-technical-architecture)
10. [Database Schema](#10-database-schema)
11. [API Reference](#11-api-reference)
12. [Component Library](#12-component-library)
13. [Production Transition Checklist](#13-production-transition-checklist)
14. [Known Issues & Technical Debt](#14-known-issues--technical-debt)
15. [Future Enhancements](#15-future-enhancements)

---

## 1. Project Overview

### What is Bumpr?

Bumpr is a **mobile-first social app** that creates an **AI-powered information layer for physical spaces**. It enables real-world social connection through:

- **Location-based discovery** of people nearby
- **AR scanning** to view profiles of people in your vicinity
- **Handshake-based profile unlock** requiring mutual consent
- **Location-anchored video Moments** visible only to people nearby
- **Clique Reputation** system based on verified interactions

### Key Differentiators

1. **Not social media** - No feeds, no followers, no likes
2. **Physical-first** - Features only work when people are co-located
3. **Mutual consent** - All connections require handshake acceptance from both parties
4. **Privacy-focused** - Exact location never shared, profiles locked by default
5. **AI-enhanced** - Contextual venue summaries and social insights

### Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile Frontend | Expo SDK 54, React Native, React Navigation 7 |
| State Management | TanStack React Query, React hooks |
| Animations | React Native Reanimated |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (Neon-backed via Drizzle ORM) |
| Maps | react-native-maps (v1.18.0 pinned) |
| Camera/AR | expo-camera |
| Notifications | expo-notifications |

---

## 2. Core Vision & Motive

### The Problem

Modern social apps have made us more connected online but less connected in real life. People sit in cafes, gyms, and parks surrounded by potentially interesting people but have no context about who they are or if they're open to conversation.

### The Solution

Bumpr acts as **social infrastructure for physical spaces**:

1. **See who's nearby** - Real-time spatial awareness without being creepy
2. **Understand context** - AI summaries of venues and social vibes
3. **Low-friction introductions** - Handshake system makes connections mutual and safe
4. **Ephemeral local content** - Moments tied to locations, not feeds

### Target Experience

> "Walk into a coffee shop. Bumpr tells you 3 people are here and open to connecting. You AR-scan the room and see profile cards floating over people. One person shares your interest in AI and startups. You send a handshake. They accept. Now you can see each other's full profiles and start a conversation."

---

## 3. Design System & Aesthetic

### Visual Direction

**Warm, minimal, cream-based design** inspired by modern dating/social apps. Soft linen textures, muted earth tones, and generous whitespace create an inviting, premium feel.

### Color Palette

#### Light Mode (Primary)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#C4846C` | Warm terracotta - CTAs, accents |
| Secondary | `#8FA67A` | Soft sage - "Open" status, success |
| Accent | `#D4A574` | Warm gold - highlights, badges |
| Background Root | `#F5EDE4` | Warm cream/linen - main bg |
| Background Default | `#FAF7F3` | Lighter cream - cards |
| Background Secondary | `#EFE8DF` | Subtle depth layers |
| Text Primary | `#2C2825` | Warm dark brown (not pure black) |
| Text Secondary | `#7A756F` | Muted stone |
| Border | `#E5DED5` | Subtle warm dividers |

#### Dark Mode (Contrast)

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#D4A08A` | Lightened terracotta |
| Secondary | `#9FB88A` | Brighter sage |
| Accent | `#DEB68A` | Warm gold |
| Background Root | `#1C1A18` | Warm charcoal |
| Background Default | `#252320` | Elevated dark cream |
| Background Secondary | `#2F2C28` | Layered depth |
| Text Primary | `#F5F2EF` | Warm off-white |
| Text Secondary | `#A8A29D` | Muted stone |
| Border | `#3D3935` | Subtle warm dividers |

### Typography

- **Font:** Inter (Google Font)
- **Large Title:** 34pt, Bold
- **H1:** 28pt, SemiBold
- **H2:** 24pt, SemiBold
- **H3:** 20pt, SemiBold
- **H4:** 17pt, SemiBold
- **Body:** 16pt, Regular
- **Small:** 14pt, Regular
- **Caption:** 13pt, Regular
- **Label:** 11pt, Medium, uppercase, letter-spacing 0.5

### Spacing Scale

```typescript
xs: 4, sm: 8, md: 12, lg: 16, xl: 20, 
"2xl": 24, "3xl": 32, "4xl": 40, "5xl": 48, "6xl": 64
```

### Border Radius

```typescript
xs: 8, sm: 12, md: 16, lg: 20, xl: 24, "2xl": 32, "3xl": 40, full: 9999
```

### Design Files

- `client/constants/theme.ts` - All colors, spacing, typography
- `design_guidelines.md` - Comprehensive design system documentation

---

## 4. AR Components (Deep Research Interface)

### Overview

The AR screen is the **signature feature** of Bumpr. It uses the device camera to "scan" for nearby people and displays their profiles in a sleek, sci-fi "Deep Research" aesthetic.

### File Location

`client/screens/ARScreen.tsx`

### Design Aesthetic: "Deep Research"

The AR interface uses a **monochromatic black/white glassmorphism** design inspired by:
- Intelligence agency dossiers
- Sci-fi research terminals
- Minimalist data visualization

Key visual elements:
- **Monospaced fonts** (Menlo/monospace) for technical data
- **Thin white focus ring** with corner brackets during scanning
- **70% translucent glassmorphism** dossier cards
- **Smooth-cycling status text** during research phases

### Scanning Flow

1. **READY State**
   - Camera active, "READY" status indicator
   - Large SCAN button visible at bottom
   - No automatic detection (manual trigger only)

2. **SCANNING State** (triggered by SCAN button press)
   - Focus ring appears with corner brackets
   - Status text cycles through research phases:
     ```
     "Querying social indices..."
     "Aggregating affiliations..."
     "Cross-referencing network nodes..."
     "Compiling behavioral patterns..."
     "Analyzing connection graph..."
     "Resolving identity vectors..."
     ```
   - Duration: 2-3 seconds (randomized)
   - Haptic feedback on trigger

3. **LOCKED State** (profile detected)
   - Focus ring fades out
   - Dossier card animates in from bottom
   - "LOCKED" status indicator

### Dossier Card Structure

```
┌─────────────────────────────────────────┐
│ [Avatar] Name                      [X]  │
│          ● OPEN                         │
├─────────────────────────────────────────┤
│  PROXIMITY │ CLIQUE  │ NODES            │
│    3m      │   87    │   3              │
├─────────────────────────────────────────┤
│ SOURCE SUMMARY                          │
│ Tech enthusiast & coffee lover...       │
├─────────────────────────────────────────┤
│ AFFILIATIONS                            │
│ [Stanford '19] [Sequoia] [YC W21]       │
├─────────────────────────────────────────┤
│ INTERESTS                               │
│ [Photography] [AI] [Hiking] [Coffee]    │
├─────────────────────────────────────────┤
│      ⚡ INITIATE HANDSHAKE              │
└─────────────────────────────────────────┘
```

### Demo Profiles

Currently uses 3 demo profiles for demonstration:

```typescript
const DEMO_PROFILES = [
  {
    id: "demo-1",
    name: "Alex Chen",
    cliqueScore: 87,
    distance: 3,
    status: "open",
    bio: "Tech enthusiast & coffee lover...",
    interests: ["Photography", "AI", "Hiking", "Coffee"],
    affiliations: ["Stanford '19", "Sequoia Capital", "YC W21"],
  },
  // ... Jordan Rivera, Sam Taylor
];
```

### Production Implementation Notes

**Current State:** Uses simulated detection with demo profiles.

**For Real Implementation:**
1. **Face Detection:** Requires `react-native-vision-camera` with ML Kit or similar
2. **User Matching:** Backend API to match detected faces with registered users
3. **Bluetooth/NFC:** Alternative proximity detection without camera
4. **Privacy Considerations:** Users must opt-in to be "scannable"

### Key Technical Details

- Uses `expo-camera` CameraView component
- Animations via React Native Reanimated
- Blur effects via `expo-blur` BlurView
- Haptic feedback via `expo-haptics`

---

## 5. Location Features & Venue Discovery

### Map Screen (`client/screens/MapScreen.tsx`)

The main "Nearby Mode" showing:
- Interactive map with user location
- Status toggle (Open/Busy)
- Current location name badge
- Space summary card with AI-generated vibe
- "No one nearby" empty state
- FAB for quick handshake access

### Venue Discovery (`client/screens/DiscoverScreen.tsx`)

Browse nearby venues with:
- Search functionality
- Category filtering (Cafe, Restaurant, Bar, Park, Gym, Library, Shopping)
- AI-generated venue summaries
- Distance indicators
- Pull-to-refresh

### Backend Venue API (`server/routes.ts`)

#### Data Source: OpenStreetMap Overpass API

```typescript
const VENUE_CATEGORIES = [
  { name: "Cafe", icon: "coffee", osmTags: ["amenity=cafe"] },
  { name: "Restaurant", icon: "utensils", osmTags: ["amenity=restaurant"] },
  { name: "Bar", icon: "glass-martini", osmTags: ["amenity=bar", "amenity=pub"] },
  { name: "Park", icon: "sun", osmTags: ["leisure=park"] },
  { name: "Gym", icon: "activity", osmTags: ["leisure=fitness_centre"] },
  { name: "Library", icon: "book", osmTags: ["amenity=library"] },
  { name: "Shopping", icon: "shopping-bag", osmTags: ["shop=mall"] },
];
```

#### Fallback Venues

When Overpass API fails (timeout/rate limit), fallback venues are generated:

```typescript
function generateFallbackVenues(lat, lng) {
  // Returns generic "Local Cafe", "Local Restaurant" etc.
}
```

#### AI Summaries

Pre-defined summaries randomized per category:

```typescript
const AI_SUMMARIES = {
  Cafe: [
    "Cozy atmosphere with remote workers and casual meetups.",
    "Bustling spot popular with creatives and coffee lovers.",
    // ...
  ],
  // ... other categories
};
```

### Location Permissions

Uses `expo-location` with:
- Foreground permissions only (no background tracking)
- `Location.Accuracy.High` for precise positioning
- Reverse geocoding for location names
- Graceful fallback when permission denied

### Known Issues

1. **Overpass API Timeouts:** The free OpenStreetMap API can be slow or rate-limited
2. **Mobile Connectivity:** Network timeouts more common on cellular networks
3. **Geocoding Rate Limits:** Expo's reverse geocoding has usage limits

### Production Recommendations

1. **Cache venues** in database with periodic refresh
2. **Use paid geocoding API** (Google Maps, Mapbox)
3. **Implement proper retry logic** with exponential backoff
4. **Add offline venue cache** for common locations

---

## 6. Handshake System

### Concept

A "handshake" is a **mutual connection request** between two users. Unlike follows or friend requests, **both parties must accept** for the connection to form.

### Flow

1. **Sender initiates** handshake (from AR scan or profile view)
2. **Receiver gets notification** with sender's anonymized preview
3. **Receiver accepts or declines**
4. **If accepted:** Both users unlock full profiles
5. **Reputation updates** for both users

### Database Schema

```sql
handshakes (
  id VARCHAR PRIMARY KEY,
  sender_id VARCHAR REFERENCES users(id),
  receiver_id VARCHAR REFERENCES users(id),
  status TEXT DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined'
  sender_lat REAL,
  sender_lng REAL,
  receiver_lat REAL,
  receiver_lng REAL,
  distance_meters REAL,
  message TEXT,
  created_at TIMESTAMP,
  responded_at TIMESTAMP
)
```

### Handshake Screen (`client/screens/HandshakeScreen.tsx`)

Three-tab interface:
1. **Pending** - Handshakes awaiting response
2. **Sent** - Outgoing handshakes
3. **Connections** - Accepted handshakes (mutual connections)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/handshakes` | POST | Create new handshake |
| `/api/handshakes/pending/:userId` | GET | Get pending handshakes for user |
| `/api/handshakes/sent/:userId` | GET | Get sent handshakes by user |
| `/api/handshakes/connections/:userId` | GET | Get accepted connections |
| `/api/handshakes/:id/accept` | PATCH | Accept a handshake |
| `/api/handshakes/:id/decline` | PATCH | Decline a handshake |

### UI Components

- `HandshakeCard.tsx` - Displays handshake with accept/decline actions
- Animated enter/exit transitions
- Pull-to-refresh on all tabs

---

## 7. Clique Reputation System

### Concept

"Clique Score" is a **trust metric** (0-100) based on:
- Verified handshakes
- Moments created and viewed
- Behavioral patterns
- Account age and activity

### Score Calculation

```typescript
// Base score: 50 (new users)
// +5 for each accepted handshake
// +3 for each moment created
// +1 for each moment view received
// -10 for declined handshakes (if pattern detected)
```

### Database Schema

```sql
reputation_history (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  change_amount INTEGER,
  reason TEXT, -- 'handshake_sent' | 'handshake_accepted' | 'moment_created' | 'moment_viewed'
  related_id VARCHAR, -- ID of related handshake or moment
  created_at TIMESTAMP
)
```

### UI Display

- `ReputationMeter.tsx` - Visual meter (not raw number)
- Profile screen shows current score
- AR dossier shows "CLIQUE" metric

### Production Recommendations

1. **Implement fraud detection** for gaming attempts
2. **Add decay** for inactive accounts
3. **Weight by connection quality** not just quantity
4. **Consider ML-based scoring** for sophistication

---

## 8. Moments System

### Concept

"Moments" are **5-15 second videos anchored to specific locations**. They're only visible to users who are physically nearby (within ~500m).

### Database Schema

```sql
moments (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id),
  video_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  location_lat REAL,
  location_lng REAL,
  location_name TEXT,
  duration_seconds INTEGER DEFAULT 10,
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

moment_views (
  id VARCHAR PRIMARY KEY,
  moment_id VARCHAR REFERENCES moments(id),
  viewer_id VARCHAR REFERENCES users(id),
  viewed_at TIMESTAMP
)
```

### Current Implementation Status

**Frontend:** `MomentsScreen.tsx` exists with empty state handling

**Backend:** API endpoints exist but video upload not fully implemented

### Production Requirements

1. **Video upload** to cloud storage (S3, Cloudinary, etc.)
2. **Thumbnail generation** from video
3. **Geofencing** for visibility radius
4. **Auto-expiration** (24-48 hours)
5. **Content moderation** pipeline

---

## 9. Technical Architecture

### Directory Structure

```
/
├── client/                    # Expo/React Native app
│   ├── App.tsx               # Entry point with providers
│   ├── screens/              # Screen components
│   │   ├── MapScreen.tsx     # Nearby Mode (main)
│   │   ├── ARScreen.tsx      # AR scanning
│   │   ├── MomentsScreen.tsx # Local moments
│   │   ├── DiscoverScreen.tsx# Venue discovery
│   │   ├── ProfileScreen.tsx # User profile
│   │   ├── HandshakeScreen.tsx# Connections
│   │   ├── PrivacyScreen.tsx # Privacy settings
│   │   └── HelpScreen.tsx    # Help/FAQ
│   ├── components/           # Reusable UI components
│   ├── navigation/           # React Navigation config
│   ├── hooks/                # Custom React hooks
│   ├── constants/            # Theme, config
│   ├── lib/                  # Utilities (storage, query)
│   ├── data/                 # Mock data
│   └── types/                # TypeScript types
├── server/                   # Express backend
│   ├── index.ts             # Server entry
│   ├── routes.ts            # API routes
│   └── storage.ts           # Database operations
├── shared/                   # Shared between client/server
│   └── schema.ts            # Drizzle ORM schema
├── assets/                   # Static assets
├── design_guidelines.md      # Design system
└── replit.md                # Project documentation
```

### Navigation Structure

```
RootStackNavigator
├── MainTabs (Tab Navigator)
│   ├── Nearby (MapScreen) - Map icon
│   ├── Moments (MomentsScreen) - Play icon  
│   ├── AR (ARScreen) - Crosshair icon
│   ├── Discover (DiscoverScreen) - Compass icon
│   └── Profile (ProfileScreen) - User icon
├── Handshake (HandshakeScreen) - Modal
├── Privacy (PrivacyScreen) - Push
└── Help (HelpScreen) - Push
```

### State Management

- **Server State:** TanStack React Query with automatic caching
- **Local State:** React hooks (useState, useReducer)
- **Persistent State:** AsyncStorage via `client/lib/storage.ts`
- **Theme State:** Context via `useTheme` hook

### Key Dependencies

```json
{
  "expo": "~54.0.25",
  "react-native": "0.76.9",
  "@tanstack/react-query": "^5.62.16",
  "react-navigation": "^7",
  "react-native-maps": "1.18.0",
  "react-native-reanimated": "~3.17.4",
  "expo-camera": "~16.1.6",
  "expo-location": "~18.1.5",
  "expo-notifications": "~0.31.2",
  "drizzle-orm": "^0.39.1"
}
```

---

## 10. Database Schema

### Tables Overview

| Table | Purpose |
|-------|---------|
| `users` | Authentication credentials |
| `profiles` | Extended user information |
| `handshakes` | Connection requests |
| `moments` | Location-anchored videos |
| `moment_views` | View tracking |
| `reputation_history` | Score changes |
| `push_tokens` | Notification tokens |

### Full Schema

Located in `shared/schema.ts` - uses Drizzle ORM with Zod validation.

### Key Relationships

```
users 1──1 profiles
users 1──n handshakes (as sender)
users 1──n handshakes (as receiver)
users 1──n moments
users 1──n moment_views
users 1──n reputation_history
users 1──n push_tokens
moments 1──n moment_views
```

### Migrations

```bash
npm run db:push       # Push schema to database
npm run db:push --force  # Force push (destructive)
```

---

## 11. API Reference

### Base URL

Development: `http://localhost:5000/api`

### Endpoints

#### Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/profiles` | Create profile |
| GET | `/profiles/:userId` | Get profile by user ID |
| PATCH | `/profiles/:userId` | Update profile |

#### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/nearby` | Get users within radius |

#### Handshakes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/handshakes` | Create handshake |
| GET | `/handshakes/pending/:userId` | Get pending for user |
| GET | `/handshakes/sent/:userId` | Get sent by user |
| GET | `/handshakes/connections/:userId` | Get connections |
| PATCH | `/handshakes/:id/accept` | Accept handshake |
| PATCH | `/handshakes/:id/decline` | Decline handshake |

#### Moments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/moments` | Create moment |
| GET | `/moments/nearby` | Get moments near location |
| POST | `/moments/:id/view` | Record moment view |

#### Venues

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/venues` | Get venues near location |

#### Reputation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reputation/:userId` | Get reputation with history |

#### Push Tokens

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/push-tokens` | Register push token |
| DELETE | `/push-tokens` | Unregister push token |

---

## 12. Component Library

### Core Components

| Component | File | Purpose |
|-----------|------|---------|
| `Button` | `Button.tsx` | Primary action button |
| `Card` | `Card.tsx` | Elevated content container |
| `ThemedText` | `ThemedText.tsx` | Theme-aware text |
| `ThemedView` | `ThemedView.tsx` | Theme-aware view |
| `EmptyState` | `EmptyState.tsx` | Empty state placeholder |

### Feature Components

| Component | File | Purpose |
|-----------|------|---------|
| `StatusToggle` | `StatusToggle.tsx` | Open/Busy status switch |
| `ReputationMeter` | `ReputationMeter.tsx` | Clique score visual |
| `InterestChip` | `InterestChip.tsx` | Interest tag pill |
| `UserNode` | `UserNode.tsx` | Map user marker |
| `VenueCard` | `VenueCard.tsx` | Venue list item |
| `MomentCard` | `MomentCard.tsx` | Moment preview |
| `HandshakeCard` | `HandshakeCard.tsx` | Handshake request |
| `SpaceSummaryCard` | `SpaceSummaryCard.tsx` | Location vibe summary |
| `FAB` | `FAB.tsx` | Floating action button |

### Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| `MapViewWrapper` | `MapViewWrapper.tsx` | Platform map abstraction |
| `HeaderTitle` | `HeaderTitle.tsx` | Custom header with logo |
| `ErrorBoundary` | `ErrorBoundary.tsx` | Error catching |
| `ErrorFallback` | `ErrorFallback.tsx` | Crash recovery UI |
| `Spacer` | `Spacer.tsx` | Layout spacing |

---

## 13. Production Transition Checklist

### Critical (Must Do)

- [ ] **Authentication:** Implement proper auth (Apple Sign-In, Google Sign-In)
- [ ] **Real AR Detection:** Replace demo profiles with actual face/proximity detection
- [ ] **Video Upload:** Implement cloud storage for Moments
- [ ] **Push Notifications:** Configure proper Expo project ID
- [ ] **Environment Variables:** Move all secrets to secure vault
- [ ] **SSL/TLS:** Ensure all API calls use HTTPS
- [ ] **Rate Limiting:** Add API rate limiting
- [ ] **Input Validation:** Sanitize all user inputs
- [ ] **Error Logging:** Implement Sentry or similar

### High Priority

- [ ] **Venue Caching:** Cache OpenStreetMap data in database
- [ ] **Paid Maps API:** Replace Overpass with Google Maps/Mapbox
- [ ] **User Search:** Implement user discovery beyond AR
- [ ] **Block/Report:** Add user safety features
- [ ] **Content Moderation:** Add moment review pipeline
- [ ] **Analytics:** Implement usage tracking
- [ ] **Performance:** Optimize bundle size and cold start

### Medium Priority

- [ ] **Onboarding:** Create first-time user tutorial
- [ ] **Profile Photos:** Cloud storage for avatars
- [ ] **Social Sharing:** Share profile/moments externally
- [ ] **Notifications:** Rich notifications with actions
- [ ] **Offline Mode:** Graceful degradation without network
- [ ] **Accessibility:** Full VoiceOver/TalkBack support

### Infrastructure

- [ ] **CI/CD:** Set up automated testing and deployment
- [ ] **Staging Environment:** Separate staging database
- [ ] **Database Backups:** Automated backup schedule
- [ ] **Monitoring:** Uptime and performance monitoring
- [ ] **CDN:** Static asset delivery
- [ ] **Load Balancing:** Handle traffic spikes

### App Store Preparation

- [ ] **App Icons:** Generate all required sizes
- [ ] **Screenshots:** Create store listing assets
- [ ] **Privacy Policy:** Required for camera/location
- [ ] **Terms of Service:** User agreement
- [ ] **Age Rating:** Appropriate content rating
- [ ] **Bundle Identifiers:** Finalize iOS/Android IDs

---

## 14. Known Issues & Technical Debt

### Current Issues

1. **Venue API Timeouts**
   - OpenStreetMap Overpass API unreliable on mobile networks
   - Fallback venues work but aren't location-specific
   - **Fix:** Cache venues or use paid API

2. **Push Notifications**
   - Requires valid Expo project ID
   - Currently shows errors in Expo Go
   - **Fix:** Configure proper project credentials

3. **AR Demo Mode**
   - Uses hardcoded demo profiles
   - No actual face/proximity detection
   - **Fix:** Integrate ML-based detection

4. **LSP Errors in routes.ts**
   - Minor TypeScript errors (non-blocking)
   - **Fix:** Add proper type annotations

### Technical Debt

1. **Mock Data:** Several features use mock data from `client/data/mockData.ts`
2. **Inline Styles:** Some components have scattered inline styles
3. **Error Handling:** Not all API calls have proper error boundaries
4. **Testing:** No unit or integration tests
5. **Documentation:** JSDoc comments incomplete

---

## 15. Future Enhancements

### Near-Term (Next Sprint)

1. **Real-time presence** - WebSocket for live user positions
2. **Chat/Messaging** - Direct messaging after handshake
3. **Event integration** - Local events from Eventbrite/Meetup
4. **Profile verification** - LinkedIn/company verification

### Medium-Term

1. **AI matching** - Smart recommendations based on interests
2. **Group handshakes** - Connect with multiple people at once
3. **Venue partnerships** - Featured locations with promotions
4. **Clique groups** - Private groups within the app

### Long-Term Vision

1. **AR glasses support** - Integrate with Apple Vision Pro, Meta Quest
2. **Enterprise mode** - Conference/workplace networking
3. **API platform** - Third-party venue integrations
4. **International expansion** - Multi-language, regional features

---

## Quick Reference

### Start Development

```bash
# Start backend
npm run server:dev

# Start frontend (separate terminal)
npm run expo:dev
```

### Database Commands

```bash
npm run db:push        # Sync schema
npm run db:push --force  # Force sync
```

### Key Files to Modify

| Feature | Files |
|---------|-------|
| Theme/Colors | `client/constants/theme.ts` |
| AR Interface | `client/screens/ARScreen.tsx` |
| Map/Nearby | `client/screens/MapScreen.tsx` |
| API Routes | `server/routes.ts` |
| Database | `shared/schema.ts`, `server/storage.ts` |
| Navigation | `client/navigation/` |

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Session encryption key |
| `EXPO_PUBLIC_DOMAIN` | API base URL for client |

---

*This document should be updated as the project evolves. Last comprehensive review: January 2026.*
