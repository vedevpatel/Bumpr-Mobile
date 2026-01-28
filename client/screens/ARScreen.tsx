import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Pressable, Platform, Image, Linking, Dimensions, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Animated, { 
  FadeIn, 
  FadeOut, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  interpolate
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
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
  affiliations?: string[];
}

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
    affiliations: ["Stanford '19", "Sequoia Capital", "YC W21"],
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
    affiliations: ["RISD", "Apple Design", "Grammy Nom."],
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
    affiliations: ["MIT", "Techstars", "Forbes 30u30"],
  },
];

const RESEARCH_PHASES = [
  "Querying social indices...",
  "Aggregating affiliations...",
  "Cross-referencing network nodes...",
  "Compiling behavioral patterns...",
  "Analyzing connection graph...",
  "Resolving identity vectors...",
];

export default function ARScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectedUser, setDetectedUser] = useState<NearbyUser | null>(null);
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);
  const [researchPhase, setResearchPhase] = useState(0);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const redetectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phaseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const focusRingOpacity = useSharedValue(0);
  const researchTextOpacity = useSharedValue(0);
  const dossierOpacity = useSharedValue(0);
  const dossierTranslateY = useSharedValue(20);

  useEffect(() => {
    return () => {
      if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
      if (redetectTimeoutRef.current) clearTimeout(redetectTimeoutRef.current);
      if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (cameraReady && !detectedUser && !detecting) {
      startDetection();
    }
  }, [cameraReady, detectedUser, detecting]);

  const startDetection = () => {
    setDetecting(true);
    setResearchPhase(0);
    
    focusRingOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    
    researchTextOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));
    
    let phase = 0;
    phaseIntervalRef.current = setInterval(() => {
      phase = (phase + 1) % RESEARCH_PHASES.length;
      setResearchPhase(phase);
    }, 400);
    
    const delay = 2000 + Math.random() * 800;
    
    detectionTimeoutRef.current = setTimeout(() => {
      if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
      
      const profile = DEMO_PROFILES[currentDemoIndex % DEMO_PROFILES.length];
      setCurrentDemoIndex(prev => prev + 1);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      focusRingOpacity.value = withTiming(0, { duration: 200 });
      researchTextOpacity.value = withTiming(0, { duration: 150 });
      
      setTimeout(() => {
        setDetectedUser(profile);
        setDetecting(false);
        
        dossierOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) });
        dossierTranslateY.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
      }, 100);
    }, delay);
  };

  const handleCameraReady = () => {
    setCameraReady(true);
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    dossierOpacity.value = withTiming(0, { duration: 150 });
    dossierTranslateY.value = withTiming(20, { duration: 150 });
    
    setTimeout(() => {
      setDetectedUser(null);
    }, 150);
    
    redetectTimeoutRef.current = setTimeout(() => {
      if (cameraReady) {
        startDetection();
      }
    }, 1500);
  };

  const handleSendHandshake = () => {
    if (!detectedUser) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      "Handshake Initiated",
      `Connection request transmitted to ${detectedUser.name}.`,
      [{ text: "Confirm", onPress: handleDismiss }]
    );
  };

  const focusRingStyle = useAnimatedStyle(() => ({
    opacity: focusRingOpacity.value,
  }));

  const researchTextStyle = useAnimatedStyle(() => ({
    opacity: researchTextOpacity.value,
  }));

  const dossierStyle = useAnimatedStyle(() => ({
    opacity: dossierOpacity.value,
    transform: [{ translateY: dossierTranslateY.value }],
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
        facing="back"
        onCameraReady={handleCameraReady}
      />

      {/* Subtle vignette overlay */}
      <View style={styles.vignetteOverlay} pointerEvents="none" />

      {/* Top status indicator */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDotLive, { backgroundColor: detecting ? "#00FF88" : detectedUser ? "#00FF88" : "#666" }]} />
          <ThemedText style={styles.statusText}>
            {detecting ? "SCANNING" : detectedUser ? "LOCKED" : "STANDBY"}
          </ThemedText>
        </View>
      </View>

      {/* Focus ring and research phase */}
      {detecting ? (
        <View style={styles.scanOverlay} pointerEvents="none">
          <Animated.View style={[styles.focusRingContainer, focusRingStyle]}>
            <View style={styles.focusRing} />
            <View style={[styles.focusCornerTL]} />
            <View style={[styles.focusCornerTR]} />
            <View style={[styles.focusCornerBL]} />
            <View style={[styles.focusCornerBR]} />
          </Animated.View>
          
          <Animated.View style={[styles.researchContainer, researchTextStyle]}>
            <ThemedText style={styles.researchText}>
              {RESEARCH_PHASES[researchPhase]}
            </ThemedText>
          </Animated.View>
        </View>
      ) : null}

      {/* Dossier Card */}
      {detectedUser ? (
        <Animated.View style={[styles.dossierContainer, dossierStyle]}>
          <BlurView intensity={80} tint="dark" style={styles.dossierBlur}>
            <View style={styles.dossierContent}>
              {/* Header with avatar and name */}
              <View style={styles.dossierHeader}>
                <Image
                  source={
                    detectedUser.avatarUrl
                      ? { uri: detectedUser.avatarUrl }
                      : require("../../assets/images/avatar-preset-1.png")
                  }
                  style={styles.dossierAvatar}
                />
                <View style={styles.dossierNameSection}>
                  <ThemedText style={styles.dossierName}>
                    {detectedUser.name}
                  </ThemedText>
                  <View style={styles.dossierStatusRow}>
                    <View style={[styles.dossierLiveDot, { backgroundColor: detectedUser.status === "open" ? "#00FF88" : "#FF6B6B" }]} />
                    <ThemedText style={styles.dossierStatusText}>
                      {detectedUser.status === "open" ? "OPEN" : "BUSY"}
                    </ThemedText>
                  </View>
                </View>
                <Pressable style={styles.dismissBtn} onPress={handleDismiss}>
                  <Feather name="x" size={18} color="rgba(255,255,255,0.6)" />
                </Pressable>
              </View>

              {/* Metrics row */}
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <ThemedText style={styles.metricLabel}>PROXIMITY</ThemedText>
                  <ThemedText style={styles.metricValue}>{detectedUser.distance}m</ThemedText>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <ThemedText style={styles.metricLabel}>CLIQUE</ThemedText>
                  <ThemedText style={styles.metricValue}>{detectedUser.cliqueScore}</ThemedText>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <ThemedText style={styles.metricLabel}>NODES</ThemedText>
                  <ThemedText style={styles.metricValue}>{detectedUser.affiliations?.length || 0}</ThemedText>
                </View>
              </View>

              {/* Source Summary (Bio) */}
              {detectedUser.bio ? (
                <View style={styles.summarySection}>
                  <ThemedText style={styles.sectionLabel}>SOURCE SUMMARY</ThemedText>
                  <ThemedText style={styles.summaryText}>
                    {detectedUser.bio}
                  </ThemedText>
                </View>
              ) : null}

              {/* Affiliations */}
              {detectedUser.affiliations && detectedUser.affiliations.length > 0 ? (
                <View style={styles.affiliationsSection}>
                  <ThemedText style={styles.sectionLabel}>AFFILIATIONS</ThemedText>
                  <View style={styles.affiliationsList}>
                    {detectedUser.affiliations.map((affiliation, index) => (
                      <View key={index} style={styles.affiliationTag}>
                        <ThemedText style={styles.affiliationText}>{affiliation}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Interests */}
              {detectedUser.interests && detectedUser.interests.length > 0 ? (
                <View style={styles.interestsSection}>
                  <ThemedText style={styles.sectionLabel}>INTERESTS</ThemedText>
                  <View style={styles.interestsList}>
                    {detectedUser.interests.slice(0, 4).map((interest, index) => (
                      <View key={index} style={styles.interestTag}>
                        <ThemedText style={styles.interestText}>{interest}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {/* Action button */}
              <Pressable style={styles.handshakeBtn} onPress={handleSendHandshake}>
                <Feather name="zap" size={18} color="#000" />
                <ThemedText style={styles.handshakeBtnText}>INITIATE HANDSHAKE</ThemedText>
              </Pressable>
            </View>
          </BlurView>
        </Animated.View>
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
  vignetteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
    borderWidth: 60,
    borderColor: "rgba(0,0,0,0.3)",
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
    zIndex: 10,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statusDotLive: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 2,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  focusRingContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  focusRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  focusCornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#FFF",
  },
  focusCornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#FFF",
  },
  focusCornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#FFF",
  },
  focusCornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#FFF",
  },
  researchContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT / 2 + 120,
    alignItems: "center",
  },
  researchText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.5,
  },
  dossierContainer: {
    position: "absolute",
    bottom: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  dossierBlur: {
    backgroundColor: "rgba(20,20,20,0.7)",
  },
  dossierContent: {
    padding: Spacing.lg,
  },
  dossierHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dossierAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  dossierNameSection: {
    flex: 1,
    gap: 4,
  },
  dossierName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    letterSpacing: 0.3,
  },
  dossierStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dossierLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dossierStatusText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1,
  },
  dismissBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  summarySection: {
    marginTop: 14,
  },
  sectionLabel: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 18,
  },
  affiliationsSection: {
    marginTop: 14,
  },
  affiliationsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  affiliationTag: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  affiliationText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
  },
  interestsSection: {
    marginTop: 14,
  },
  interestsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  interestTag: {
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  interestText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
  handshakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 6,
    marginTop: 16,
  },
  handshakeBtnText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
    letterSpacing: 1,
  },
});
