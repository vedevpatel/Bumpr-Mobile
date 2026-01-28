import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Pressable, Platform, Alert, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { storage } from "@/lib/storage";
import type { Moment } from "@/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface CreateMomentScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function CreateMomentScreen({ navigation }: CreateMomentScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission] = Location.useForegroundPermissions();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; name?: string } | null>(null);
  const [facing, setFacing] = useState<"front" | "back">("back");
  
  // Settings
  const [expiryHours, setExpiryHours] = useState(24);
  const [visibilityRadius, setVisibilityRadius] = useState(50);
  const [showSettings, setShowSettings] = useState(false);
  
  const recordProgress = useSharedValue(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchLocation();
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    };
  }, []);

  const fetchLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      
      let name = "Your location";
      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        name = place.street || place.district || place.city || "Your location";
      }
      
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        name,
      });
    } catch (error) {
      console.log("Location error:", error);
    }
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: `${(recordProgress.value / 15) * 100}%`,
  }));

  const startRecording = async () => {
    if (!cameraRef.current) return;
    
    setIsRecording(true);
    setRecordingDuration(0);
    recordProgress.value = 0;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    recordingInterval.current = setInterval(() => {
      setRecordingDuration((prev) => {
        const newDuration = prev + 0.1;
        recordProgress.value = withTiming(newDuration, { duration: 100 });
        
        // Auto-stop at 15 seconds (max per spec)
        if (newDuration >= 15) {
          stopRecording();
        }
        return newDuration;
      });
    }, 100);
    
    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 15,
      });
      if (video) {
        setRecordedUri(video.uri);
      }
    } catch (error) {
      console.log("Recording error:", error);
    }
  };

  const stopRecording = async () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    
    setIsRecording(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  const handleSaveMoment = async () => {
    if (!recordedUri || !location) {
      Alert.alert("Error", "Please record a video and ensure location is available.");
      return;
    }
    
    if (recordingDuration < 5) {
      Alert.alert("Too Short", "Moments must be at least 5 seconds long.");
      return;
    }
    
    const user = await storage.getUser();
    
    const moment: Moment = {
      id: `moment-${Date.now()}`,
      creatorId: user.id,
      creatorName: user.displayName,
      creatorAvatar: user.avatarPreset,
      creatorReputation: user.reputation,
      videoUri: recordedUri,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
      },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString(),
      duration: Math.round(recordingDuration),
      visibilityRadius,
      views: 0,
      completions: 0,
      engagement: 0,
    };
    
    await storage.saveMoment(moment);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    navigation.goBack();
  };

  const handleRetake = () => {
    setRecordedUri(null);
    setRecordingDuration(0);
    recordProgress.value = 0;
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  if (!cameraPermission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading camera...</ThemedText>
      </ThemedView>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.permissionContainer}>
          <Feather name="camera" size={48} color={theme.primary} />
          <ThemedText type="h3" style={{ marginTop: Spacing.lg, textAlign: "center" }}>
            Camera Access Required
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
            Enable camera to create AR Moments
          </ThemedText>
          <Button onPress={requestCameraPermission} style={{ marginTop: Spacing.xl }}>
            Enable Camera
          </Button>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      {!recordedUri ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          mode="video"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }]}>
          <View style={styles.previewPlaceholder}>
            <Feather name="video" size={48} color="#FFF" />
            <ThemedText type="h3" style={{ color: "#FFF", marginTop: Spacing.md }}>
              {Math.round(recordingDuration)}s Recorded
            </ThemedText>
          </View>
        </View>
      )}

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable
          style={[styles.topButton, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          onPress={() => navigation.goBack()}
        >
          <Feather name="x" size={24} color="#FFF" />
        </Pressable>
        
        {!recordedUri && (
          <Pressable
            style={[styles.topButton, { backgroundColor: "rgba(0,0,0,0.5)" }]}
            onPress={toggleFacing}
          >
            <Feather name="refresh-cw" size={20} color="#FFF" />
          </Pressable>
        )}
      </View>

      {/* Location indicator */}
      {location && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.locationBadge}>
          <Feather name="map-pin" size={14} color="#FFF" />
          <ThemedText type="caption" style={{ color: "#FFF" }}>
            {location.name}
          </ThemedText>
        </Animated.View>
      )}

      {/* Recording progress */}
      {isRecording && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: theme.primary }, progressStyle]} />
          </View>
          <ThemedText type="small" style={{ color: "#FFF", marginTop: Spacing.xs }}>
            {Math.round(recordingDuration)}s / 15s max
          </ThemedText>
        </View>
      )}

      {/* Bottom controls */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {recordedUri ? (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.reviewControls}>
            <Pressable style={styles.settingsToggle} onPress={() => setShowSettings(!showSettings)}>
              <Feather name="settings" size={20} color="#FFF" />
              <ThemedText type="small" style={{ color: "#FFF" }}>Settings</ThemedText>
            </Pressable>
            
            {showSettings && (
              <Animated.View entering={FadeInDown.duration(200)} style={[styles.settingsPanel, { backgroundColor: "rgba(0,0,0,0.8)" }]}>
                <View style={styles.settingItem}>
                  <ThemedText type="small" style={{ color: "#FFF" }}>
                    Expires in: {expiryHours}h
                  </ThemedText>
                  <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={1}
                    maximumValue={48}
                    step={1}
                    value={expiryHours}
                    onValueChange={setExpiryHours}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor={theme.primary}
                  />
                </View>
                
                <View style={styles.settingItem}>
                  <ThemedText type="small" style={{ color: "#FFF" }}>
                    Visible within: {visibilityRadius}m
                  </ThemedText>
                  <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={10}
                    maximumValue={100}
                    step={10}
                    value={visibilityRadius}
                    onValueChange={setVisibilityRadius}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor={theme.primary}
                  />
                </View>
              </Animated.View>
            )}
            
            <View style={styles.reviewButtons}>
              <Pressable style={[styles.reviewButton, { backgroundColor: "rgba(255,255,255,0.2)" }]} onPress={handleRetake}>
                <Feather name="refresh-cw" size={24} color="#FFF" />
                <ThemedText type="small" style={{ color: "#FFF" }}>Retake</ThemedText>
              </Pressable>
              
              <Pressable style={[styles.reviewButton, { backgroundColor: theme.primary }]} onPress={handleSaveMoment}>
                <Feather name="check" size={24} color="#FFF" />
                <ThemedText type="small" style={{ color: "#FFF" }}>Post</ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.recordControls}>
            <ThemedText type="caption" style={{ color: "#FFF", marginBottom: Spacing.md }}>
              Hold to record (5-15 seconds)
            </ThemedText>
            <Pressable
              style={[styles.recordButton, isRecording && { backgroundColor: theme.error }]}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <View style={[styles.recordInner, isRecording && styles.recordingInner]} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  locationBadge: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  progressContainer: {
    position: "absolute",
    top: 60,
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: "center",
  },
  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  recordControls: {
    alignItems: "center",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  recordInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF",
  },
  recordingInner: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#FFF",
  },
  reviewControls: {
    width: "100%",
  },
  settingsToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  settingsPanel: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  settingItem: {
    marginBottom: Spacing.md,
  },
  reviewButtons: {
    flexDirection: "row",
    gap: Spacing.lg,
    justifyContent: "center",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
});
