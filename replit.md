# Bumpr

## Overview

Bumpr is a mobile-first social app that creates an AI-powered information layer for physical spaces. It enables real-world social connection through location-based discovery, AR Moments (short-form videos anchored to locations), and a handshake-based profile unlock system. The app is built with Expo/React Native for cross-platform mobile development and Express for the backend API.

Key features include:
- **Nearby Mode**: Real-time spatial awareness showing people nearby as contextual nodes with distance bands
- **AR Moments**: 5-15 second videos tied to specific locations, visible only to people nearby
- **Handshake System**: Mutual consent required to unlock full profiles
- **Clique Reputation**: Trust score based on verified interactions and behavioral patterns
- **Status Toggle**: Users can set themselves as "open" or "busy" for connections

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React Native/Expo)

The client is built with Expo SDK 54 and React Navigation for a native mobile experience:

- **Navigation**: Native stack navigator for screen transitions with bottom tab navigator for main sections (Map, Moments, Discover, Profile)
- **State Management**: TanStack React Query for server state, React hooks for local state
- **Animations**: React Native Reanimated for fluid, performant animations
- **Theming**: Custom hook-based theme system supporting light/dark modes with warm coral-peach color palette
- **Maps**: react-native-maps with platform-specific fallbacks (web shows placeholder grid)
- **Storage**: AsyncStorage for persisting user data, settings, and local moments

Path aliases configured:
- `@/` → `./client/`
- `@shared/` → `./shared/`

### Backend (Express)

Simple Express server handling API routes:

- **Routes**: Defined in `server/routes.ts` with venue generation based on user location
- **Storage**: Currently using in-memory storage (`MemStorage` class) for user data
- **Database Schema**: Drizzle ORM schema defined in `shared/schema.ts` with PostgreSQL dialect configured
- **CORS**: Dynamic origin handling for Replit domains and localhost development

### Shared Code

The `shared/` directory contains code used by both client and server:
- `schema.ts`: Drizzle database schema with Zod validation via drizzle-zod

### Design System

Following guidelines in `design_guidelines.md`:
- **Colors**: Warm coral primary (#E8785A), sage green secondary (#7BB369), cream background (#FBF9F7)
- **Typography**: Inter font family with defined hierarchy (largeTitle, h1-h4, body, small, caption)
- **Components**: Button, Card, InterestChip, ReputationMeter, StatusToggle, UserNode, VenueCard, MomentCard
- **Spacing/Shadows**: Consistent spacing scale and elevation-based shadows defined in theme constants

### Key Design Patterns

1. **Permission-first flows**: Location and camera permissions requested contextually with clear value propositions
2. **Haptic feedback**: Consistent haptic responses for user interactions via expo-haptics
3. **Animated interactions**: Spring-based animations for press states and transitions
4. **Platform-specific components**: Separate implementations for native maps vs web fallback

## External Dependencies

### Mobile/Expo Packages
- **expo-location**: User location for nearby features and moment anchoring
- **expo-camera**: Recording AR Moments
- **react-native-maps**: Map display for Nearby Mode
- **expo-haptics**: Tactile feedback
- **expo-blur**: iOS blur effects for navigation
- **expo-linear-gradient**: Gradient overlays

### Data & State
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Database ORM with PostgreSQL dialect
- **@react-native-async-storage/async-storage**: Local persistence

### Backend
- **express**: HTTP server framework
- **pg**: PostgreSQL client (database URL expected in `DATABASE_URL` env var)
- **http-proxy-middleware**: Development proxy handling

### Build & Development
- **drizzle-kit**: Database migrations (`npm run db:push`)
- **tsx**: TypeScript execution for development server
- **esbuild**: Production server bundling