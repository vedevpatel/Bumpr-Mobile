import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
}

export function MapViewWrapper({ mapRef, initialRegion, isDark }: MapViewWrapperProps) {
  const { theme } = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]}>
      <LinearGradient
        colors={[`${theme.primary}15`, `${theme.secondary}10`, theme.backgroundRoot]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.grid}>
        {Array.from({ length: 100 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.gridCell,
              { borderColor: `${theme.textSecondary}08` },
            ]}
          />
        ))}
      </View>
      <View style={styles.overlay}>
        <Feather name="map" size={48} color={`${theme.primary}40`} />
        <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
          Map view available on mobile
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F0F4F8",
  },
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
});
