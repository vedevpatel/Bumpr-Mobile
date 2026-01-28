import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Pressable, FlatList, Image, Alert, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { storage } from "@/lib/storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface HandshakeScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

type TabType = "pending" | "sent" | "connections";

interface HandshakeData {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  message?: string;
  createdAt: string;
  senderProfile?: {
    name: string;
    avatarUrl?: string;
    cliqueScore: number;
    interests?: string[];
  };
  receiverProfile?: {
    name: string;
    avatarUrl?: string;
    cliqueScore: number;
    interests?: string[];
  };
  connectedProfile?: {
    name: string;
    avatarUrl?: string;
    cliqueScore: number;
    interests?: string[];
  };
}

export default function HandshakeScreen({ navigation }: HandshakeScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [pendingHandshakes, setPendingHandshakes] = useState<HandshakeData[]>([]);
  const [sentHandshakes, setSentHandshakes] = useState<HandshakeData[]>([]);
  const [connections, setConnections] = useState<HandshakeData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
    loadUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadHandshakes();
    }
  }, [userId]);

  const loadUserId = async () => {
    const user = await storage.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const loadHandshakes = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const baseUrl = getApiUrl();

      const [pendingRes, sentRes, connectionsRes] = await Promise.all([
        fetch(new URL(`/api/handshakes/pending/${userId}`, baseUrl).toString()),
        fetch(new URL(`/api/handshakes/sent/${userId}`, baseUrl).toString()),
        fetch(new URL(`/api/handshakes/connections/${userId}`, baseUrl).toString()),
      ]);

      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingHandshakes(data);
      }
      if (sentRes.ok) {
        const data = await sentRes.json();
        setSentHandshakes(data);
      }
      if (connectionsRes.ok) {
        const data = await connectionsRes.json();
        setConnections(data);
      }
    } catch (error) {
      console.log("Error loading handshakes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHandshakes();
    setRefreshing(false);
  };

  const handleRespond = async (handshakeId: string, response: "accepted" | "declined") => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      let receiverLat: number | undefined;
      let receiverLng: number | undefined;

      if (response === "accepted") {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          receiverLat = location.coords.latitude;
          receiverLng = location.coords.longitude;
        }
      }

      const baseUrl = getApiUrl();
      const res = await fetch(new URL(`/api/handshakes/${handshakeId}/respond`, baseUrl).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response, receiverLat, receiverLng }),
      });

      if (res.ok) {
        Haptics.notificationAsync(
          response === "accepted" 
            ? Haptics.NotificationFeedbackType.Success 
            : Haptics.NotificationFeedbackType.Warning
        );
        await loadHandshakes();
      } else {
        Alert.alert("Error", "Failed to respond to handshake");
      }
    } catch (error) {
      console.log("Error responding to handshake:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const getTabData = () => {
    switch (activeTab) {
      case "pending":
        return pendingHandshakes;
      case "sent":
        return sentHandshakes;
      case "connections":
        return connections;
    }
  };

  const renderEmptyState = () => {
    const messages = {
      pending: {
        title: "No pending requests",
        subtitle: "When someone sends you a handshake, it'll appear here",
      },
      sent: {
        title: "No sent requests",
        subtitle: "Send handshakes to people nearby to connect",
      },
      connections: {
        title: "No connections yet",
        subtitle: "Accept handshakes to build your network",
      },
    };

    return (
      <View style={styles.emptyState}>
        <Animated.View
          style={[
            styles.pulseRing,
            { borderColor: `${theme.primary}30` },
            pulseStyle,
          ]}
        />
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.backgroundDefault },
            Shadows.float,
          ]}
        >
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="users" size={32} color="#FFF" />
          </LinearGradient>
        </View>
        <ThemedText type="h4" style={{ marginTop: Spacing.lg }}>
          {messages[activeTab].title}
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
          {messages[activeTab].subtitle}
        </ThemedText>
      </View>
    );
  };

  const renderHandshakeItem = ({ item }: { item: HandshakeData }) => {
    const profile = activeTab === "pending" 
      ? item.senderProfile 
      : activeTab === "sent" 
        ? item.receiverProfile 
        : item.connectedProfile;

    if (!profile) return null;

    const createdDate = new Date(item.createdAt);
    const timeAgo = getTimeAgo(createdDate);

    return (
      <Animated.View
        entering={FadeInDown.duration(300)}
        style={[styles.handshakeCard, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <View style={styles.cardHeader}>
          <Image
            source={
              profile.avatarUrl
                ? { uri: profile.avatarUrl }
                : require("../../assets/images/avatar-preset-1.png")
            }
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {profile.name}
            </ThemedText>
            <View style={styles.metaRow}>
              <View style={[styles.scoreBadge, { backgroundColor: `${theme.secondary}15` }]}>
                <Feather name="award" size={12} color={theme.secondary} />
                <ThemedText type="caption" style={{ color: theme.secondary }}>
                  {profile.cliqueScore}
                </ThemedText>
              </View>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                {timeAgo}
              </ThemedText>
            </View>
          </View>
          {activeTab === "connections" ? (
            <View style={[styles.statusBadge, { backgroundColor: `${theme.secondary}15` }]}>
              <Feather name="check-circle" size={14} color={theme.secondary} />
            </View>
          ) : activeTab === "sent" ? (
            <View style={[styles.statusBadge, { backgroundColor: `${theme.warning}15` }]}>
              <Feather name="clock" size={14} color={theme.warning} />
            </View>
          ) : null}
        </View>

        {item.message ? (
          <View style={[styles.messageBubble, { backgroundColor: `${theme.textSecondary}10` }]}>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              "{item.message}"
            </ThemedText>
          </View>
        ) : null}

        {activeTab === "pending" ? (
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.declineButton, { borderColor: theme.error }]}
              onPress={() => handleRespond(item.id, "declined")}
            >
              <Feather name="x" size={18} color={theme.error} />
              <ThemedText type="body" style={{ color: theme.error }}>
                Decline
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.acceptButton, { backgroundColor: theme.primary }]}
              onPress={() => handleRespond(item.id, "accepted")}
            >
              <Feather name="check" size={18} color="#FFF" />
              <ThemedText type="body" style={{ color: "#FFF", fontWeight: "600" }}>
                Accept
              </ThemedText>
            </Pressable>
          </View>
        ) : activeTab === "connections" ? (
          <Pressable
            style={[styles.viewProfileButton, { backgroundColor: `${theme.primary}15` }]}
            onPress={() => navigation.navigate("UserProfile", { userId: 
              item.senderId === userId ? item.receiverId : item.senderId 
            })}
          >
            <ThemedText type="body" style={{ color: theme.primary, fontWeight: "500" }}>
              View Profile
            </ThemedText>
            <Feather name="arrow-right" size={16} color={theme.primary} />
          </Pressable>
        ) : null}
      </Animated.View>
    );
  };

  const tabData = getTabData();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.content, { paddingTop: headerHeight + Spacing.md }]}>
        <View style={styles.tabBar}>
          {(["pending", "sent", "connections"] as TabType[]).map((tab) => {
            const count = tab === "pending" 
              ? pendingHandshakes.length 
              : tab === "sent" 
                ? sentHandshakes.filter(h => h.status === "pending").length 
                : connections.length;

            return (
              <Pressable
                key={tab}
                style={[
                  styles.tab,
                  { 
                    backgroundColor: activeTab === tab ? theme.primary : "transparent",
                    borderColor: activeTab === tab ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab);
                }}
              >
                <ThemedText
                  type="small"
                  style={{
                    color: activeTab === tab ? "#FFF" : theme.textSecondary,
                    fontWeight: activeTab === tab ? "600" : "400",
                    textTransform: "capitalize",
                  }}
                >
                  {tab}
                </ThemedText>
                {count > 0 ? (
                  <View style={[styles.countBadge, { backgroundColor: activeTab === tab ? "#FFF" : theme.primary }]}>
                    <ThemedText
                      type="caption"
                      style={{ color: activeTab === tab ? theme.primary : "#FFF", fontWeight: "600" }}
                    >
                      {count}
                    </ThemedText>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={tabData}
          keyExtractor={(item) => item.id}
          renderItem={renderHandshakeItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  tabBar: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xs,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
  pulseRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
  },
  iconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  handshakeCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  viewProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
});
