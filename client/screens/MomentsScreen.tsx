import React, { useState } from "react";
import { FlatList, View, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { MomentCard } from "@/components/MomentCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { AR_MOMENTS } from "@/data/mockData";
import type { ARMoment } from "@/types";

export default function MomentsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [moments] = useState<ARMoment[]>(AR_MOMENTS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleMomentPress = (moment: ARMoment) => {
    // Handle moment playback
  };

  const renderMoment = ({ item, index }: { item: ARMoment; index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
      <MomentCard moment={item} onPress={() => handleMomentPress(item)} />
    </Animated.View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={[styles.locationBadge, { backgroundColor: `${theme.primary}15` }]}>
        <Feather name="map-pin" size={14} color={theme.primary} />
        <ThemedText type="small" style={{ color: theme.primary, fontWeight: "500" }}>
          Downtown SF
        </ThemedText>
      </View>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
        {moments.length} moments nearby
      </ThemedText>
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-moments.png")}
      title="No moments here yet"
      description="Be the first to share what's happening in this area"
      actionLabel="Create Moment"
      onAction={() => {}}
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
      data={moments}
      keyExtractor={(item) => item.id}
      renderItem={renderMoment}
      ListHeaderComponent={moments.length > 0 ? renderHeader : null}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
});
