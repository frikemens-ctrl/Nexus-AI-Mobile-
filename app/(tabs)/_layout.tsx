import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
export default function TabLayout() { const colors = useColors(); const insets = useSafeAreaInsets(); const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8); return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarButton: HapticTab, tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: 56 + bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 0.5 }, tabBarLabelStyle: { fontSize: 10, fontWeight: "600" } }}><Tabs.Screen name="index" options={{ title: "Czat", tabBarIcon: ({ color }) => <IconSymbol size={23} name="bubble.left.and.bubble.right.fill" color={color} /> }} /><Tabs.Screen name="history" options={{ title: "Historia", tabBarIcon: ({ color }) => <IconSymbol size={23} name="clock.fill" color={color} /> }} /><Tabs.Screen name="settings" options={{ title: "Ustawienia", tabBarIcon: ({ color }) => <IconSymbol size={23} name="gearshape.fill" color={color} /> }} /></Tabs>; }
