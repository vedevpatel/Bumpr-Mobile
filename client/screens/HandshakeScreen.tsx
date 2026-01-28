import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useEffect } from "react";

import { ThemedText } from "@/components/ThemedText";
import { InterestChip } from "@/components/InterestChip";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { CURRENT_USER, NEARBY_USERS } from "@/data/mockData";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface HandshakeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function HandshakeScreen({ navigation }: HandshakeScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [handshakeSent, setHandshakeSent] = useState(false);
  const [selectedUser, setSelectedUser] = useState(NEARBY_USERS[0]);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleSendHandshake = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHandshakeSent(true);
    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const avatarImage = selectedUser.avatarPreset === 1
    ? require("../../assets/images/avatar-preset-1.png")
    : require("../../assets/images/avatar-preset-2.png");

  if (handshakeSent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.successContainer}
        >
          <Image
            source={require("../../assets/images/handshake-success.png")}
            style={styles.successImage}
            resizeMode="contain"
          />
          <ThemedText type="h2" style={{ textAlign: "center" }}>
            Handshake Sent!
          </ThemedText>
          <ThemedText
            type="body"
            style={{ color: theme.textSecondary, textAlign: "center" }}
          >
            {selectedUser.displayName} will be notified. You'll unlock each other's profiles when they accept.
          </ThemedText>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.content, { paddingTop: headerHeight + Spacing.xl }]}>
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          <ThemedText type="h2">Connect with</ThemedText>
          <ThemedText type="h2" style={{ color: theme.primary }}>
            {selectedUser.displayName}
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={styles.avatarSection}
        >
          <Animated.View style={[styles.pulseRing, pulseStyle, { borderColor: `${theme.primary}30` }]} />
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: theme.backgroundDefault },
              Shadows.float,
            ]}
          >
            <Image source={avatarImage} style={styles.avatar} />
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  selectedUser.status === "open" ? theme.statusOpen : theme.statusBusy,
              },
            ]}
          >
            <ThemedText type="caption" style={{ color: "#FFF", fontWeight: "600" }}>
              {selectedUser.status === "open" ? "Open to talk" : "Busy"}
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
        >
          <View style={styles.infoHeader}>
            <Feather name="eye-off" size={18} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Anonymous Preview
            </ThemedText>
          </View>

          <View style={styles.infoSection}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Interests
            </ThemedText>
            <View style={styles.interestsRow}>
              {selectedUser.interests.map((interest) => (
                <InterestChip
                  key={interest.id}
                  label={interest.name}
                  isShared={selectedUser.sharedInterests.includes(interest.name)}
                  size="small"
                />
              ))}
            </View>
          </View>

          {selectedUser.sharedInterests.length > 0 && (
            <View style={[styles.sharedBadge, { backgroundColor: `${theme.secondary}15` }]}>
              <Feather name="users" size={14} color={theme.secondary} />
              <ThemedText type="small" style={{ color: theme.secondary, fontWeight: "500" }}>
                {selectedUser.sharedInterests.length} shared interests
              </ThemedText>
            </View>
          )}

          <ThemedText
            type="caption"
            style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.md }}
          >
            Full profile unlocks after mutual handshake
          </ThemedText>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInUp.delay(400).duration(400)}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}
      >
        <Button onPress={handleSendHandshake} style={styles.handshakeButton}>
          <View style={styles.buttonContent}>
            <Feather name="user-plus" size={20} color="#FFF" />
            <ThemedText type="body" style={{ color: "#FFF", fontWeight: "600" }}>
              Send Handshake
            </ThemedText>
          </View>
        </Button>
        <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Cancel
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
    marginBottom: Spacing["3xl"],
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  pulseRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  infoCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    justifyContent: "center",
  },
  infoSection: {
    gap: Spacing.sm,
  },
  interestsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  sharedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  handshakeButton: {
    height: 56,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
    gap: Spacing.lg,
  },
  successImage: {
    width: 200,
    height: 200,
    marginBottom: Spacing.lg,
  },
});
