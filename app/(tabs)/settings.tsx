import { useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { ThemePicker } from "@/components/theme-picker";

export default function SettingsScreen() {
  const colors = useColors();
  const [voice, setVoice] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [privateMode, setPrivateMode] = useState(false);
  const rows = [
    { label: "Odpowiedzi głosowe", detail: "Słuchaj odpowiedzi po użyciu głosu", icon: "mic-outline" as const, value: voice, setValue: setVoice },
    { label: "Wibracje", detail: "Delikatne potwierdzenie ważnych działań", icon: "phone-portrait-outline" as const, value: haptics, setValue: setHaptics },
    { label: "Tryb prywatny", detail: "Zachowuj nowe rozmowy tylko na tym urządzeniu", icon: "shield-checkmark-outline" as const, value: privateMode, setValue: setPrivateMode },
  ];
  return <ScreenContainer className="px-5" containerClassName="bg-background"><Text style={[styles.kicker, { color: colors.primary }]}>NEXUS AI</Text><Text style={[styles.title, { color: colors.foreground }]}>Ustawienia</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Dopasuj przestrzeń do swoich potrzeb.</Text><View style={styles.section}>{rows.map((row) => <View key={row.label} style={[styles.row, { borderBottomColor: colors.border }]}><View style={[styles.icon, { backgroundColor: colors.accent }]}><Ionicons name={row.icon} size={19} color={colors.primary} /></View><View style={styles.copy}><Text style={[styles.label, { color: colors.foreground }]}>{row.label}</Text><Text style={[styles.detail, { color: colors.muted }]}>{row.detail}</Text></View><Switch value={row.value} onValueChange={row.setValue} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#ffffff" /></View>)}</View><ThemePicker /><Pressable onPress={() => Alert.alert("O Nexus AI", "Wersja 1.0.2 · Osobista inteligencja, uproszczona.")} style={({ pressed }) => [styles.about, { backgroundColor: colors.surface, borderColor: colors.border }, pressed && styles.pressed]}><View style={[styles.icon, { backgroundColor: colors.accent }]}><MaterialIcons name="auto-awesome" size={19} color={colors.primary} /></View><View style={styles.copy}><Text style={[styles.label, { color: colors.foreground }]}>O Nexus AI</Text><Text style={[styles.detail, { color: colors.muted }]}>Wersja 1.0.2 · Osobista inteligencja, uproszczona.</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable></ScreenContainer>;
}
const styles = StyleSheet.create({ kicker: { fontSize: 10, fontWeight: "800", letterSpacing: 1.7, marginTop: 24, marginBottom: 8 }, title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.8 }, subtitle: { fontSize: 14, marginTop: 9, marginBottom: 24 }, section: { borderTopWidth: 1 }, row: { minHeight: 78, flexDirection: "row", alignItems: "center", borderBottomWidth: 1 }, icon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 12 }, copy: { flex: 1 }, label: { fontSize: 14, fontWeight: "700", marginBottom: 4 }, detail: { fontSize: 11, lineHeight: 16, paddingRight: 8 }, about: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 18, minHeight: 74, padding: 13, marginTop: 22 }, pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] } });
