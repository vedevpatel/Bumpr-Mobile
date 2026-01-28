import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, Pressable, Platform, Image, Linking, Dimensions, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withSpring, withRepeat, withSequence, withTiming, runOnJS } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { storage } from "@/lib/storage";
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

export default function ARScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions();
  const [scanning, setScanning] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const overlayScale = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const scanPulse = useSharedValue(1);
  const scanProgress = useSharedValue(0);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    scanPulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (selectedUser) {
      overlayScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      overlayOpacity.value = withSpring(1);
    } else {
      overlayScale.value = withSpring(0.8);
      overlayOpacity.value = withSpring(0);
    }
  }, [selectedUser]);

  const loadCurrentUser = async () => {
    const user = await storage.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const handleScan = async () => {
    if (scanning) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScanning(true);
    setNearbyUsers([]);
    setSelectedUser(null);
    
    scanProgress.value = 0;
    scanProgress.value = withTiming(1, { duration: 2500 });

    try {
      let lat = 37.4419;
      let lng = -122.143;

      if (locationPermission?.granted) {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = location.coords.latitude;
          lng = location.coords.longitude;
        } catch (e) {}
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const baseUrl = getApiUrl();
      const res = await fetch(
        new URL(`/api/users/nearby?lat=${lat}&lng=${lng}&radius=500&excludeUserId=${currentUserId || ''}`, baseUrl).toString()
      );

      if (res.ok) {
        const data = await res.json();
        setNearbyUsers(data);
        
        if (data.length > 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setSelectedUser(data[0]);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch (error) {
      console.log("Error scanning:", error);
    } finally {
      setScanning(false);
    }
  };

  const handleSelectUser = (user: NearbyUser) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUser(user);
  };

  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowProfile(!showProfile);
  };

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUser(null);
    setShowProfile(false);
  };

  const handleSendHandshake = async () => {
    if (!selectedUser || !currentUserId) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    try {
      let lat: number | undefined;
      let lng: number | undefined;

      if (locationPermission?.granted) {
        try {
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = location.coords.latitude;
          lng = location.coords.longitude;
        } catch (e) {}
      }

      const baseUrl = getApiUrl();
      const res = await fetch(new URL("/api/handshakes", baseUrl).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: selectedUser.id,
          senderLat: lat,
          senderLng: lng,
          message: "Hey! I spotted you nearby. Let's connect!",
        }),
      });

      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Handshake Sent!",
          `Your connection request has been sent to ${selectedUser.name}. They'll be notified!`,
          [{ text: "Great!", onPress: handleDismiss }]
        );
      } else {
        const error = await res.json();
        Alert.alert("Oops!", error.message || "Couldn't send handshake. Try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: overlayScale.value }],
    opacity: overlayOpacity.value,
  }));

  const scanAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanPulse.value }],
    opacity: 2 - scanPulse.value,
  }));

  const scanProgressStyle = useAnimatedStyle(() => ({
    width: `${scanProgress.value * 100}%`,
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
      />

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}>
        <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
          <Feather 
            name={scanning ? "loader" : selectedUser ? "check-circle" : "aperture"} 
            size={16} 
            color={selectedUser ? "#4CAF50" : "#FFF"} 
          />
          <ThemedText type="small" style={{ color: "#FFF" }}>
            {scanning ? "Scanning..." : selectedUser ? `Found: ${selectedUser.name}` : "Ready to scan"}
          </ThemedText>
        </View>
        
        {nearbyUsers.length > 1 ? (
          <View style={[styles.badge, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
            <Feather name="users" size={14} color="#FFF" />
            <ThemedText type="small" style={{ color: "#FFF" }}>
              {nearbyUsers.length} nearby
            </ThemedText>
          </View>
        ) : null}
      </View>

      {scanning ? (
        <View style={styles.scanOverlay}>
          <Animated.View style={[styles.scanRing, scanAnimatedStyle, { borderColor: theme.primary }]} />
          <View style={[styles.scanCenter, { backgroundColor: `${theme.primary}40` }]}>
            <Feather name="wifi" size={40} color="#FFF" />
          </View>
          <View style={[styles.scanProgressBar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Animated.View 
              style={[styles.scanProgressFill, { backgroundColor: theme.primary }, scanProgressStyle]} 
            />
          </View>
          <ThemedText type="body" style={{ color: "#FFF", marginTop: Spacing.lg }}>
            Scanning for people nearby...
          </ThemedText>
        </View>
      ) : !selectedUser && nearbyUsers.length === 0 ? (
        <View style={styles.scanOverlay}>
          <Animated.View style={[styles.scanRing, scanAnimatedStyle, { borderColor: theme.primary }]} />
          <View style={[styles.scanCenter, { backgroundColor: `${theme.primary}30` }]}>
            <Feather name="user" size={32} color={theme.primary} />
          </View>
        </View>
      ) : null}

      {selectedUser ? (
        <Animated.View
          style={[
            styles.profileOverlay,
            overlayAnimatedStyle,
            {
              top: insets.top + 100,
              alignSelf: "center",
            },
          ]}
        >
          <Pressable onPress={handleProfilePress}>
            <View style={styles.miniProfile}>
              <Image
                source={
                  selectedUser.avatarUrl
                    ? { uri: selectedUser.avatarUrl }
                    : require("../../assets/images/avatar-preset-1.png")
                }
                style={styles.miniAvatar}
              />
              <View style={styles.miniNameContainer}>
                <ThemedText type="body" style={{ color: "#FFF", fontWeight: "700" }}>
                  {selectedUser.name}
                </ThemedText>
                <View style={styles.distanceBadge}>
                  <Feather name="map-pin" size={10} color="#FFF" />
                  <ThemedText type="caption" style={{ color: "#FFF" }}>
                    {selectedUser.distance}m away
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
                    { backgroundColor: selectedUser.status === "open" ? "#4CAF50" : theme.warning }
                  ]} />
                  <ThemedText type="small" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {selectedUser.status === "open" ? "Open to connect" : "Busy"}
                  </ThemedText>
                </View>
                <View style={[styles.scoreBadge, { backgroundColor: `${theme.secondary}30` }]}>
                  <Feather name="award" size={14} color={theme.secondary} />
                  <ThemedText type="small" style={{ color: theme.secondary, fontWeight: "600" }}>
                    {selectedUser.cliqueScore}
                  </ThemedText>
                </View>
              </View>

              {selectedUser.bio ? (
                <ThemedText type="body" style={{ color: "rgba(255,255,255,0.8)", marginTop: Spacing.md }}>
                  {selectedUser.bio}
                </ThemedText>
              ) : null}

              {selectedUser.interests && selectedUser.interests.length > 0 ? (
                <View style={styles.interestsSection}>
                  <ThemedText type="small" style={{ color: "rgba(255,255,255,0.5)", marginBottom: Spacing.sm }}>
                    Interests
                  </ThemedText>
                  <View style={styles.interestsList}>
                    {selectedUser.interests.slice(0, 4).map((interest, index) => (
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

      {nearbyUsers.length > 1 && selectedUser ? (
        <View style={[styles.userDots, { bottom: insets.bottom + 140 }]}>
          {nearbyUsers.map((user, index) => (
            <Pressable
              key={user.id}
              style={[
                styles.userDot,
                {
                  backgroundColor: user.id === selectedUser.id ? theme.primary : "rgba(255,255,255,0.5)",
                  borderColor: user.id === selectedUser.id ? "#FFF" : "transparent",
                },
              ]}
              onPress={() => handleSelectUser(user)}
            />
          ))}
        </View>
      ) : null}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 80 }]}>
        {selectedUser ? (
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
          <Pressable
            style={[
              styles.detectButton, 
              { backgroundColor: scanning ? "rgba(0,0,0,0.5)" : theme.primary },
              scanning && { opacity: 0.7 }
            ]}
            onPress={handleScan}
            disabled={scanning}
          >
            <Feather name={scanning ? "loader" : "radio"} size={24} color="#FFF" />
            <ThemedText type="body" style={{ color: "#FFF", fontWeight: "600" }}>
              {scanning ? "Scanning..." : "Scan Nearby"}
            </ThemedText>
          </Pressable>
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  scanRing: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 3,
  },
  scanCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  scanProgressBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
    marginTop: Spacing.xl,
    overflow: "hidden",
  },
  scanProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  dismissButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  detectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["3xl"],
    borderRadius: BorderRadius.full,
  },
  userDots: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  userDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
});
