import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { storage } from "@/lib/storage";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: "handshake" | "moment" | "nearby" | "system";
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log("Must use physical device for notifications");
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission not granted");
    return false;
  }

  // Set up Android notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#E8785A",
    });

    await Notifications.setNotificationChannelAsync("nearby", {
      name: "Nearby Activity",
      importance: Notifications.AndroidImportance.HIGH,
      description: "Notifications about people and moments nearby",
    });

    await Notifications.setNotificationChannelAsync("social", {
      name: "Social",
      importance: Notifications.AndroidImportance.HIGH,
      description: "Handshake requests and connection updates",
    });
  }

  return true;
}

export async function scheduleLocalNotification(notification: NotificationData): Promise<string | null> {
  const notificationsEnabled = await storage.getNotificationsEnabled();
  if (!notificationsEnabled) {
    return null;
  }

  const channelId = Platform.OS === "android"
    ? notification.type === "handshake" ? "social"
    : notification.type === "moment" || notification.type === "nearby" ? "nearby"
    : "default"
    : undefined;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: { type: notification.type, ...notification.data },
      sound: true,
    },
    trigger: null, // Immediate notification
  });

  return id;
}

export async function scheduleDelayedNotification(
  notification: NotificationData,
  delaySeconds: number
): Promise<string | null> {
  const notificationsEnabled = await storage.getNotificationsEnabled();
  if (!notificationsEnabled) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: { type: notification.type, ...notification.data },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
    },
  });

  return id;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Notification listeners
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Example notifications for different scenarios
export const NotificationTemplates = {
  nearbyUser: (userName: string) => ({
    type: "nearby" as const,
    title: "Someone new nearby",
    body: `${userName} is in your area and shares your interests!`,
  }),

  handshakeReceived: (userName: string) => ({
    type: "handshake" as const,
    title: "New connection request",
    body: `${userName} wants to connect with you`,
  }),

  handshakeAccepted: (userName: string) => ({
    type: "handshake" as const,
    title: "Connection accepted!",
    body: `You and ${userName} are now connected`,
  }),

  newMomentNearby: (locationName: string) => ({
    type: "moment" as const,
    title: "New moment nearby",
    body: `Someone shared a moment at ${locationName}`,
  }),

  momentExpiring: (minutesLeft: number) => ({
    type: "moment" as const,
    title: "Your moment is expiring",
    body: `Your moment will disappear in ${minutesLeft} minutes`,
  }),

  reputationIncrease: (newScore: number) => ({
    type: "system" as const,
    title: "Reputation increased",
    body: `Your Clique Reputation is now ${newScore}`,
  }),
};
