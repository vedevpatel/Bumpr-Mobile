import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Pressable, Platform, Image, Linking, Dimensions, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withTiming, withDelay, runOnJS } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface NearbyUser {
  id: string;
  name: string;
  avatarUrl?: string;
  cliqueScore: number;
  distance: number;
  status: string;
  bio?: string;
  interests?: string[];
}

// Demo profiles for face detection simulation
const DEMO_PROFILES: NearbyUser[] = [
  {
    id: "demo-1",
    name: "Alex Chen",
    avatarUrl: undefined,
    cliqueScore: 87,
    distance: 3,
    status: "open",
    bio: "Tech enthusiast & coffee lover. Always up for interesting conversations!",
    interests: ["Photography", "AI", "Hiking", "Coffee"],
  },
  {
    id: "demo-2", 
    name: "Jordan Rivera",
    avatarUrl: undefined,
    cliqueScore: 92,
    distance: 5,
    status: "open",
    bio: "Creative director by day, musician by night. Let's collaborate!",
    interests: ["Music", "Design", "Art", "Travel"],
  },
  {
    id: "demo-3",
    name: "Sam Taylor",
    avatarUrl: undefined,
    cliqueScore: 78,
    distance: 8,
    status: "open", 
    bio: "Startup founder passionate about sustainability and innovation.",
    interests: ["Startups", "Climate", "Running", "Books"],
  },
];

