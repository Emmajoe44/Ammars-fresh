import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut, currency, setCurrency } = useAuth();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 100 }}
    >
      <Text style={[styles.title, { color: colors.foreground, paddingHorizontal: 20 }]}>Profile</Text>

      <View style={[styles.avatarCard, { backgroundColor: colors.primary }]}>
        <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 40 }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.avatarName}>{user?.name}</Text>
        <Text style={styles.avatarPhone}>{user?.phone}</Text>
        <View style={[styles.rolePill, { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12 }]}>
          <Text style={styles.roleText}>Administrator</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Preferences</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.cardLabel, { color: colors.foreground }]}>Currency</Text>
          <View style={styles.currencyRow}>
            {(["SSP", "USD"] as const).map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => { Haptics.selectionAsync(); setCurrency(c); }}
                style={[styles.currencyBtn, { backgroundColor: currency === c ? colors.primary : colors.muted, borderRadius: colors.radius / 2 }]}
              >
                <Text style={[styles.currencyText, { color: currency === c ? "#fff" : colors.mutedForeground }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>System</Text>
        {[
          { icon: "users", label: "User Management", desc: "Manage farmers & retailers" },
          { icon: "truck", label: "Fleet Management", desc: "GPS truck tracking" },
          { icon: "bar-chart-2", label: "Analytics", desc: "Demand & revenue insights" },
        ].map(({ icon, label, desc }) => (
          <View
            key={label}
            style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary + "18", borderRadius: 10 }]}>
              <Feather name={icon as any} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{label}</Text>
              <Text style={[styles.menuDesc, { color: colors.mutedForeground }]}>{desc}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </View>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.signOutBtn,
          { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "40", borderRadius: colors.radius, opacity: pressed ? 0.8 : 1, marginHorizontal: 20, marginTop: 8 },
        ]}
        onPress={handleSignOut}
      >
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[styles.signOutText, { color: colors.destructive }]}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 20 },
  avatarCard: { margin: 20, borderRadius: 16, padding: 24, alignItems: "center", gap: 6 },
  avatar: { width: 80, height: 80, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  avatarName: { color: "#fff", fontSize: 20, fontWeight: "700" },
  avatarPhone: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  rolePill: { paddingHorizontal: 14, paddingVertical: 5, marginTop: 4 },
  roleText: { color: "#fff", fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, paddingHorizontal: 20, marginBottom: 8 },
  card: { marginHorizontal: 20, padding: 16, borderWidth: 1, marginBottom: 12 },
  cardLabel: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  currencyRow: { flexDirection: "row", gap: 10 },
  currencyBtn: { paddingHorizontal: 24, paddingVertical: 10 },
  currencyText: { fontSize: 14, fontWeight: "700" },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1, marginHorizontal: 20, marginBottom: 10 },
  menuIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  menuDesc: { fontSize: 12 },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderWidth: 1 },
  signOutText: { fontSize: 15, fontWeight: "700" },
});
