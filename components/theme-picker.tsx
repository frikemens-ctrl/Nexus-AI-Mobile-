import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME_OPTIONS, useThemeContext, type ThemeId } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";

export function ThemePicker() {
  const colors = useColors();
  const { themeId, setTheme } = useThemeContext();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: colors.foreground }]}>Motyw interfejsu</Text>
      <Text style={[styles.detail, { color: colors.muted }]}>Wybierz wygląd aplikacji. Ustawienie zapisze się na tym urządzeniu.</Text>
      <View style={styles.grid}>
        {THEME_OPTIONS.map((option) => {
          const active = option.id === themeId;
          return (
            <Pressable key={option.id} onPress={() => setTheme(option.id as ThemeId)} style={({ pressed }) => [styles.card, { backgroundColor: colors.surface, borderColor: active ? option.color : colors.border }, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={`Wybierz motyw ${option.label}`}>
              <View style={[styles.swatch, { backgroundColor: option.color }]}><Ionicons name={active ? "checkmark" : "color-palette-outline"} size={18} color="#fff" /></View>
              <View style={styles.copy}><Text style={[styles.label, { color: colors.foreground }]}>{option.label}</Text><Text style={[styles.detail, { color: colors.muted }]}>{option.detail}</Text></View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 22 },
  title: { fontSize: 15, fontWeight: "800", marginBottom: 5 },
  detail: { fontSize: 11, lineHeight: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 9, marginTop: 12 },
  card: { width: "48%", minHeight: 68, borderWidth: 1.5, borderRadius: 16, padding: 10, flexDirection: "row", alignItems: "center", gap: 9 },
  swatch: { width: 32, height: 32, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1 },
  label: { fontSize: 11, fontWeight: "800" },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});
