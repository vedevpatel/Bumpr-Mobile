import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface MapViewWrapperProps {
  mapRef: any;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  isDark: boolean;
  showsUserLocation?: boolean;
}

export function MapViewWrapper({ mapRef, initialRegion, isDark, showsUserLocation }: MapViewWrapperProps) {
  const { theme } = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, styles.container, { backgroundColor: isDark ? "#1A1A1A" : "#F5F3F0" }]}>
      <View style={styles.grid}>
        {Array.from({ length: 100 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.gridCell,
              { borderColor: isDark ? "#2A2A2A" : "#E8E4E0" },
            ]}
          />
        ))}
      </View>
      <View style={styles.overlay}>
        <View style={[styles.userDot, { backgroundColor: theme.primary }]} />
        <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.lg }}>
          Map view available in Expo Go
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  grid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridCell: {
    width: "10%",
    height: 60,
    borderWidth: 0.5,
  },
  overlay: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  userDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#FFF",
  },
});
