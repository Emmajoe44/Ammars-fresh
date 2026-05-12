import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

export default function RetailerProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, signOut, currency, setCurrency } = useAuth();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleSignOut = () => {
    const doSignOut = async () => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signOut();
      router.replace("/(auth)/login");
    };
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm("Sign out of AgriMarket?")) doSignOut();
      return;
    }
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: doSignOut },
    ]);
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground, paddingHorizontal: 20 }]}>Profile</Text>

      <View style={[styles.avatarCard, { backgroundColor: colors.primary }]}>
        <View style={[styles.avatar, { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 40 }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.avatarName}>{user?.name}</Text>
        <Text style={styles.avatarPhone}>{user?.phone}</Text>
        <View style={[styles.rolePill, { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12 }]}>
          <Text style={styles.roleText}>Retailer</Text>
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
                style={[
                  styles.currencyBtn,
                  {
                    backgroundColor: currency === c ? colors.primary : colors.muted,
                    borderRadius: colors.radius / 2,
                  },
                ]}
              >
                <Text style={[styles.currencyText, { color: currency === c ? "#fff" : colors.mutedForeground }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Account</Text>
        {user?.location && (
          <View style={[styles.infoRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Feather name="map-pin" size={18} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>{user.location}</Text>
          </View>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.signOutBtn,
          { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "40", borderRadius: colors.radius, opacity: pressed ? 0.8 : 1, marginHorizontal: 20 },
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
  avatarCard: { margin: 20, borderRadius: 16, padding: 24, alignItems: "center", gap: 8 },
  avatar: { width: 80, height: 80, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
  avatarName: { color: "#fff", fontSize: 20, fontWeight: "700" },
  avatarPhone: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  rolePill: { paddingHorizontal: 14, paddingVertical: 5, marginTop: 4 },
  roleText: { color: "#fff", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, paddingHorizontal: 20, marginBottom: 8 },
  card: { marginHorizontal: 20, padding: 16, borderWidth: 1, marginBottom: 12 },
  cardLabel: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  currencyRow: { flexDirection: "row", gap: 10 },
  currencyBtn: { paddingHorizontal: 24, paddingVertical: 10 },
  currencyText: { fontSize: 14, fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderWidth: 1, marginHorizontal: 20, marginBottom: 12 },
  infoText: { fontSize: 14 },
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderWidth: 1, marginTop: 12 },
  signOutText: { fontSize: 15, fontWeight: "700" },
});
