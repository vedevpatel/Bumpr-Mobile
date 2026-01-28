import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import HandshakeScreen from "@/screens/HandshakeScreen";
import UserProfileScreen from "@/screens/UserProfileScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  Handshake: undefined;
  UserProfile: { userId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Handshake"
        component={HandshakeScreen}
        options={{
          presentation: "modal",
          headerTitle: "Connect",
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          headerTitle: "Profile",
        }}
      />
    </Stack.Navigator>
  );
}
