import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface HandshakeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function HandshakeScreen({ navigation }: HandshakeScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.content, { paddingTop: headerHeight + Spacing.xl }]}>
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <ThemedText type="h2" style={{ textAlign: "center" }}>
            Ready to Connect
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            When someone is nearby, you can send them a handshake to unlock each other's profiles
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.illustrationSection}
        >
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: `${theme.primary}30` },
              pulseStyle,
            ]}
          />
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.backgroundDefault },
              Shadows.float,
            ]}
          >
            <LinearGradient
              colors={[theme.primary, theme.secondary]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="users" size={48} color="#FFF" />
            </LinearGradient>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
        >
          <View style={styles.infoRow}>
            <View style={[styles.infoBadge, { backgroundColor: `${theme.primary}15` }]}>
              <Feather name="eye-off" size={16} color={theme.primary} />
            </View>
            <View style={styles.infoText}>
              <ThemedText type="body" style={{ fontWeight: "500" }}>
                Anonymous First
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Only interests are visible before connecting
              </ThemedText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.infoRow}>
            <View style={[styles.infoBadge, { backgroundColor: `${theme.secondary}15` }]}>
              <Feather name="check-circle" size={16} color={theme.secondary} />
            </View>
            <View style={styles.infoText}>
              <ThemedText type="body" style={{ fontWeight: "500" }}>
                Mutual Consent
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Both must accept to unlock profiles
              </ThemedText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.infoRow}>
            <View style={[styles.infoBadge, { backgroundColor: `${theme.warning}15` }]}>
              <Feather name="clock" size={16} color={theme.warning} />
            </View>
            <View style={styles.infoText}>
              <ThemedText type="body" style={{ fontWeight: "500" }}>
                Proximity Required
              </ThemedText>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                Must be nearby to initiate connection
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(400)}
          style={[styles.emptyCard, { backgroundColor: `${theme.textSecondary}10` }]}
        >
          <Feather name="users" size={24} color={theme.textSecondary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            No one nearby right now
          </ThemedText>
          <ThemedText type="caption" style={{ color: theme.textSecondary, textAlign: "center" }}>
            Check back when you're in a busier area
          </ThemedText>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(500).duration(400)}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Close
          </ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing["3xl"],
  },
  illustrationSection: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["3xl"],
  },
  pulseRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
  },
  iconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  infoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  emptyCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  cancelButton: {
    paddingVertical: Spacing.md,
  },
});
