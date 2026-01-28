import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import { useEffect } from "react";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface ReputationMeterProps {
  score: number;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

export function ReputationMeter({
  score,
  size = "medium",
  showLabel = true,
}: ReputationMeterProps) {
  const { theme } = useTheme();
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withSpring(score / 100, {
      damping: 20,
      stiffness: 100,
    });
  }, [score]);

  const getReputationLevel = () => {
    if (score >= 80) return "Trusted";
    if (score >= 60) return "Established";
    if (score >= 40) return "Growing";
    return "New";
  };

  const getReputationColor = () => {
    if (score >= 80) return theme.success;
    if (score >= 60) return theme.primary;
    if (score >= 40) return theme.warning;
    return theme.textSecondary;
  };

  const barHeight = size === "small" ? 4 : size === "medium" ? 6 : 8;
  const containerHeight = size === "small" ? 20 : size === "medium" ? 28 : 36;

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            Clique Reputation
          </ThemedText>
          <ThemedText
            type="caption"
            style={{ color: getReputationColor(), fontWeight: "600" }}
          >
            {getReputationLevel()}
          </ThemedText>
        </View>
      )}
      <View
        style={[
          styles.track,
          {
            height: barHeight,
            backgroundColor: `${theme.textSecondary}20`,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.bar,
            {
              height: barHeight,
              backgroundColor: getReputationColor(),
            },
            animatedBarStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  track: {
    width: "100%",
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  bar: {
    borderRadius: BorderRadius.full,
  },
});
