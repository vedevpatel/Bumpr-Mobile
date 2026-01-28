import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { StatusToggle } from "@/components/StatusToggle";
import { ReputationMeter } from "@/components/ReputationMeter";
import { InterestChip } from "@/components/InterestChip";
import { HandshakeCard } from "@/components/HandshakeCard";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { CURRENT_USER, HANDSHAKE_REQUESTS, INTERESTS } from "@/data/mockData";
import type { UserStatus, HandshakeRequest } from "@/types";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [user, setUser] = useState(CURRENT_USER);
  const [pendingRequests, setPendingRequests] = useState<HandshakeRequest[]>(HANDSHAKE_REQUESTS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleStatusChange = (status: UserStatus) => {
    setUser({ ...user, status });
  };

  const handleAcceptRequest = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const handleDeclineRequest = (requestId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const avatarImage = user.avatarPreset === 1
    ? require("../../assets/images/avatar-preset-1.png")
    : require("../../assets/images/avatar-preset-2.png");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)} style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image source={avatarImage} style={styles.avatar} />
          <Pressable
            style={[styles.editAvatarButton, { backgroundColor: theme.primary }]}
            onPress={() => {}}
          >
            <Feather name="camera" size={14} color="#FFF" />
          </Pressable>
        </View>
        <ThemedText type="h2">{user.displayName}</ThemedText>
        {user.bio ? (
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            {user.bio}
          </ThemedText>
        ) : null}
        <StatusToggle status={user.status} onToggle={handleStatusChange} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={[styles.section, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <ReputationMeter score={user.reputation} size="medium" />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={[styles.section, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <View style={styles.sectionHeader}>
          <ThemedText type="h4">Your Interests</ThemedText>
          <Pressable>
            <Feather name="edit-2" size={18} color={theme.primary} />
          </Pressable>
        </View>
        <View style={styles.interestsGrid}>
          {user.interests.map((interest) => (
            <InterestChip key={interest.id} label={interest.name} isSelected />
          ))}
        </View>
      </Animated.View>

      {pendingRequests.length > 0 && (
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <View style={styles.sectionTitleRow}>
            <ThemedText type="h4">Handshake Requests</ThemedText>
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <ThemedText type="caption" style={{ color: "#FFF", fontWeight: "600" }}>
                {pendingRequests.length}
              </ThemedText>
            </View>
          </View>
          {pendingRequests.map((request) => (
            <HandshakeCard
              key={request.id}
              request={request}
              onAccept={() => handleAcceptRequest(request.id)}
              onDecline={() => handleDeclineRequest(request.id)}
            />
          ))}
        </Animated.View>
      )}

      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        style={[styles.section, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
          Settings
        </ThemedText>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="bell" size={20} color={theme.textSecondary} />
            <ThemedText type="body">Notifications</ThemedText>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setNotificationsEnabled(value);
            }}
            trackColor={{ false: theme.border, true: `${theme.primary}50` }}
            thumbColor={notificationsEnabled ? theme.primary : theme.textSecondary}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="map-pin" size={20} color={theme.textSecondary} />
            <ThemedText type="body">Location Sharing</ThemedText>
          </View>
          <Switch
            value={locationSharing}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLocationSharing(value);
            }}
            trackColor={{ false: theme.border, true: `${theme.primary}50` }}
            thumbColor={locationSharing ? theme.primary : theme.textSecondary}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Pressable style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="shield" size={20} color={theme.textSecondary} />
            <ThemedText type="body">Privacy</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Pressable style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="help-circle" size={20} color={theme.textSecondary} />
            <ThemedText type="body">Help & Support</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </Animated.View>

      <Pressable style={styles.logoutButton}>
        <ThemedText type="body" style={{ color: theme.error }}>
          Log Out
        </ThemedText>
      </Pressable>
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
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  section: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  logoutButton: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginTop: Spacing.lg,
  },
});
