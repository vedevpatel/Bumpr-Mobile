import React, { useState } from "react";
import { FlatList, View, StyleSheet, TextInput, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { VenueCard } from "@/components/VenueCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { VENUES } from "@/data/mockData";
import type { Venue } from "@/types";

export default function DiscoverScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [venues] = useState<Venue[]>(VENUES);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleVenuePress = (venue: Venue) => {
    // Handle venue selection
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
        <ThemedText type="h3">Discover</ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {filteredVenues.length} places nearby
        </ThemedText>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      title="No venues found"
      description={searchQuery ? "Try a different search term" : "No venues available in this area"}
    />
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
});
