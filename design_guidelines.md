# Bumpr Design Guidelines

## 1. Brand Identity

**Purpose:** Bumpr is real-world social infrastructure that restores context to in-person interaction. It's an AI-powered information layer for physical spaces, not social media.

**Aesthetic Direction:** Modern utility—clean, spatial, and grounded. The design feels like augmented infrastructure, not a social feed. Think map interfaces, aviation UI, and spatial computing. Minimal but purposeful. Every element earns its place.

**Memorable Element:** The AR overlay system—floating contextual nodes that make physical space readable. Natural, non-intrusive, almost invisible until needed.

## 2. Navigation Architecture

**Root Navigation:** Tab Bar (4 tabs) + Floating Action Button

- **Map** (Home) - Nearby Mode with AR overlay
- **Moments** - Local AR Moments feed (scoped to current area)
- **[FAB]** - Quick handshake/interaction
- **Profile** - User settings, reputation, preferences
- **Discover** - Explore venues, events, spaces

Auth required (Apple Sign-In primary, Google Sign-In secondary).

## 3. Screen Specifications

**Map Screen (Default Tab)**
- Purpose: Real-time spatial awareness of nearby people and context
- Layout: Full-screen map with transparent header, AR toggle button (top-right), status toggle (top-left: open/busy)
- Safe area: None (full bleed), FAB positioned bottom-center (inset: tabBarHeight + 80)
- Components: Map view, floating contextual nodes (distance-based), AI-generated space summary card (bottom sheet, dismissible)
- Empty state: Clean map with "No one nearby" text overlay

**AR Moments Screen**
- Purpose: Browse location-anchored short videos
- Layout: Vertical scrolling cards (not infinite—shows only local moments), transparent header with location indicator
- Safe area: top = insets.top + 60, bottom = tabBarHeight + 16
- Components: Video cards (5-15s), watch completion indicator, local engagement count, poster reputation badge
- Empty state: Illustration showing phone with location pin + "No moments here yet. Be the first."

**Handshake Modal**
- Purpose: Initiate mutual profile unlock
- Layout: Full-screen modal (presented from FAB), dismiss gesture, centered content
- Components: QR code / NFC tap area, anonymized preview (interests only), "Send Handshake" button
- Post-handshake: Success animation → unlocked profile view

**Profile Screen**
- Purpose: Manage reputation, settings, privacy
- Layout: Scrollable form, standard header with "Edit" button (right)
- Safe area: top = 16, bottom = tabBarHeight + 16
- Components: Avatar, display name, Clique Reputation score (visual meter, not number), interests chips, status toggle, settings sections (Privacy, Notifications, Account)
- Account deletion: Nested under Settings > Account > Delete (double confirmation alert)

**Discover Screen**
- Purpose: Explore venues, events, spaces
- Layout: Scrolling list of location cards, search bar in header
- Safe area: top = headerHeight + 16, bottom = tabBarHeight + 16
- Components: Venue cards with AI-generated summaries, event metadata, distance indicator

## 4. Color Palette

**Functional Palette** (respecting user's specified direction):
- Primary: `#5B7C99` (muted slate blue—calm, trustworthy)
- Secondary: `#7A9D54` (muted sage green—"open" status)
- Background: `#FAFBFC` (off-white, reduces eye strain)
- Surface: `#FFFFFF`
- Text Primary: `#1A2332`
- Text Secondary: `#6B7684`

**Status Colors:**
- Open: `#7A9D54` (green)
- Busy: `#8E93A1` (gray)
- AR Overlay: `#5B7C99` (blue, semi-transparent)

**Semantic:**
- Success: `#7A9D54`
- Warning: `#E8A758`
- Error: `#D85D5D`

Gradients: Soft, vertical fades (e.g., background to surface on cards). Shadows: Subtle, `shadowOpacity: 0.08`, `shadowRadius: 4`.

## 5. Typography

**Font:** Inter (Google Font)—clean, legible, modern utility feel. Fallback: System sans-serif.

**Type Scale:**
- Large Title: 34pt, Bold
- Title: 28pt, SemiBold
- Headline: 20pt, SemiBold
- Body: 16pt, Regular
- Caption: 13pt, Regular
- Label: 11pt, Medium (all caps for tags/status)

## 6. Visual Design

- Icons: Feather icons (minimal, 24px default)
- No emojis in UI
- Floating buttons (FAB, AR toggle): Use specified shadow (offset: {0, 2}, opacity: 0.10, radius: 2)
- Touchables: 50% opacity on press
- AR overlays: Frosted glass effect (blur background, 20% white overlay)

## 7. Assets to Generate

**icon.png** - App icon: Stylized location pin with radiating context lines, muted blue/green gradient. WHERE USED: Device home screen.

**splash-icon.png** - Simplified version of app icon. WHERE USED: Launch screen.

**empty-moments.png** - Illustration of phone with floating location pin, soft shadows. WHERE USED: AR Moments screen when no content available.

**empty-nearby.png** - Illustration of map with single pulsing node. WHERE USED: Map screen when no users nearby.

**handshake-success.png** - Two hands meeting with subtle glow, minimal line art. WHERE USED: Post-handshake success modal.

**avatar-preset-1.png** through **avatar-preset-4.png** - Simple geometric avatar patterns (circles, triangles, gradients). WHERE USED: Default user avatars in Profile screen.

**onboarding-context.png** - Illustration showing AR overlay concept, person in space with floating info nodes. WHERE USED: Onboarding screen explaining Nearby Mode.

**onboarding-moments.png** - Illustration of location pin with video frame. WHERE USED: Onboarding screen explaining AR Moments.

All illustrations: Muted color palette, minimal line art style, spatial/architectural feel.