import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

export default function PrivacyScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [showDistance, setShowDistance] = useState(true);
  const [showInterests, setShowInterests] = useState(true);
  const [allowHandshakes, setAllowHandshakes] = useState(true);
  const [showOnMap, setShowOnMap] = useState(true);

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
      <Animated.View entering={FadeInDown.duration(400)}>
        <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>
          Privacy Settings
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.xl }}>
          Control what others can see about you and how you appear on Bumpr.
        </ThemedText>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={[styles.section, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
          Visibility
        </ThemedText>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="map" size={20} color={theme.textSecondary} />
            <View style={styles.settingText}>
              <ThemedText type="body">Show on Map</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Let others see you nearby
              </ThemedText>
            </View>
          </View>
          <Switch
            value={showOnMap}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowOnMap(value);
            }}
            trackColor={{ false: theme.border, true: `${theme.primary}50` }}
            thumbColor={showOnMap ? theme.primary : theme.textSecondary}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="navigation" size={20} color={theme.textSecondary} />
            <View style={styles.settingText}>
              <ThemedText type="body">Show Distance</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Others can see how far you are
              </ThemedText>
            </View>
          </View>
          <Switch
            value={showDistance}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowDistance(value);
            }}
            trackColor={{ false: theme.border, true: `${theme.primary}50` }}
            thumbColor={showDistance ? theme.primary : theme.textSecondary}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="heart" size={20} color={theme.textSecondary} />
            <View style={styles.settingText}>
              <ThemedText type="body">Show Interests</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Display your interests publicly
              </ThemedText>
            </View>
          </View>
          <Switch
            value={showInterests}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowInterests(value);
            }}
            trackColor={{ false: theme.border, true: `${theme.primary}50` }}
            thumbColor={showInterests ? theme.primary : theme.textSecondary}
          />
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={[styles.section, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
          Interactions
        </ThemedText>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="user-plus" size={20} color={theme.textSecondary} />
            <View style={styles.settingText}>
              <ThemedText type="body">Allow Handshakes</ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Receive connection requests
              </ThemedText>
            </View>
          </View>
          <Switch
            value={allowHandshakes}
            onValueChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAllowHandshakes(value);
            }}
            trackColor={{ false: theme.border, true: `${theme.primary}50` }}
            thumbColor={allowHandshakes ? theme.primary : theme.textSecondary}
          />
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={[styles.infoCard, { backgroundColor: `${theme.primary}10` }]}
      >
        <Feather name="shield" size={20} color={theme.primary} />
        <ThemedText type="small" style={{ color: theme.primary, flex: 1 }}>
          Bumpr never shares your exact location. Only distance bands are shown to others.
        </ThemedText>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
    flex: 1,
  },
  settingText: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
});
