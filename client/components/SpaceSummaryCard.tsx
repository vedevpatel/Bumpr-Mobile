import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { InterestChip } from "@/components/InterestChip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { SpaceSummary } from "@/types";

interface SpaceSummaryCardProps {
  summary: SpaceSummary;
  onDismiss?: () => void;
}

export function SpaceSummaryCard({ summary, onDismiss }: SpaceSummaryCardProps) {
  const { theme, isDark } = useTheme();

  const CardContent = (
    <View style={styles.content}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Feather name="compass" size={20} color={theme.primary} />
          <ThemedText type="h4">{summary.title}</ThemedText>
        </View>
        {onDismiss ? (
          <Pressable onPress={onDismiss} hitSlop={10}>
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <ThemedText type="body" style={{ color: theme.textSecondary }}>
        {summary.description}
      </ThemedText>

      <View style={styles.statsRow}>
        <View style={[styles.stat, { backgroundColor: `${theme.statusOpen}15` }]}>
          <View style={[styles.liveDot, { backgroundColor: theme.statusOpen }]} />
          <ThemedText type="small" style={{ color: theme.statusOpen, fontWeight: "600" }}>
            {summary.activeCount} people nearby
          </ThemedText>
        </View>
        <View style={[styles.stat, { backgroundColor: `${theme.primary}15` }]}>
          <Feather name="zap" size={14} color={theme.primary} />
          <ThemedText type="small" style={{ color: theme.primary, fontWeight: "500" }}>
            {summary.vibe}
          </ThemedText>
        </View>
      </View>

      <View style={styles.interestsRow}>
        {summary.topInterests.map((interest) => (
          <InterestChip key={interest} label={interest} size="small" />
        ))}
      </View>
    </View>
  );

  return (
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      style={[styles.container, Shadows.float]}
    >
      {Platform.OS === "ios" ? (
        <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={styles.blur}>
          {CardContent}
        </BlurView>
      ) : (
        <View style={[styles.androidCard, { backgroundColor: theme.backgroundDefault }]}>
          {CardContent}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  blur: {
    overflow: "hidden",
    borderRadius: BorderRadius.xl,
  },
  androidCard: {
    borderRadius: BorderRadius.xl,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  interestsRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    flexWrap: "wrap",
  },
});
