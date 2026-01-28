import React from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { InterestChip } from "@/components/InterestChip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { NearbyUser } from "@/types";

interface UserNodeProps {
  user: NearbyUser;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function UserNode({ user, onPress }: UserNodeProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (user.status === "open") {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [user.status]);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
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

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const getDistanceLabel = () => {
    switch (user.distanceBand) {
      case "close":
        return "Very close";
      case "near":
        return "Nearby";
      case "far":
        return "In the area";
    }
  };

  const getNodeSize = () => {
    switch (user.distanceBand) {
      case "close":
        return 72;
      case "near":
        return 64;
      case "far":
        return 56;
    }
  };

  const nodeSize = getNodeSize();
  const avatarImage = user.avatarPreset === 1
    ? require("../../assets/images/avatar-preset-1.png")
    : require("../../assets/images/avatar-preset-2.png");

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.nodeWrapper}>
        {user.status === "open" && (
          <Animated.View
            style={[
              styles.pulse,
              {
                width: nodeSize + 16,
                height: nodeSize + 16,
                borderRadius: (nodeSize + 16) / 2,
                backgroundColor: `${theme.statusOpen}30`,
              },
              pulseStyle,
            ]}
          />
        )}
        <View
          style={[
            styles.node,
            {
              width: nodeSize,
              height: nodeSize,
              borderRadius: nodeSize / 2,
              backgroundColor: theme.backgroundDefault,
              borderColor: user.status === "open" ? theme.statusOpen : theme.statusBusy,
            },
            Shadows.card,
          ]}
        >
          <Image source={avatarImage} style={styles.avatar} resizeMode="cover" />
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: user.status === "open" ? theme.statusOpen : theme.statusBusy,
              },
            ]}
          />
          {user.hasHandshake && (
            <View style={[styles.handshakeBadge, { backgroundColor: theme.primary }]}>
              <Feather name="check" size={10} color="#FFF" />
            </View>
          )}
        </View>
      </View>

      <View style={styles.info}>
        <ThemedText type="small" style={{ fontWeight: "600" }}>
          {user.displayName}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {getDistanceLabel()}
        </ThemedText>
        {user.sharedInterests.length > 0 && (
          <View style={styles.sharedInterests}>
            {user.sharedInterests.slice(0, 2).map((interest) => (
              <InterestChip key={interest} label={interest} isShared size="small" />
            ))}
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: Spacing.sm,
  },
  nodeWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  pulse: {
    position: "absolute",
  },
  node: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  statusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  handshakeBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  info: {
    alignItems: "center",
    gap: 2,
  },
  sharedInterests: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
