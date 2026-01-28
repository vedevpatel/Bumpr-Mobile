import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Platform, ScrollView, Image, Linking, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const HARDCODED_PROFILE = {
  name: "Erik Slote",
  username: "@erikslote69",
  location: "Palo Alto",
  following: 420,
  followers: 69,
  bio: "Aspiring entrepreneur who wants to break into the marketing industry.",
  aboutMe: [
    "Not G7",
    "Body-builder",
    "Likes to go on hikes with girls older than me",
  ],
  conversationStarters: [
    "What's up, I saw you on Bumpr Erik!",
    "Where do you like to go hike?",
    "What are your favorite lifts?",
  ],
};

export default function ARScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [faceDetected, setFaceDetected] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [scanningActive, setScanningActive] = useState(true);

  const overlayScale = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const scanPulse = useSharedValue(1);

  useEffect(() => {
    scanPulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (faceDetected) {
      overlayScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      overlayOpacity.value = withSpring(1);
    } else {
      overlayScale.value = withSpring(0.8);
      overlayOpacity.value = withSpring(0);
    }
  }, [faceDetected]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: overlayScale.value }],
    opacity: overlayOpacity.value,
  }));

  const scanAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanPulse.value }],
    opacity: 2 - scanPulse.value,
  }));

  const handleScreenTap = () => {
    if (!faceDetected) {
      setFaceDetected(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowProfile(!showProfile);
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFaceDetected(false);
    setShowProfile(false);
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.centered}>
          <ThemedText>Loading camera...</ThemedText>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.centered, { paddingHorizontal: Spacing.xl }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
            <Feather name="camera" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h3" style={{ textAlign: "center", marginTop: Spacing.xl }}>
            Camera Access Required
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
            Enable camera to use AR face detection and see profile overlays on people nearby
          </ThemedText>
          <View style={{ marginTop: Spacing.xl, width: "100%" }}>
            {permission.status === "denied" && !permission.canAskAgain ? (
              Platform.OS !== "web" ? (
                <Button
                  onPress={async () => {
                    try {
                      await Linking.openSettings();
                    } catch (error) {}
                  }}
                >
                  Open Settings
                </Button>
              ) : (
                <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
                  Run in Expo Go to use this feature
                </ThemedText>
              )
            ) : (
              <Button onPress={requestPermission}>
                Enable Camera
              </Button>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />

      <Pressable style={StyleSheet.absoluteFill} onPress={handleScreenTap} />

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}>
        <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <Feather name="aperture" size={16} color="#FFF" />
          <ThemedText type="small" style={{ color: "#FFF" }}>
            {faceDetected ? "Face Detected" : "Tap when pointing at a face"}
          </ThemedText>
        </View>
      </View>

      {!faceDetected ? (
        <View style={styles.scanOverlay}>
          <Animated.View style={[styles.scanRing, scanAnimatedStyle, { borderColor: theme.primary }]} />
          <View style={[styles.scanCenter, { backgroundColor: `${theme.primary}30` }]}>
            <Feather name="user" size={32} color={theme.primary} />
          </View>
        </View>
      ) : null}

      {faceDetected ? (
        <Animated.View
          style={[
            styles.profileOverlay,
            overlayAnimatedStyle,
            {
              top: insets.top + 100,
              left: Spacing.lg,
            },
          ]}
        >
          <Pressable onPress={handleProfilePress}>
            <View style={styles.miniProfile}>
              <Image
                source={require("../../assets/images/avatar-preset-1.png")}
                style={styles.miniAvatar}
              />
              <View style={styles.miniNameContainer}>
                <ThemedText type="body" style={{ color: "#FFF", fontWeight: "700" }}>
                  {HARDCODED_PROFILE.name}
                </ThemedText>
                <Feather name={showProfile ? "chevron-up" : "chevron-down"} size={16} color="#FFF" />
              </View>
            </View>
          </Pressable>

          {showProfile ? (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={[styles.expandedProfile, { backgroundColor: theme.backgroundDefault }]}
            >
              <View style={styles.profileHeader}>
                <View style={[styles.followButton, { backgroundColor: theme.text }]}>
                  <ThemedText type="small" style={{ color: theme.backgroundDefault, fontWeight: "600" }}>
                    Follow
                  </ThemedText>
                </View>
                <View style={styles.socialIcons}>
                  <Feather name="instagram" size={18} color={theme.textSecondary} />
                  <Feather name="linkedin" size={18} color={theme.textSecondary} />
                </View>
              </View>

              <View style={styles.userRow}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {HARDCODED_PROFILE.username}
                </ThemedText>
                <View style={styles.locationRow}>
                  <Feather name="map-pin" size={12} color={theme.textSecondary} />
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {HARDCODED_PROFILE.location}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.statsRow}>
                <ThemedText type="body">
                  <ThemedText type="body" style={{ fontWeight: "700" }}>
                    {HARDCODED_PROFILE.following}
                  </ThemedText>
                  {" Following"}
                </ThemedText>
                <ThemedText type="body">
                  <ThemedText type="body" style={{ fontWeight: "700" }}>
                    {HARDCODED_PROFILE.followers}
                  </ThemedText>
                  {" Followers"}
                </ThemedText>
              </View>

              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
                {HARDCODED_PROFILE.bio}
              </ThemedText>

              <ThemedText type="small" style={{ marginTop: Spacing.md, fontWeight: "600" }}>
                Here are some things about me:
              </ThemedText>
              {HARDCODED_PROFILE.aboutMe.map((item, index) => (
                <View key={index} style={styles.bulletRow}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {"• " + item}
                  </ThemedText>
                </View>
              ))}

              <ThemedText type="small" style={{ marginTop: Spacing.md, fontWeight: "600" }}>
                AI Conversation starters:
              </ThemedText>
              {HARDCODED_PROFILE.conversationStarters.map((starter, index) => (
                <View key={index} style={styles.bulletRow}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {"• " + starter}
                  </ThemedText>
                </View>
              ))}
            </Animated.View>
          ) : null}
        </Animated.View>
      ) : null}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {faceDetected ? (
          <Pressable
            style={[styles.dismissButton, { backgroundColor: "rgba(0,0,0,0.7)" }]}
            onPress={handleDismiss}
          >
            <Feather name="x" size={20} color="#FFF" />
            <ThemedText type="small" style={{ color: "#FFF" }}>
              Dismiss
            </ThemedText>
          </Pressable>
        ) : (
          <View style={[styles.instructionCard, { backgroundColor: "rgba(0,0,0,0.7)" }]}>
            <Feather name="info" size={16} color="#FFF" />
            <ThemedText type="small" style={{ color: "#FFF", flex: 1 }}>
              Point your camera at someone and tap to see their Bumpr profile
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  profileOverlay: {
    position: "absolute",
    maxWidth: 280,
  },
  miniProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  miniAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  miniNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  expandedProfile: {
    marginTop: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    minWidth: 260,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  followButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  socialIcons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginTop: Spacing.sm,
  },
  bulletRow: {
    marginTop: Spacing.xs,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
  },
  scanCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignSelf: "center",
  },
});
