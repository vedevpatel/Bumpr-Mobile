import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View, Platform, Linking } from "react-native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { Pressable } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusToggle } from "@/components/StatusToggle";
import { UserNode } from "@/components/UserNode";
import { SpaceSummaryCard } from "@/components/SpaceSummaryCard";
import { FAB } from "@/components/FAB";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { MapViewWrapper } from "@/components/MapViewWrapper";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { NEARBY_USERS, SPACE_SUMMARY, CURRENT_USER } from "@/data/mockData";
import type { UserStatus, NearbyUser } from "@/types";
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
  const [userStatus, setUserStatus] = useState<UserStatus>(CURRENT_USER.status);
  const [showSummary, setShowSummary] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [nearbyUsers] = useState<NearbyUser[]>(NEARBY_USERS);

  useEffect(() => {
    if (permission?.granted && Platform.OS !== "web") {
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).then(setLocation);
    }
  }, [permission?.granted]);

  const handleUserNodePress = (user: NearbyUser) => {
    navigation.navigate("UserProfile", { userId: user.id });
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

  if (!permission.granted && Platform.OS !== "web") {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.permissionContainer}>
          <EmptyState
            image={require("../../assets/images/onboarding-context.png")}
            title="Enable Location"
            description="Bumpr uses your location to show nearby people and AR Moments. Your exact location is never shared."
          />
          {permission.status === "denied" && !permission.canAskAgain ? (
            <Button
              onPress={async () => {
                try {
                  await Linking.openSettings();
                } catch (error) {
                  // openSettings not supported
                }
              }}
              style={styles.permissionButton}
            >
              Open Settings
            </Button>
          ) : (
            <Button onPress={requestPermission} style={styles.permissionButton}>
              Enable Location
            </Button>
          )}
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
      />

      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.topBar, { top: insets.top + Spacing.lg }]}
      >
        <View style={[styles.statusContainer, { backgroundColor: theme.backgroundDefault }, Shadows.card]}>
          <StatusToggle status={userStatus} onToggle={setUserStatus} compact />
        </View>

        <Pressable
          style={[styles.arButton, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
          onPress={() => {}}
        >
          <Feather name="layers" size={20} color={theme.primary} />
        </Pressable>
      </Animated.View>

      {nearbyUsers.length > 0 ? (
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={[styles.usersContainer, { bottom: tabBarHeight + (showSummary ? 220 : 80) }]}
        >
          {nearbyUsers.slice(0, 4).map((user, index) => (
            <Animated.View
              key={user.id}
              entering={FadeInDown.delay(300 + index * 100).duration(400).springify()}
            >
              <UserNode user={user} onPress={() => handleUserNodePress(user)} />
            </Animated.View>
          ))}
        </Animated.View>
      ) : (
        <View style={[styles.emptyContainer, { bottom: tabBarHeight + 100 }]}>
          <EmptyState
            image={require("../../assets/images/empty-nearby.png")}
            title="No one nearby"
            description="Be the first to connect in this area"
          />
        </View>
      )}

      {showSummary && (
        <View style={{ position: "absolute", bottom: tabBarHeight, left: 0, right: 0 }}>
          <SpaceSummaryCard summary={SPACE_SUMMARY} onDismiss={() => setShowSummary(false)} />
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
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["3xl"],
  },
  permissionButton: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing["3xl"],
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
  arButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  usersContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.lg,
  },
  emptyContainer: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
  },
});
