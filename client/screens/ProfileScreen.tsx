import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Image, Pressable, ScrollView, Switch, Alert, Platform, ActionSheetIOS } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { StatusToggle } from "@/components/StatusToggle";
import { ReputationMeter } from "@/components/ReputationMeter";
import { InterestChip } from "@/components/InterestChip";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { storage } from "@/lib/storage";
import { INTERESTS } from "@/data/mockData";
import type { User, UserStatus, Interest, ThemeMode } from "@/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface ProfileScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme, themeMode, setTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [user, setUser] = useState<User | null>(null);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadSettings();
    }, [])
  );

  const loadUser = async () => {
    const userData = await storage.getUser();
    if (userData) {
      setUser(userData);
      setSelectedInterests(userData.interests);
    }
  };

  const loadSettings = async () => {
    const notifs = await storage.getNotificationsEnabled();
    setNotificationsEnabled(notifs);
    const privacy = await storage.getPrivacySettings();
    setLocationSharing(privacy.showOnMap);
  };

  const handleStatusChange = async (status: UserStatus) => {
    if (user) {
      const updatedUser = { ...user, status };
      setUser(updatedUser);
      await storage.saveUser(updatedUser);
    }
  };

  const handleInterestToggle = (interest: Interest) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedInterests((prev) => {
      const exists = prev.some((i) => i.id === interest.id);
      if (exists) {
        return prev.filter((i) => i.id !== interest.id);
      } else {
        return [...prev, interest];
      }
    });
  };

  const handleSaveInterests = async () => {
    if (user) {
      const updatedUser = { ...user, interests: selectedInterests };
      setUser(updatedUser);
      await storage.saveUser(updatedUser);
      setIsEditingInterests(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleThemeChange = async (mode: ThemeMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setTheme(mode);
  };

  const handleNotificationsChange = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationsEnabled(value);
    await storage.setNotificationsEnabled(value);
  };

  const handleLocationSharingChange = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocationSharing(value);
    const settings = await storage.getPrivacySettings();
    await storage.savePrivacySettings({ ...settings, showOnMap: value });
  };

  const handlePrivacyPress = () => {
    navigation.navigate("Privacy");
  };

  const handleHelpPress = () => {
    navigation.navigate("Help");
  };

  const handleChangeAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const options = ["Take Photo", "Choose from Library", "Remove Photo", "Cancel"];
    
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: 2,
          cancelButtonIndex: 3,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
            await takePhoto();
          } else if (buttonIndex === 1) {
            await pickImage();
          } else if (buttonIndex === 2) {
            await removePhoto();
          }
        }
      );
    } else {
      Alert.alert("Change Photo", "Choose an option", [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImage },
        { text: "Remove Photo", onPress: removePhoto, style: "destructive" },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera permission is required to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      await storage.updateAvatarUrl(uri);
      if (user) {
        setUser({ ...user, avatarUrl: uri });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Photo library permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      await storage.updateAvatarUrl(uri);
      if (user) {
        setUser({ ...user, avatarUrl: uri });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const removePhoto = async () => {
    await storage.updateAvatarUrl(null);
    if (user) {
      setUser({ ...user, avatarUrl: undefined });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await storage.clearAll();
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  const avatarSource = user.avatarUrl
    ? { uri: user.avatarUrl }
    : user.avatarPreset === 1
      ? require("../../assets/images/avatar-preset-1.png")
      : require("../../assets/images/avatar-preset-2.png");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)} style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image source={avatarSource} style={styles.avatar} />
          <Pressable
            style={[styles.editAvatarButton, { backgroundColor: theme.primary }]}
            onPress={handleChangeAvatar}
          >
            <Feather name="camera" size={14} color="#FFF" />
          </Pressable>
        </View>
        <ThemedText type="h2">{user.displayName}</ThemedText>
        {user.bio ? (
          <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
            {user.bio}
          </ThemedText>
        ) : null}
        <StatusToggle status={user.status} onToggle={handleStatusChange} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={[styles.section, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <ReputationMeter score={user.reputation} size="medium" />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={[styles.section, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <View style={styles.sectionHeader}>
          <ThemedText type="h4">Your Interests</ThemedText>
          {isEditingInterests ? (
            <Pressable onPress={handleSaveInterests}>
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                Save
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable onPress={() => setIsEditingInterests(true)}>
              <Feather name="edit-2" size={18} color={theme.primary} />
            </Pressable>
          )}
        </View>

        {isEditingInterests ? (
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest) => (
              <InterestChip
                key={interest.id}
                label={interest.name}
                isSelected={selectedInterests.some((i) => i.id === interest.id)}
                onPress={() => handleInterestToggle(interest)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.interestsGrid}>
            {user.interests.length > 0 ? (
              user.interests.map((interest) => (
                <InterestChip key={interest.id} label={interest.name} isSelected />
              ))
            ) : (
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Tap edit to add your interests
              </ThemedText>
            )}
          </View>
        )}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={[styles.section, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
          Appearance
        </ThemedText>

        <View style={styles.themeOptions}>
          {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
            <Pressable
              key={mode}
              style={[
                styles.themeOption,
                { backgroundColor: themeMode === mode ? `${theme.primary}15` : theme.backgroundSecondary },
                themeMode === mode && { borderColor: theme.primary, borderWidth: 2 },
              ]}
              onPress={() => handleThemeChange(mode)}
            >
              <Feather
                name={mode === "light" ? "sun" : mode === "dark" ? "moon" : "smartphone"}
                size={20}
                color={themeMode === mode ? theme.primary : theme.textSecondary}
              />
              <ThemedText
                type="small"
                style={{
                  color: themeMode === mode ? theme.primary : theme.textSecondary,
                  fontWeight: themeMode === mode ? "600" : "400",
                  textTransform: "capitalize",
                }}
              >
                {mode}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        style={[styles.section, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
          Settings
        </ThemedText>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="bell" size={20} color={theme.textSecondary} />
            <ThemedText type="body">Notifications</ThemedText>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsChange}
            trackColor={{ false: theme.border, true: `${theme.primary}50` }}
            thumbColor={notificationsEnabled ? theme.primary : theme.textSecondary}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="map-pin" size={20} color={theme.textSecondary} />
            <ThemedText type="body">Location Sharing</ThemedText>
          </View>
          <Switch
            value={locationSharing}
            onValueChange={handleLocationSharingChange}
            trackColor={{ false: theme.border, true: `${theme.primary}50` }}
            thumbColor={locationSharing ? theme.primary : theme.textSecondary}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Pressable
          style={({ pressed }) => [styles.settingRow, { opacity: pressed ? 0.6 : 1 }]}
          onPress={handlePrivacyPress}
        >
          <View style={styles.settingInfo}>
            <Feather name="shield" size={20} color={theme.textSecondary} />
            <ThemedText type="body">Privacy</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <Pressable
          style={({ pressed }) => [styles.settingRow, { opacity: pressed ? 0.6 : 1 }]}
          onPress={handleHelpPress}
        >
          <View style={styles.settingInfo}>
            <Feather name="help-circle" size={20} color={theme.textSecondary} />
            <ThemedText type="body">Help & Support</ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </Pressable>
      </Animated.View>

      <Pressable
        style={({ pressed }) => [styles.logoutButton, { opacity: pressed ? 0.6 : 1 }]}
        onPress={handleLogout}
      >
        <ThemedText type="body" style={{ color: theme.error }}>
          Log Out
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileHeader: {
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  section: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  themeOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  logoutButton: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginTop: Spacing.lg,
  },
});
