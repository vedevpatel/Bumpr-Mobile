import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Platform, Image, Dimensions, Alert } from "react-native";
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor } from "react-native-vision-camera";
import { scanFaces, type Face } from "react-native-vision-camera-face-detector";
import { runOnJS } from "react-native-worklets-core";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { getQueryFn } from "@/lib/query-client";

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

const RESEARCH_PHASES = [
  "Acquiring biometric lock...",
  "Querying Bumpr Index...",
  "Analyzing social graph...",
  "Retrieving public dossier...",
];

export default function ARScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const [scanning, setScanning] = useState(false);
  const [detectedUser, setDetectedUser] = useState<NearbyUser | null>(null);
  const [researchPhase, setResearchPhase] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phaseIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScanTime = useRef<number>(0);

  // Animation Values
  const focusRingOpacity = useSharedValue(0);
  const researchTextOpacity = useSharedValue(0);
  const dossierOpacity = useSharedValue(0);
  const dossierTranslateY = useSharedValue(20);
  const scanButtonOpacity = useSharedValue(1);

  // 1. Get Location for API
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);

  // 2. Query Real Backend
  const { data: nearbyUsers } = useQuery<NearbyUser[]>({
    queryKey: ["users/nearby", {
      lat: location?.coords.latitude,
      lng: location?.coords.longitude
    }],
    queryFn: () => getQueryFn({ on401: "returnNull" })({
      queryKey: [`users/nearby?lat=${location?.coords.latitude || 0}&lng=${location?.coords.longitude || 0}`]
    } as any),
    enabled: !!location,
  });

  // Permissions check
  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);
    };
  }, []);

  // Triggered when a face is "locked"
  const performScan = (face: Face) => {
    if (scanning || detectedUser) return;

    // Throttle scans
    const now = Date.now();
    if (now - lastScanTime.current < 2000) return;
    lastScanTime.current = now;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanning(true);
    setResearchPhase(0);

    // UI Animations
    scanButtonOpacity.value = withTiming(0, { duration: 200 });
    focusRingOpacity.value = withTiming(1, { duration: 400 });
    researchTextOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));

    // Cycle "Research" text
    let phase = 0;
    phaseIntervalRef.current = setInterval(() => {
      phase = (phase + 1) % RESEARCH_PHASES.length;
      setResearchPhase(phase);
    }, 600);

    // Simulate processing time, then result
    scanTimeoutRef.current = setTimeout(() => {
      if (phaseIntervalRef.current) clearInterval(phaseIntervalRef.current);

      // Select the "closest" user from API result (Simulating identification)
      const match = nearbyUsers && nearbyUsers.length > 0 ? nearbyUsers[0] : null;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      focusRingOpacity.value = withTiming(0, { duration: 200 });
      researchTextOpacity.value = withTiming(0, { duration: 150 });

      if (match) {
        handleUserResolved(match);
      } else {
        // No user found nearby
        setScanning(false);
        scanButtonOpacity.value = withTiming(1);
        // Optional: Alert user or just reset silently
        // Alert.alert("No Match", "No registered user found for this biometric signature.");
      }

    }, 2000); // 2 seconds of "Scanning" drama
  };

  const handleUserResolved = (profile: NearbyUser) => {
    setDetectedUser(profile);
    setScanning(false);

    setTimeout(() => {
      dossierOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.cubic) });
      dossierTranslateY.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.cubic) });
    }, 100);
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dossierOpacity.value = withTiming(0, { duration: 150 });
    dossierTranslateY.value = withTiming(20, { duration: 150 });
    setTimeout(() => {
      setDetectedUser(null);
      scanButtonOpacity.value = withTiming(1, { duration: 300 });
    }, 150);
  };

  const handleSendHandshake = () => {
    if (!detectedUser) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert("Connection Sent", `Handshake request transmitted to ${detectedUser.name}.`, [
      { text: "Done", onPress: handleDismiss }
    ]);
  };

  // 3. Real Frame Processor with MLKit
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const faces = scanFaces(frame);

    if (faces.length > 0) {
      // Logic: If face is big enough and centered
      const face = faces[0];
      // Simple heuristic: bounds should be reasonably large to ensure they are close
      // Note: check library docs for exact bounds structure, assuming { width, height, x, y }
      if (face.bounds.width > 80) {
        runOnJS(performScan)(face);
      }
    }
  }, [nearbyUsers]); // Add dependencies if needed for logic inside (though runOnJS handles external state)

  // Styles & Animations
  const focusRingStyle = useAnimatedStyle(() => ({ opacity: focusRingOpacity.value }));
  const researchTextStyle = useAnimatedStyle(() => ({ opacity: researchTextOpacity.value }));
  const dossierStyle = useAnimatedStyle(() => ({
    opacity: dossierOpacity.value,
    transform: [{ translateY: dossierTranslateY.value }]
  }));
  const scanButtonStyle = useAnimatedStyle(() => ({ opacity: scanButtonOpacity.value }));

  // Render Loading / Permission States
  if (!hasPermission) return <View style={[styles.container, styles.centered]}><ThemedText>Requesting Permissions...</ThemedText></View>;
  if (!device) return <View style={[styles.container, styles.centered]}><ThemedText>No Camera Device</ThemedText></View>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat="yuv" // Required for processing
      />

      {/* Status Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDotLive, { backgroundColor: scanning || detectedUser ? "#00FF88" : "#FF6B6B" }]} />
          <ThemedText style={styles.statusText}>
            {scanning ? "ANALYZING" : detectedUser ? "LOCKED" : "SEARCHING"}
          </ThemedText>
        </View>
      </View>

      {/* AR Overlays */}
      {scanning && (
        <View style={styles.scanOverlay} pointerEvents="none">
          <Animated.View style={[styles.focusRingContainer, focusRingStyle]}>
            <View style={styles.focusRing} />
            {/* Corners */}
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </Animated.View>

          <Animated.View style={[styles.researchContainer, researchTextStyle]}>
            <ThemedText style={styles.researchText}>{RESEARCH_PHASES[researchPhase]}</ThemedText>
          </Animated.View>
        </View>
      )}

      {/* Manual Trigger (Fallback) */}
      {!scanning && !detectedUser && (
        <Animated.View style={[styles.scanButtonContainer, { bottom: insets.bottom + 100 }, scanButtonStyle]}>
          {/* Optional manual scan button if facial detection is flaky */}
        </Animated.View>
      )}

      {/* Profile Card */}
      {detectedUser && (
        <Animated.View style={[styles.dossierContainer, { bottom: insets.bottom + 40 }, dossierStyle]}>
          <BlurView intensity={40} tint="dark" style={styles.dossierBlur}>
            <View style={styles.dossierContent}>
              <View style={styles.dossierHeader}>
                <Image source={detectedUser.avatarUrl ? { uri: detectedUser.avatarUrl } : require("../../assets/images/avatar-preset-1.png")} style={styles.dossierAvatar} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.dossierName}>{detectedUser.name}</ThemedText>
                  <ThemedText style={styles.dossierStatusText}>{detectedUser.bio || "No public bio"}</ThemedText>
                </View>
                <Pressable onPress={handleDismiss} style={{ padding: 8 }}><Feather name="x" size={20} color="white" /></Pressable>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <ThemedText style={styles.metricLabel}>DIST</ThemedText>
                  <ThemedText style={styles.metricValue}>{detectedUser.distance}m</ThemedText>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <ThemedText style={styles.metricLabel}>SCORE</ThemedText>
                  <ThemedText style={styles.metricValue}>{detectedUser.cliqueScore}</ThemedText>
                </View>
              </View>

              <Pressable style={styles.handshakeBtn} onPress={handleSendHandshake}>
                <ThemedText style={styles.handshakeBtnText}>CONNECT</ThemedText>
              </Pressable>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: { alignItems: "center", justifyContent: "center" },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", zIndex: 10 },
  statusIndicator: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  statusDotLive: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, color: "white", fontWeight: "700", opacity: 0.9 },
  scanOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  focusRingContainer: { width: 250, height: 250, alignItems: "center", justifyContent: "center" },
  focusRing: { width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: "rgba(0,255,136,0.3)" },
  corner: { position: "absolute", width: 20, height: 20, borderColor: "#00FF88", borderWidth: 2 },
  tl: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  tr: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bl: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  br: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  researchContainer: { marginTop: 32 },
  researchText: { color: "#00FF88", fontSize: 14, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  scanButtonContainer: { position: "absolute", alignSelf: "center" },
  dossierContainer: { position: "absolute", left: 16, right: 16, borderRadius: 16, overflow: "hidden" },
  dossierBlur: { padding: 0 },
  dossierContent: { padding: 16, gap: 16 },
  dossierHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  dossierAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#333" },
  dossierName: { fontSize: 18, color: "white", fontWeight: "bold" },
  dossierStatusText: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  metricsRow: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  metricItem: { alignItems: "center" },
  metricLabel: { fontSize: 10, color: "rgba(255,255,255,0.5)" },
  metricValue: { fontSize: 16, color: "white", fontWeight: "bold" },
  metricDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  handshakeBtn: { backgroundColor: "#00FF88", padding: 14, borderRadius: 8, alignItems: "center" },
  handshakeBtnText: { color: "#000", fontWeight: "bold", fontSize: 14 }
});