export default function ARScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedUser, setDetectedUser] = useState<NearbyUser | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redetectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const overlayScale = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const scanPulse = useSharedValue(1);
  const focusRingScale = useSharedValue(0.8);
  const focusRingOpacity = useSharedValue(0);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
      if (redetectTimeoutRef.current) clearTimeout(redetectTimeoutRef.current);
    };
  }, []);

  // Pulsing scan animation
  useEffect(() => {
    scanPulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  // Profile overlay animation
  useEffect(() => {
    if (detectedUser) {
      overlayScale.value = withSpring(1, { damping: 15, stiffness: 120 });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      overlayScale.value = withSpring(0.9);
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [detectedUser]);

  // Auto-detect when camera is ready (simulating face detection)
  useEffect(() => {
    if (cameraReady && !detectedUser && !detecting) {
      startDetection();
    }
  }, [cameraReady, detectedUser, detecting]);

  const startDetection = () => {
    setDetecting(true);
    
    // Show focus ring animation
    focusRingScale.value = 0.8;
    focusRingOpacity.value = withTiming(1, { duration: 200 });
    focusRingScale.value = withSequence(
      withTiming(1, { duration: 600 }),
      withTiming(0.95, { duration: 400 })
    );

    // Simulate face detection after 1.5-2.5 seconds
    const delay = 1500 + Math.random() * 1000;
    
    detectionTimeoutRef.current = setTimeout(() => {
      // Pick next demo profile
      const profile = DEMO_PROFILES[currentDemoIndex % DEMO_PROFILES.length];
      setCurrentDemoIndex(prev => prev + 1);
      
      // Haptic feedback on detection
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Hide focus ring
      focusRingOpacity.value = withTiming(0, { duration: 200 });
      
      // Show detected profile
      setDetectedUser(profile);
      setDetecting(false);
    }, delay);
  };

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowProfile(!showProfile);
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDetectedUser(null);
    setShowProfile(false);
    
    // Re-detect after a short delay
    redetectTimeoutRef.current = setTimeout(() => {
      if (cameraReady) {
        startDetection();
      }
    }, 2000);
  };

  const handleSendHandshake = () => {
    if (!detectedUser) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      "Handshake Sent!",
      `Your connection request has been sent to ${detectedUser.name}. They'll be notified!`,
      [{ text: "Great!", onPress: handleDismiss }]
    );
  };

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: overlayScale.value }],
    opacity: overlayOpacity.value,
  }));

  const scanAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanPulse.value }],
    opacity: 0.6,
  }));

  const focusRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusRingScale.value }],
    opacity: focusRingOpacity.value,
  }));

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
            Enable camera to scan for people nearby and see their profiles in AR
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
        facing="front"
        onCameraReady={handleCameraReady}
      />

      {/* Top status bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}>
        <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <Feather 
            name={detecting ? "eye" : detectedUser ? "check-circle" : "aperture"} 
            size={16} 
            color={detectedUser ? "#4CAF50" : "#FFF"} 
          />
          <ThemedText type="small" style={{ color: "#FFF" }}>
            {detecting ? "Detecting..." : detectedUser ? `Found: ${detectedUser.name}` : "Looking for faces..."}
          </ThemedText>
        </View>
      </View>

      {/* Focus ring for detection */}
      {detecting ? (
        <View style={styles.scanOverlay} pointerEvents="none">
          <Animated.View 
            style={[
              styles.focusRing, 
              focusRingStyle,
              { borderColor: theme.primary }
            ]} 
          />
          <View style={[styles.focusCorner, styles.focusTopLeft, { borderColor: theme.primary }]} />
          <View style={[styles.focusCorner, styles.focusTopRight, { borderColor: theme.primary }]} />
          <View style={[styles.focusCorner, styles.focusBottomLeft, { borderColor: theme.primary }]} />
          <View style={[styles.focusCorner, styles.focusBottomRight, { borderColor: theme.primary }]} />
          <ThemedText type="small" style={styles.detectingText}>
            Analyzing...
          </ThemedText>
        </View>
      ) : null}

      {/* Subtle scanning indicator when idle */}
      {!detectedUser && !detecting && cameraReady ? (
        <View style={styles.scanOverlay} pointerEvents="none">
          <Animated.View style={[styles.scanRing, scanAnimatedStyle, { borderColor: theme.primary }]} />
        </View>
      ) : null}

      {detectedUser ? (
        <Animated.View
          style={[
            styles.profileOverlay,
            overlayAnimatedStyle,
            {
              top: insets.top + 120,
              alignSelf: "center",
            },
          ]}
        >
          <Pressable onPress={handleProfilePress}>
            <View style={styles.miniProfile}>
              <Image
                source={
                  detectedUser.avatarUrl
                    ? { uri: detectedUser.avatarUrl }
                    : require("../../assets/images/avatar-preset-1.png")
                }
                style={styles.miniAvatar}
              />
              <View style={styles.miniNameContainer}>
                <ThemedText type="body" style={{ color: "#FFF", fontWeight: "700" }}>
                  {detectedUser.name}
                </ThemedText>
                <View style={styles.distanceBadge}>
                  <Feather name="map-pin" size={10} color="#FFF" />
                  <ThemedText type="caption" style={{ color: "#FFF" }}>
                    {detectedUser.distance}m away
                  </ThemedText>
                </View>
              </View>
              <Feather name={showProfile ? "chevron-up" : "chevron-down"} size={20} color="#FFF" />
            </View>
          </Pressable>

          {showProfile ? (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={[styles.expandedProfile, { backgroundColor: "rgba(30,30,30,0.92)" }]}
            >
              <View style={styles.profileHeader}>
                <View style={styles.statusRow}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: detectedUser.status === "open" ? "#4CAF50" : theme.warning }
                  ]} />
                  <ThemedText type="small" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {detectedUser.status === "open" ? "Open to connect" : "Busy"}
                  </ThemedText>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: `${theme.secondary}30` }]}>
                  <Feather name="award" size={14} color={theme.secondary} />
                  <ThemedText type="small" style={{ color: theme.secondary, fontWeight: "600" }}>
                    {detectedUser.cliqueScore}
                  </ThemedText>
                </View>
              </View>

              {detectedUser.bio ? (
                <ThemedText type="body" style={{ color: "rgba(255,255,255,0.8)", marginTop: Spacing.md }}>
                  {detectedUser.bio}
                </ThemedText>
              ) : null}

              {detectedUser.interests && detectedUser.interests.length > 0 ? (
                <View style={styles.interestsSection}>
                  <ThemedText type="small" style={{ color: "rgba(255,255,255,0.5)", marginBottom: Spacing.sm }}>
                    Interests
                  </ThemedText>
                  <View style={styles.interestsList}>
                    {detectedUser.interests.slice(0, 4).map((interest, index) => (
                      <View key={index} style={[styles.interestTag, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                        <ThemedText type="caption" style={{ color: "#FFF" }}>
                          {interest}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              <Pressable
                style={[styles.connectButton, { backgroundColor: theme.primary }]}
                onPress={handleSendHandshake}
              >
                <Feather name="send" size={18} color="#FFF" />
                <ThemedText type="body" style={{ color: "#FFF", fontWeight: "600" }}>
                  Send Handshake
                </ThemedText>
              </Pressable>
            </Animated.View>
          ) : null}
        </Animated.View>
      ) : null}

      {/* Bottom dismiss button when profile is shown */}
      {detectedUser ? (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 80 }]}>
          <Pressable
            style={[styles.dismissButton, { backgroundColor: "rgba(0,0,0,0.7)" }]}
            onPress={handleDismiss}
          >
            <Feather name="x" size={20} color="#FFF" />
            <ThemedText type="small" style={{ color: "#FFF" }}>
              Dismiss
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    zIndex: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  profileOverlay: {
    position: "absolute",
    width: SCREEN_WIDTH - Spacing.lg * 2,
    maxWidth: 360,
    zIndex: 20,
  },
  miniProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  miniAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  miniNameContainer: {
    flex: 1,
    gap: 2,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  expandedProfile: {
    marginTop: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    width: "100%",
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  interestsSection: {
    marginTop: Spacing.lg,
  },
  interestsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  interestTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.lg,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
    zIndex: 10,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
  },
  focusRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    position: "absolute",
  },
  focusCorner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderWidth: 3,
  },
  focusTopLeft: {
    top: SCREEN_HEIGHT / 2 - 110,
    left: SCREEN_WIDTH / 2 - 110,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  focusTopRight: {
    top: SCREEN_HEIGHT / 2 - 110,
    right: SCREEN_WIDTH / 2 - 110,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  focusBottomLeft: {
    bottom: SCREEN_HEIGHT / 2 - 110,
    left: SCREEN_WIDTH / 2 - 110,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  focusBottomRight: {
    bottom: SCREEN_HEIGHT / 2 - 110,
    right: SCREEN_WIDTH / 2 - 110,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  detectingText: {
    color: "#FFF",
    marginTop: 130,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  dismissButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
});
