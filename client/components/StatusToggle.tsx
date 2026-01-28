import React, { useEffect } from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { UserStatus } from "@/types";

interface StatusToggleProps {
  status: UserStatus;
  onToggle: (status: UserStatus) => void;
  compact?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function StatusToggle({ status, onToggle, compact = false }: StatusToggleProps) {
  const { theme } = useTheme();
  const togglePosition = useSharedValue(status === "open" ? 0 : 1);

  // Sync animation with external status changes
  useEffect(() => {
    togglePosition.value = withSpring(status === "open" ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [status]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newStatus = status === "open" ? "busy" : "open";
    onToggle(newStatus);
  };

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: togglePosition.value * (compact ? 24 : 32) }],
    backgroundColor: interpolateColor(
      togglePosition.value,
      [0, 1],
      [theme.statusOpen, theme.statusBusy]
    ),
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      togglePosition.value,
      [0, 1],
      [`${theme.statusOpen}30`, `${theme.statusBusy}30`]
    ),
  }));

  return (
    <Pressable onPress={handleToggle} style={styles.container}>
      <Animated.View
        style={[
          compact ? styles.trackCompact : styles.track,
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            compact ? styles.knobCompact : styles.knob,
            knobStyle,
            Shadows.card,
          ]}
        />
      </Animated.View>
      {!compact && (
        <ThemedText
          type="small"
          style={[
            styles.label,
            { color: status === "open" ? theme.statusOpen : theme.statusBusy },
          ]}
        >
          {status === "open" ? "Open to talk" : "Busy"}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  track: {
    width: 56,
    height: 28,
    borderRadius: BorderRadius.full,
    padding: 2,
  },
  trackCompact: {
    width: 44,
    height: 24,
    borderRadius: BorderRadius.full,
    padding: 2,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
  },
  knobCompact: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
  },
  label: {
    fontWeight: "500",
  },
});
