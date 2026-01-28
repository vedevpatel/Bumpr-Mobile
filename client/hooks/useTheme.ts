import { useState, useEffect, useCallback } from "react";
import { Colors } from "@/constants/theme";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import { storage } from "@/lib/storage";
import type { ThemeMode } from "@/types";

let globalThemeMode: ThemeMode = "system";
let listeners: ((mode: ThemeMode) => void)[] = [];

export function useTheme() {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(globalThemeMode);

  useEffect(() => {
    storage.getThemeMode().then((mode) => {
      globalThemeMode = mode;
      setThemeMode(mode);
    });

    const listener = (mode: ThemeMode) => setThemeMode(mode);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    globalThemeMode = mode;
    await storage.setThemeMode(mode);
    listeners.forEach((l) => l(mode));
  }, []);

  const effectiveScheme =
    themeMode === "system" ? deviceColorScheme ?? "light" : themeMode;

  const isDark = effectiveScheme === "dark";
  const theme = Colors[effectiveScheme];

  return {
    theme,
    isDark,
    themeMode,
    setTheme,
  };
}
