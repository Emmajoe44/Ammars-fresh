import { Feather } from "@expo/vector-icons";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { InfoRow, Pill, PJS, PrimaryButton, SectionLabel } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function AdminProfile() {
  const colors = useColors();
  const { user, signOut } = useAuth();

  const confirmLogout = () => {
    Alert.alert("Sign out?", "You'll need to log in again to access the admin console.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => { void signOut(); } },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Profile" subtitle="Account & access" eyebrow="Administrator" variant="gradient" />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + "1A" }]}>
              <Text style={[styles.avatarTxt, { color: colors.primary, fontFamily: PJS.black }]}>
                {(user?.name ?? "A").slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.foreground, fontFamily: PJS.bold }]}>{user?.name ?? "Admin"}</Text>
              <Text style={[styles.phone, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>{user?.phone ?? ""}</Text>
              <View style={{ flexDirection: "row", marginTop: 6 }}>
                <Pill label="Administrator" color={colors.primary} icon="shield" />
              </View>
            </View>
          </View>
        </Card>

        <SectionLabel label="Account" />
        <Card>
          <InfoRow icon="user" label="Full name" value={user?.name ?? "—"} tint={colors.primary} />
          <InfoRow icon="phone" label="Phone" value={user?.phone ?? "—"} tint={colors.secondary} />
          <InfoRow icon="shield" label="Role" value="Admin" tint={colors.info} />
        </Card>

        <SectionLabel label="App" />
        <Card>
          <Pressable onPress={confirmLogout} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.destructive + "18" }]}>
              <Feather name="log-out" size={16} color={colors.destructive} />
            </View>
            <Text style={[styles.rowLbl, { color: colors.destructive, fontFamily: PJS.bold }]}>Sign out</Text>
          </Pressable>
        </Card>

        <View style={{ marginTop: 16 }}>
          <PrimaryButton label="Sign out" icon="log-out" variant="danger" trailingIcon={null} onPress={confirmLogout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontSize: 24 },
  name: { fontSize: 18 },
  phone: { fontSize: 13, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLbl: { fontSize: 14, flex: 1 },
});
