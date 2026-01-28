import React, { useState, useEffect, useCallback } from "react";
import { FlatList, View, StyleSheet, RefreshControl, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { MomentCard } from "@/components/MomentCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { storage } from "@/lib/storage";
import type { Moment } from "@/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface MomentsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function MomentsScreen({ navigation }: MomentsScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [moments, setMoments] = useState<Moment[]>([]);
  const [locationName, setLocationName] = useState<string>("Your Area");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadMoments();
      fetchLocationName();
    }, [])
  );

  const loadMoments = async () => {
    const storedMoments = await storage.getMoments();
    // Sort by creation date, newest first
    const sorted = storedMoments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setMoments(sorted);
  };

  const fetchLocationName = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        setUserLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
        
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          setLocationName(place.city || place.subregion || place.region || "Your Area");
        }
      }
    } catch (error) {
      console.log("Location error:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMoments();
    await fetchLocationName();
    setRefreshing(false);
  };

  const handleCreateMoment = () => {
    navigation.navigate("CreateMoment");
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        setUserLocation({ lat: results[0].latitude, lng: results[0].longitude });
        setLocationName(searchQuery);
        // In a real app, we'd fetch moments from this location via API
      }
    } catch (error) {
      console.log("Geocode error:", error);
    }
  };

  // Filter moments by proximity (in a real app, this would be done server-side)
  const nearbyMoments = moments.filter((moment) => {
    if (!userLocation) return true;
    
    // Calculate distance (simplified)
    const latDiff = Math.abs(moment.location.latitude - userLocation.lat);
    const lngDiff = Math.abs(moment.location.longitude - userLocation.lng);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // rough meters
    
    return distance <= moment.visibilityRadius;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundDefault },
          Shadows.card,
        ]}
      >
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search locations..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchLocation}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      <View style={[styles.locationBadge, { backgroundColor: `${theme.primary}15` }]}>
        <Feather name="map-pin" size={14} color={theme.primary} />
        <ThemedText type="small" style={{ color: theme.primary, fontWeight: "500" }}>
          {locationName}
        </ThemedText>
      </View>

      <View style={styles.titleRow}>
        <ThemedText type="h3">AR Moments</ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {nearbyMoments.length} nearby
        </ThemedText>
      </View>
    </View>
  );

  const handleViewMoment = (momentId: string) => {
    navigation.navigate("ViewMoment", { momentId });
  };

  const renderMoment = ({ item, index }: { item: Moment; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
      <MomentCard moment={item} onPress={() => handleViewMoment(item.id)} />
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyState
        image={require("../../assets/images/empty-moments.png")}
        title="No moments here yet"
        description={`Be the first to share what's happening in ${locationName}`}
      />
      <Button onPress={handleCreateMoment} style={styles.createButton}>
        Create Moment
      </Button>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={nearbyMoments}
        keyExtractor={(item) => item.id}
        renderItem={renderMoment}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB for creating moment */}
      <Pressable
        style={[styles.fab, { backgroundColor: theme.primary, bottom: tabBarHeight + Spacing.lg }, Shadows.fab]}
        onPress={handleCreateMoment}
      >
        <Feather name="plus" size={24} color="#FFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.full,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing["3xl"],
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
