import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface InterestChipProps {
  label: string;
  isSelected?: boolean;
  isShared?: boolean;
  onPress?: () => void;
  size?: "small" | "medium";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function InterestChip({
  label,
  isSelected = false,
  isShared = false,
  onPress,
  size = "medium",
}: InterestChipProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = () => {
    if (isShared) return `${theme.secondary}25`;
    if (isSelected) return `${theme.primary}20`;
    return `${theme.textSecondary}15`;
  };

  const getBorderColor = () => {
    if (isShared) return theme.secondary;
    if (isSelected) return theme.primary;
    return "transparent";
  };

  const getTextColor = () => {
    if (isShared) return theme.secondary;
    if (isSelected) return theme.primary;
    return theme.textSecondary;
  };

  const ChipContent = (
    <View
      style={[
        size === "small" ? styles.chipSmall : styles.chip,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: isShared || isSelected ? 1 : 0,
        },
      ]}
    >
      <ThemedText
        type={size === "small" ? "caption" : "small"}
        style={{ color: getTextColor(), fontWeight: "500" }}
      >
        {label}
      </ThemedText>
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        {ChipContent}
      </AnimatedPressable>
    );
  }

  return ChipContent;
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  chipSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
});
