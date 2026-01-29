import React, { useState, useEffect, useRef, useCallback } from "react";
import { StyleSheet, View, Platform, Linking } from "react-native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusToggle } from "@/components/StatusToggle";
import { SpaceSummaryCard } from "@/components/SpaceSummaryCard";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { MapViewWrapper } from "@/components/MapViewWrapper";
import { Marker } from "react-native-maps";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { storage } from "@/lib/storage";
import type { UserStatus, SpaceSummary } from "@/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface MapScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function MapScreen({ navigation }: MapScreenProps) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const mapRef = useRef<any>(null);

  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [userStatus, setUserStatus] = useState<UserStatus>("open");
  const [showSummary, setShowSummary] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationName, setLocationName] = useState<string>("Your Area");
  const [spaceSummary, setSpaceSummary] = useState<SpaceSummary | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadUserStatus();
    }, [])
  );

  useEffect(() => {
    if (permission?.granted) {
      fetchLocation();
    }
  }, [permission?.granted]);

  const loadUserStatus = async () => {
    const user = await storage.getUser();
    if (user) {
      setUserStatus(user.status);
    }
  };

  const fetchLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(loc);

      // Animate map to user's actual location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const name = place.city || place.subregion || place.region || "Your Area";
        setLocationName(name);
        
        setSpaceSummary({
          title: name,
          description: `Explore what's happening near ${place.street || place.district || name}`,
          activeCount: 0,
          vibe: "Discovering...",
          topInterests: [],
        });
      }
    } catch (error) {
      console.log("Location error:", error);
    }
  };

  const handleStatusChange = async (status: UserStatus) => {
    setUserStatus(status);
    await storage.updateStatus(status);
  };

  const handleHandshakePress = () => {
    navigation.navigate("Handshake");
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.permissionCentered, { paddingBottom: tabBarHeight + Spacing["4xl"] }]}>
          <EmptyState
            image={require("../../assets/images/onboarding-context.png")}
            title="Enable Location"
            description="Bumpr uses your location to show nearby people and AR Moments. Your exact location is never shared."
          />
          <View style={styles.buttonContainerCentered}>
            {permission.status === "denied" && !permission.canAskAgain ? (
              Platform.OS !== "web" ? (
                <Button
                  onPress={async () => {
                    try {
                      await Linking.openSettings();
                    } catch (error) {
                      // openSettings not supported
                    }
                  }}
                >
                  Open Settings
                </Button>
              ) : (
                <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
                  Please enable location in Expo Go to use this feature.
                </ThemedText>
              )
            ) : (
              <Button onPress={requestPermission}>
                Allow Location
              </Button>
            )}
          </View>
        </View>
      </ThemedView>
    );
  }

  const defaultRegion = {
    latitude: location?.coords.latitude ?? 37.7849,
    longitude: location?.coords.longitude ?? -122.4094,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapViewWrapper
        mapRef={mapRef}
        initialRegion={defaultRegion}
        isDark={isDark}
        showsUserLocation={false}
        userCoords={location ? { latitude: location.coords.latitude, longitude: location.coords.longitude } : null}
        primaryColor={theme.primary}
      />

      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.topBar, { top: insets.top + Spacing.lg }]}
      >
        <View style={[styles.statusContainer, { backgroundColor: theme.backgroundDefault }, Shadows.card]}>
          <StatusToggle status={userStatus} onToggle={handleStatusChange} compact />
        </View>

        <View style={[styles.locationBadge, { backgroundColor: theme.backgroundDefault }, Shadows.card]}>
          <Feather name="map-pin" size={14} color={theme.primary} />
          <ThemedText type="caption" style={{ color: theme.text, fontWeight: "500" }}>
            {locationName}
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={[styles.emptyStateContainer, { bottom: tabBarHeight + (showSummary && spaceSummary ? 220 : 100) }]}
      >
        <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault }, Shadows.card]}>
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            No one else nearby yet. Be the first to connect in {locationName}!
          </ThemedText>
        </View>
      </Animated.View>

      {showSummary && spaceSummary && (
        <View style={{ position: "absolute", bottom: tabBarHeight, left: 0, right: 0 }}>
          <SpaceSummaryCard summary={spaceSummary} onDismiss={() => setShowSummary(false)} />
        </View>
      )}

      <FAB onPress={handleHandshakePress} icon="users" bottom={tabBarHeight + Spacing["4xl"]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionCentered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
  },
  buttonContainer: {
    marginTop: Spacing.xl,
    width: "100%",
    alignItems: "center",
  },
  buttonContainerCentered: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  topBar: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  emptyStateContainer: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
  },
  emptyCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
  },
});
