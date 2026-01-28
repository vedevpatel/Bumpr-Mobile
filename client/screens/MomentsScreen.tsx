import React, { useState, useEffect } from "react";
import { FlatList, View, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function MomentsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [locationName, setLocationName] = useState<string>("Your Area");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLocationName();
  }, []);

  const fetchLocationName = async () => {
    try {
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
          setLocationName(place.city || place.subregion || place.region || "Your Area");
        }
      }
    } catch (error) {
      console.log("Location error:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLocationName();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCreateMoment = () => {
    // TODO: Open camera to create moment
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={[styles.locationBadge, { backgroundColor: `${theme.primary}15` }]}>
        <Feather name="map-pin" size={14} color={theme.primary} />
        <ThemedText type="small" style={{ color: theme.primary, fontWeight: "500" }}>
          {locationName}
        </ThemedText>
      </View>
    </View>
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
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={[]}
      keyExtractor={(item: any) => item.id}
      renderItem={() => null}
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
    marginBottom: Spacing.xl,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing["3xl"],
  },
});
