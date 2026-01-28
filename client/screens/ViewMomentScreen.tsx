import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { storage } from "@/lib/storage";
import type { Moment } from "@/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

interface ViewMomentScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ ViewMoment: { momentId: string } }, "ViewMoment">;
}

export default function ViewMomentScreen({ navigation, route }: ViewMomentScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { momentId } = route.params;

  const [moment, setMoment] = useState<Moment | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    loadMoment();
  }, [momentId]);

  const loadMoment = async () => {
    const moments = await storage.getMoments();
    const found = moments.find((m) => m.id === momentId);
    if (found) {
      setMoment(found);
      const updated = { ...found, views: (found.views || 0) + 1 };
      await storage.updateMoment(updated);
    }
  };

  const player = useVideoPlayer(moment?.videoUri || "", (player) => {
    player.loop = true;
    if (moment?.videoUri) {
      player.play();
    }
  });

  useEffect(() => {
    if (player && moment?.videoUri) {
      if (isPlaying) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isPlaying, player, moment?.videoUri]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (player) {
      player.pause();
    }
    navigation.goBack();
  };

  const handlePlayPause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPlaying(!isPlaying);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const formatTimeLeft = (dateString: string) => {
    const date = new Date(dateString);
    const minutes = Math.floor((date.getTime() - Date.now()) / 1000 / 60);
    if (minutes <= 0) return "Expired";
    if (minutes < 60) return `${minutes}m left`;
    return `${Math.floor(minutes / 60)}h left`;
  };

  if (!moment) {
    return (
      <View style={[styles.container, { backgroundColor: "#000" }]}>
        <View style={styles.centered}>
          <ThemedText style={{ color: "#FFF" }}>Loading...</ThemedText>
        </View>
      </View>
    );
  }

  const avatarImage = moment.creatorAvatar === 1
    ? require("../../assets/images/avatar-preset-1.png")
    : require("../../assets/images/avatar-preset-2.png");

  const hasVideo = moment.videoUri && moment.videoUri.length > 0;

  return (
    <View style={styles.container}>
      {hasVideo ? (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      ) : (
        <LinearGradient
          colors={[theme.primary, theme.secondary]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "transparent", "transparent", "rgba(0,0,0,0.8)"]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.3, 0.7, 1]}
      />

      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.topBar, { paddingTop: insets.top + Spacing.md }]}
      >
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Feather name="x" size={24} color="#FFF" />
        </Pressable>

        <View style={styles.durationBadge}>
          <Feather name="clock" size={14} color="#FFF" />
          <ThemedText type="small" style={{ color: "#FFF", fontWeight: "600" }}>
            {formatTimeLeft(moment.expiresAt)}
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <View style={styles.creatorRow}>
          <Image source={avatarImage} style={styles.avatar} />
          <View style={styles.creatorInfo}>
            <ThemedText type="body" style={{ color: "#FFF", fontWeight: "700" }}>
              {moment.creatorName}
            </ThemedText>
            <ThemedText type="caption" style={{ color: "rgba(255,255,255,0.7)" }}>
              {formatTimeAgo(moment.createdAt)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color={theme.primary} />
          <ThemedText type="small" style={{ color: "#FFF" }}>
            {moment.location.name || "Unknown location"}
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Feather name="eye" size={16} color="rgba(255,255,255,0.7)" />
            <ThemedText type="small" style={{ color: "rgba(255,255,255,0.7)" }}>
              {moment.views || 0} views
            </ThemedText>
          </View>
          <View style={styles.stat}>
            <Feather name="radio" size={16} color="rgba(255,255,255,0.7)" />
            <ThemedText type="small" style={{ color: "rgba(255,255,255,0.7)" }}>
              {moment.visibilityRadius}m radius
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {hasVideo ? (
        <Pressable style={styles.playPauseOverlay} onPress={handlePlayPause}>
          {!isPlaying ? (
            <View style={styles.playIcon}>
              <Feather name="play" size={32} color="#FFF" />
            </View>
          ) : null}
        </Pressable>
      ) : (
        <View style={styles.playPauseOverlay}>
          <View style={styles.noVideoContainer}>
            <Feather name="video-off" size={48} color="rgba(255,255,255,0.5)" />
            <ThemedText type="body" style={{ color: "rgba(255,255,255,0.7)", marginTop: Spacing.md }}>
              Video not available
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  creatorInfo: {
    gap: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
  },
  noVideoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
