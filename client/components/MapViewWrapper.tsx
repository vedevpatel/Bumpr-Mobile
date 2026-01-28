import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { Feather } from "@expo/vector-icons";

interface MapViewWrapperProps {
  mapRef: React.RefObject<MapView>;
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  isDark: boolean;
  showsUserLocation?: boolean;
  userCoords?: { latitude: number; longitude: number } | null;
  primaryColor?: string;
}

export function MapViewWrapper({ 
  mapRef, 
  initialRegion, 
  isDark, 
  showsUserLocation = false,
  userCoords,
  primaryColor = "#E8785A"
}: MapViewWrapperProps) {
  return (
    <MapView
      ref={mapRef}
      style={StyleSheet.absoluteFill}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      initialRegion={initialRegion}
      showsUserLocation={false}
      showsMyLocationButton={false}
      userInterfaceStyle={isDark ? "dark" : "light"}
    >
      {userCoords ? (
        <Marker
          coordinate={userCoords}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={[styles.userMarker, { backgroundColor: primaryColor }]}>
            <Feather name="user" size={16} color="#FFF" />
          </View>
        </Marker>
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  userMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
