import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { Moment, ARMoment } from "@/types";

interface MomentCardProps {
  moment: Moment | ARMoment;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MomentCard({ moment, onPress }: MomentCardProps) {
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

  const formatTimeAgo = (dateInput: Date | string) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const formatTimeLeft = (dateInput: Date | string) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    const minutes = Math.floor((date.getTime() - Date.now()) / 1000 / 60);
    if (minutes <= 0) return "Expiring";
    if (minutes < 60) return `${minutes}m left`;
    return `${Math.floor(minutes / 60)}h left`;
  };

  // Handle both Moment and ARMoment types
  const creatorAvatar = "creatorAvatar" in moment ? moment.creatorAvatar : 1;
  const createdAt = moment.createdAt;
  const expiresAt = moment.expiresAt;
  const watchCount = "views" in moment ? moment.views : ("watchCount" in moment ? moment.watchCount : 0);
  const engagementScore = "engagement" in moment ? moment.engagement : ("engagementScore" in moment ? moment.engagementScore : 0);
  const locationName = moment.location.name || "Unknown location";

  const avatarImage = creatorAvatar === 1
    ? require("../../assets/images/avatar-preset-1.png")
    : require("../../assets/images/avatar-preset-2.png");

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
        <View style={[styles.thumbnail, { backgroundColor: `${theme.primary}20` }]}>
          <LinearGradient
            colors={[`${theme.primary}40`, `${theme.secondary}40`]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.playButton}>
            <Feather name="play" size={24} color="#FFF" />
          </View>
          <View style={styles.durationBadge}>
            <ThemedText type="caption" style={{ color: "#FFF", fontWeight: "600" }}>
              {moment.duration}s
            </ThemedText>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.creatorRow}>
              <Image source={avatarImage} style={styles.avatar} />
              <View>
                <ThemedText type="small" style={{ fontWeight: "600" }}>
                  {moment.creatorName}
                </ThemedText>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  {formatTimeAgo(createdAt)}
                </ThemedText>
              </View>
            </View>
            <View style={[styles.expiryBadge, { backgroundColor: `${theme.warning}20` }]}>
              <Feather name="clock" size={12} color={theme.warning} />
              <ThemedText type="caption" style={{ color: theme.warning, fontWeight: "500" }}>
                {formatTimeLeft(expiresAt)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {locationName}
            </ThemedText>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Feather name="eye" size={14} color={theme.textSecondary} />
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {watchCount} views
              </ThemedText>
            </View>
            <View style={styles.stat}>
              <Feather name="trending-up" size={14} color={theme.success} />
              <ThemedText type="caption" style={{ color: theme.success }}>
                {Math.round(engagementScore * 100)}% engagement
              </ThemedText>
            </View>
          </View>
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
    overflow: "hidden",
  },
  thumbnail: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
  },
  durationBadge: {
    position: "absolute",
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  expiryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
