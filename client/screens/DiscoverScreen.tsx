import React, { useState, useEffect } from "react";
import { FlatList, View, StyleSheet, TextInput, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { VenueCard } from "@/components/VenueCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { Venue } from "@/types";

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>("Your Area");

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });
        
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          const city = place.city || place.subregion || place.region || "Your Area";
          setLocationName(city);
          
          const baseUrl = getApiUrl();
          const url = new URL("/api/venues", baseUrl);
          url.searchParams.set("lat", location.coords.latitude.toString());
          url.searchParams.set("lng", location.coords.longitude.toString());
          url.searchParams.set("city", city);
          
          const response = await fetch(url.toString());
          if (response.ok) {
            const data = await response.json();
            setVenues(data);
          }
        }
      }
    } catch (error) {
      console.log("Error fetching venues:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVenues();
    setRefreshing(false);
  };

  const handleVenuePress = (venue: Venue) => {
    // TODO: Navigate to venue details
  };

  const filteredVenues = venues.filter((venue) =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderVenue = ({ item, index }: { item: Venue; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
      <VenueCard venue={item} onPress={() => handleVenuePress(item)} />
    </Animated.View>
  );

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
          placeholder="Search venues, events..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Feather
            name="x"
            size={18}
            color={theme.textSecondary}
            onPress={() => setSearchQuery("")}
          />
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.titleRow}>
          <ThemedText type="h3">Discover</ThemedText>
          <View style={[styles.locationBadge, { backgroundColor: `${theme.primary}15` }]}>
            <Feather name="map-pin" size={12} color={theme.primary} />
            <ThemedText type="caption" style={{ color: theme.primary }}>
              {locationName}
            </ThemedText>
          </View>
        </View>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {filteredVenues.length} places nearby
        </ThemedText>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
            Finding places near you...
          </ThemedText>
        </View>
      );
    }

    return (
      <EmptyState
        title="No venues found"
        description={searchQuery ? "Try a different search term" : `No venues available in ${locationName} yet`}
      />
    );
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={filteredVenues}
      keyExtractor={(item) => item.id}
      renderItem={renderVenue}
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
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.xl,
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
  stats: {
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
});
