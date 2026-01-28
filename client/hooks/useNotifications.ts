import { useEffect, useRef, useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

import {
  requestNotificationPermissions,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  NotificationTemplates,
  scheduleLocalNotification,
} from "@/lib/notifications";
import { storage } from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";

interface UseNotificationsResult {
  expoPushToken: string | null;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useNotifications(navigationRef?: any): UseNotificationsResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.log("Push notifications require a physical device");
      return null;
    }

    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);

    if (!granted) {
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: "bumpr-app",
      });
      return tokenData.data;
    } catch (error) {
      console.log("Error getting push token:", error);
      return null;
    }
  };

  const savePushTokenToServer = async (token: string) => {
    try {
      const user = await storage.getUser();
      if (!user) return;

      const baseUrl = getApiUrl();
      await fetch(new URL("/api/push-tokens", baseUrl).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          token,
          platform: Platform.OS,
        }),
      });
    } catch (error) {
      console.log("Error saving push token:", error);
    }
  };

  const requestPermission = useCallback(async () => {
    const token = await registerForPushNotifications();
    if (token) {
      setExpoPushToken(token);
      await savePushTokenToServer(token);
    }
    return !!token;
  }, []);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        savePushTokenToServer(token);
      }
    });

    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      
      if (navigationRef?.current) {
        if (data?.type === "handshake") {
          try {
            navigationRef.current.navigate("Handshake");
          } catch (e) {}
        } else if (data?.type === "moment" && data?.momentId) {
          try {
            navigationRef.current.navigate("ViewMoment", { momentId: data.momentId });
          } catch (e) {}
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [navigationRef]);

  return {
    expoPushToken,
    permissionGranted,
    requestPermission,
  };
}

export async function sendHandshakeNotification(senderName: string) {
  const template = NotificationTemplates.handshakeReceived(senderName);
  await scheduleLocalNotification({
    ...template,
    data: { navigateTo: "Handshake" },
  });
}

export async function sendHandshakeAcceptedNotification(accepterName: string) {
  const template = NotificationTemplates.handshakeAccepted(accepterName);
  await scheduleLocalNotification({
    ...template,
    data: { navigateTo: "Handshake" },
  });
}

export async function sendMomentNotification(locationName: string, momentId: string) {
  const template = NotificationTemplates.newMomentNearby(locationName);
  await scheduleLocalNotification({
    ...template,
    data: { momentId, navigateTo: "ViewMoment" },
  });
}

export async function sendReputationNotification(newScore: number) {
  const template = NotificationTemplates.reputationIncrease(newScore);
  await scheduleLocalNotification(template);
}
