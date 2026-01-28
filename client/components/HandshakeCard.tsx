import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { InterestChip } from "@/components/InterestChip";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { HandshakeRequest } from "@/types";

interface HandshakeCardProps {
  request: HandshakeRequest;
  onAccept: () => void;
  onDecline: () => void;
}

export function HandshakeCard({ request, onAccept, onDecline }: HandshakeCardProps) {
  const { theme } = useTheme();

  const handleAccept = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onAccept();
  };

  const handleDecline = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDecline();
  };

  const avatarImage = request.fromUserAvatar === 1
    ? require("../../assets/images/avatar-preset-1.png")
    : require("../../assets/images/avatar-preset-2.png");

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <Animated.View
      entering={FadeInUp.duration(400).springify()}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        Shadows.card,
      ]}
    >
      <View style={styles.header}>
        <Image source={avatarImage} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <ThemedText type="h4">{request.fromUserName}</ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {formatTimeAgo(request.createdAt)}
          </ThemedText>
        </View>
        <Feather name="user-plus" size={24} color={theme.primary} />
      </View>

      <ThemedText type="body" style={{ color: theme.textSecondary }}>
        Wants to connect with you
      </ThemedText>

      <View style={styles.interestsSection}>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          Interests
        </ThemedText>
        <View style={styles.interestsRow}>
          {request.fromUserInterests.map((interest) => (
            <InterestChip key={interest.id} label={interest.name} size="small" />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleDecline}
          style={[styles.declineButton, { borderColor: theme.border }]}
        >
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Decline
          </ThemedText>
        </Pressable>
        <Button onPress={handleAccept} style={styles.acceptButton}>
          Accept
        </Button>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  interestsSection: {
    gap: Spacing.sm,
  },
  interestsRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    flexWrap: "wrap",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  declineButton: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptButton: {
    flex: 1,
    height: 44,
  },
});
