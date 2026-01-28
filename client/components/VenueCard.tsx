import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { Venue } from "@/types";

interface VenueCardProps {
  venue: Venue;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VenueCard({ venue, onPress }: VenueCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getCategoryIcon = () => {
    switch (venue.category.toLowerCase()) {
      case "cafe":
        return "coffee";
      case "co-working":
        return "briefcase";
      case "park":
        return "sun";
      case "event":
        return "calendar";
      default:
        return "map-pin";
    }
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.backgroundDefault,
          },
          Shadows.card,
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
            <Feather name={getCategoryIcon() as any} size={24} color={theme.primary} />
          </View>
          <View style={styles.headerInfo}>
            <ThemedText type="h4">{venue.name}</ThemedText>
            <View style={styles.metaRow}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {venue.category}
              </ThemedText>
              <View style={styles.dot} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {venue.distance}
              </ThemedText>
            </View>
          </View>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={14} color={theme.warning} />
            <ThemedText type="small" style={{ fontWeight: "600" }}>
              {venue.rating}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          {venue.aiSummary}
        </ThemedText>

        <View style={styles.footer}>
          <View style={[styles.activeUsers, { backgroundColor: `${theme.secondary}15` }]}>
            <View style={[styles.activeDot, { backgroundColor: venue.activeUsers > 0 ? theme.secondary : theme.textSecondary }]} />
            <ThemedText type="small" style={{ color: venue.activeUsers > 0 ? theme.secondary : theme.textSecondary, fontWeight: "500" }}>
              {venue.activeUsers} active
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#999",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeUsers: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
