import React, { useState } from "react";
import { View, StyleSheet, Image, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { ReputationMeter } from "@/components/ReputationMeter";
import { InterestChip } from "@/components/InterestChip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { NEARBY_USERS } from "@/data/mockData";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface UserProfileScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, "UserProfile">;
}

export default function UserProfileScreen({ navigation, route }: UserProfileScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const user = NEARBY_USERS.find((u) => u.id === route.params.userId) || NEARBY_USERS[0];
  const [hasHandshake, setHasHandshake] = useState(user.hasHandshake);

  const handleSendHandshake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHasHandshake(true);
  };

  const avatarImage = user.avatarPreset === 1
    ? require("../../assets/images/avatar-preset-1.png")
    : require("../../assets/images/avatar-preset-2.png");

  const getDistanceLabel = () => {
    switch (user.distanceBand) {
      case "close":
        return "Very close to you";
      case "near":
        return "Nearby";
      case "far":
        return "In the area";
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.profileHeader}
      >
        <View style={styles.avatarContainer}>
          <Image source={avatarImage} style={styles.avatar} />
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  user.status === "open" ? theme.statusOpen : theme.statusBusy,
              },
            ]}
          />
        </View>

        <ThemedText type="h1">{user.displayName}</ThemedText>

        <View style={styles.metaRow}>
          <View style={[styles.metaBadge, { backgroundColor: `${theme.primary}15` }]}>
            <Feather name="map-pin" size={14} color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.primary }}>
              {getDistanceLabel()}
            </ThemedText>
          </View>
          <View
            style={[
              styles.metaBadge,
              {
                backgroundColor:
                  user.status === "open"
                    ? `${theme.statusOpen}15`
                    : `${theme.statusBusy}15`,
              },
            ]}
          >
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    user.status === "open" ? theme.statusOpen : theme.statusBusy,
                },
              ]}
            />
            <ThemedText
              type="small"
              style={{
                color: user.status === "open" ? theme.statusOpen : theme.statusBusy,
              }}
            >
              {user.status === "open" ? "Open to talk" : "Busy"}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {hasHandshake ? (
        <>
          <Animated.View
            entering={FadeInUp.delay(100).duration(400)}
            style={[
              styles.section,
              { backgroundColor: theme.backgroundDefault },
              Shadows.card,
            ]}
          >
            <ReputationMeter score={user.reputation} size="medium" />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(200).duration(400)}
            style={[
              styles.section,
              { backgroundColor: theme.backgroundDefault },
              Shadows.card,
            ]}
          >
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              Interests
            </ThemedText>
            <View style={styles.interestsGrid}>
              {user.interests.map((interest) => (
                <InterestChip
                  key={interest.id}
                  label={interest.name}
                  isShared={user.sharedInterests.includes(interest.name)}
                />
              ))}
            </View>
            {user.sharedInterests.length > 0 && (
              <View
                style={[
                  styles.sharedBadge,
                  { backgroundColor: `${theme.secondary}15`, marginTop: Spacing.md },
                ]}
              >
                <Feather name="users" size={14} color={theme.secondary} />
                <ThemedText
                  type="small"
                  style={{ color: theme.secondary, fontWeight: "500" }}
                >
                  {user.sharedInterests.length} shared with you
                </ThemedText>
              </View>
            )}
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(300).duration(400)}
            style={[
              styles.section,
              { backgroundColor: theme.backgroundDefault },
              Shadows.card,
            ]}
          >
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              AI Conversation Starters
            </ThemedText>
            <View style={styles.promptsContainer}>
              <View style={[styles.prompt, { backgroundColor: `${theme.primary}10` }]}>
                <Feather name="message-circle" size={16} color={theme.primary} />
                <ThemedText type="body" style={{ flex: 1 }}>
                  "I see you're into {user.interests[0]?.name}. What got you started?"
                </ThemedText>
              </View>
              <View style={[styles.prompt, { backgroundColor: `${theme.primary}10` }]}>
                <Feather name="message-circle" size={16} color={theme.primary} />
                <ThemedText type="body" style={{ flex: 1 }}>
                  "Have you been to any good {user.interests[1]?.name} events lately?"
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        </>
      ) : (
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={[
            styles.lockedSection,
            { backgroundColor: theme.backgroundDefault },
            Shadows.card,
          ]}
        >
          <Feather name="lock" size={32} color={theme.textSecondary} />
          <ThemedText type="h4">Profile Locked</ThemedText>
          <ThemedText
            type="body"
            style={{ color: theme.textSecondary, textAlign: "center" }}
          >
            Send a handshake to unlock {user.displayName}'s full profile and get AI-powered conversation prompts.
          </ThemedText>

          <View style={styles.previewSection}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Interests Preview
            </ThemedText>
            <View style={styles.interestsGrid}>
              {user.interests.slice(0, 2).map((interest) => (
                <InterestChip key={interest.id} label={interest.name} size="small" />
              ))}
              <View style={[styles.moreChip, { backgroundColor: `${theme.textSecondary}15` }]}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  +{user.interests.length - 2} more
                </ThemedText>
              </View>
            </View>
          </View>

          <Button onPress={handleSendHandshake} style={{ marginTop: Spacing.lg, width: "100%" }}>
            <View style={styles.buttonContent}>
              <Feather name="user-plus" size={18} color="#FFF" />
              <ThemedText type="body" style={{ color: "#FFF", fontWeight: "600" }}>
                Send Handshake
              </ThemedText>
            </View>
          </Button>
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  statusDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  sharedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: "flex-start",
  },
  promptsContainer: {
    gap: Spacing.md,
  },
  prompt: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  lockedSection: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.md,
  },
  previewSection: {
    width: "100%",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  moreChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
});
