import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

interface RowProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  description: string;
  onPress: () => void;
  tint?: string;
}

export default function AdminMore() {
  const colors = useColors();
  const router = useRouter();
  const { user, signOut, currency, setCurrency } = useAuth();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "?";

  const Row = ({ icon, label, description, onPress, tint }: RowProps) => (
    <Pressable
      onPress={() => { Haptics.selectionAsync(); onPress(); }}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.iconBox, { backgroundColor: (tint ?? colors.primary) + "1A" }]}>
        <Feather name={icon} size={18} color={tint ?? colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.mutedForeground }]}>{description}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="More" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={[styles.bigAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.bigAvatarTxt}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, { color: colors.foreground }]} numberOfLines={1}>
              {user?.name}
            </Text>
            <Text style={[styles.profileMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
              {user?.phone} · Admin
            </Text>
          </View>
        </Card>

        <Text style={[styles.section, { color: colors.mutedForeground }]}>Operations</Text>
        <Card padded={false} style={{ marginBottom: 16 }}>
          <Row icon="package" label="All products" description="Browse, toggle and remove listings" onPress={() => router.push("/(admin)/products")} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row icon="dollar-sign" label="Pricing rules" description="Set min/max prices per category" onPress={() => router.push("/(admin)/pricing")} tint={colors.info} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row icon="bar-chart-2" label="Demand analytics" description="Order trends and category breakdown" onPress={() => router.push("/(admin)/analytics")} tint={colors.secondary} />
        </Card>

        <Text style={[styles.section, { color: colors.mutedForeground }]}>Preferences</Text>
        <Card style={{ marginBottom: 16 }}>
          <Text style={[styles.cardLabel, { color: colors.foreground }]}>Display currency</Text>
          <View style={styles.currencyRow}>
            {(["SSP", "USD"] as const).map((c) => (
              <Pressable
                key={c}
                onPress={() => { Haptics.selectionAsync(); setCurrency(c); }}
                style={[
                  styles.currencyBtn,
                  { backgroundColor: currency === c ? colors.primary : colors.muted },
                ]}
              >
                <Text style={[styles.currencyTxt, { color: currency === c ? "#fff" : colors.mutedForeground }]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Text style={[styles.section, { color: colors.mutedForeground }]}>Account</Text>
        <Card padded={false}>
          <Row icon="user" label="Profile" description="View personal info" onPress={() => router.push("/(admin)/profile")} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Row icon="log-out" label="Sign out" description="Return to the login screen" onPress={handleSignOut} tint={colors.destructive} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 },
  bigAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  bigAvatarTxt: { color: "#fff", fontSize: 20, fontWeight: "800" },
  profileName: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  profileMeta: { fontSize: 13, marginTop: 2 },
  section: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  rowDesc: { fontSize: 12 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  cardLabel: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  currencyRow: { flexDirection: "row", gap: 10 },
  currencyBtn: { paddingHorizontal: 22, paddingVertical: 9, borderRadius: 8 },
  currencyTxt: { fontSize: 13, fontWeight: "700" },
});
