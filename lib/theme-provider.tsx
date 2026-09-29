import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { Colors, SchemeColors, type ColorScheme, type ThemeColorPalette } from "@/constants/theme";

export type ThemeId = "mist" | "graphite" | "emerald" | "dusk";

export const THEME_OPTIONS: Array<{ id: ThemeId; label: string; detail: string; color: string }> = [
  { id: "mist", label: "Classic mode", detail: "Jasny iMessage + 5 ikon", color: "#147ef5" },
  { id: "graphite", label: "Cyberpunk mode", detail: "Neonowy terminal", color: "#ff007f" },
  { id: "emerald", label: "Advanced Vision", detail: "Orb + telemetry DEMO", color: "#eab308" },
  { id: "dusk", label: "GTA / Comic mode", detail: "Żółty komiks i twarde cienie", color: "#facc15" },
];

const THEME_STORAGE_KEY = "nexus-ai-theme";
const PALETTES: Record<ThemeId, ThemeColorPalette> = {
  mist: Colors.light,
  graphite: { ...Colors.dark, primary: "#7dd3fc", accent: "#172b3a", success: "#4ade80" },
  emerald: { ...Colors.dark, primary: "#34d399", accent: "#10382f", success: "#86efac" },
  dusk: { ...Colors.dark, primary: "#c084fc", accent: "#302044", success: "#86efac" },
};

type ThemeContextValue = {
  themeId: ThemeId;
  colorScheme: ColorScheme;
  palette: ThemeColorPalette;
  setTheme: (theme: ThemeId) => void;
  setColorScheme: (scheme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [themeId, setThemeId] = useState<ThemeId>(systemScheme === "dark" ? "graphite" : "mist");
  const colorScheme: ColorScheme = themeId === "mist" ? "light" : "dark";
  const palette = PALETTES[themeId];

  const applyPalette = useCallback((scheme: ColorScheme, nextPalette: ThemeColorPalette) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      Object.entries(nextPalette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  const setTheme = useCallback((nextTheme: ThemeId) => {
    setThemeId(nextTheme);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }, []);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setTheme(scheme === "light" ? "mist" : "graphite");
  }, [setTheme]);

  useEffect(() => {
    applyPalette(colorScheme, palette);
  }, [applyPalette, colorScheme, palette]);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored && stored in PALETTES) setThemeId(stored as ThemeId);
    });
  }, []);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": palette.primary,
        "color-accent": palette.accent,
        "color-background": palette.background,
        "color-surface": palette.surface,
        "color-foreground": palette.foreground,
        "color-muted": palette.muted,
        "color-border": palette.border,
        "color-success": palette.success,
        "color-warning": palette.warning,
        "color-error": palette.error,
      }),
    [palette],
  );

  const value = useMemo(
    () => ({
      themeId,
      colorScheme,
      palette,
      setTheme,
      setColorScheme,
    }),
    [themeId, colorScheme, palette, setTheme, setColorScheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
