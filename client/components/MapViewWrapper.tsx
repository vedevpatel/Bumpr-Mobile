import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

interface MapViewWrapperProps {
  mapRef: React.RefObject<MapView>;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  isDark: boolean;
}

export function MapViewWrapper({ mapRef, initialRegion, isDark }: MapViewWrapperProps) {
  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={false}
      userInterfaceStyle={isDark ? "dark" : "light"}
    />
  );
}
