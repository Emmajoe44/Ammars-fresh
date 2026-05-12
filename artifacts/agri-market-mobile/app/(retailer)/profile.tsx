import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { InfoRow, Pill, PJS, PrimaryButton, SectionLabel } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RetailerProfile() {
  const colors = useColors();
  const { user, signOut, currency, setCurrency } = useAuth();
  const router = useRouter();

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
    Alert.alert("Sign out?", "You'll need to log in again to continue shopping.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: doSignOut },
    ]);
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Profile" subtitle="Account & preferences" eyebrow="Retailer" variant="gradient" />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + "1A" }]}>
              <Text style={[styles.avatarTxt, { color: colors.primary, fontFamily: PJS.black }]}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.foreground, fontFamily: PJS.bold }]}>{user?.name ?? "Retailer"}</Text>
              <Text style={[styles.phone, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>{user?.phone ?? ""}</Text>
              <View style={{ flexDirection: "row", marginTop: 6 }}>
                <Pill label="Retailer" color={colors.primary} icon="shopping-bag" />
              </View>
            </View>
          </View>
        </Card>

        <SectionLabel label="Preferences" />
        <Card>
          <Text style={[styles.cardLabel, { color: colors.foreground, fontFamily: PJS.bold }]}>Currency</Text>
          <View style={styles.currencyRow}>
            {(["SSP", "USD"] as const).map((c) => {
              const active = currency === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => { Haptics.selectionAsync(); void setCurrency(c); }}
                  style={({ pressed }) => [
                    styles.currencyBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.muted,
                      borderColor: active ? colors.primary : colors.border,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.currencyText, { color: active ? "#fff" : colors.foreground, fontFamily: PJS.bold }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <SectionLabel label="Account" />
        <Card>
          <InfoRow icon="user" label="Full name" value={user?.name ?? "—"} tint={colors.primary} />
          <InfoRow icon="phone" label="Phone" value={user?.phone ?? "—"} tint={colors.secondary} />
          {user?.location ? (
            <InfoRow icon="map-pin" label="Location" value={user.location} tint={colors.info} />
          ) : null}
        </Card>

        <View style={{ marginTop: 16 }}>
          <PrimaryButton label="Sign out" icon="log-out" variant="danger" trailingIcon={null} onPress={handleSignOut} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontSize: 22 },
  name: { fontSize: 18 },
  phone: { fontSize: 13, marginTop: 2 },
  cardLabel: { fontSize: 15, marginBottom: 12 },
  currencyRow: { flexDirection: "row", gap: 10 },
  currencyBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: "center" },
  currencyText: { fontSize: 14 },
});
