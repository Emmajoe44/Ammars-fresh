import { Feather } from "@expo/vector-icons";
import { useListUsers } from "@workspace/api-client-react";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { useColors } from "@/hooks/useColors";

type Role = "farmer" | "retailer" | "admin";

export default function AdminUsers() {
  const colors = useColors();
  const [role, setRole] = useState<Role>("farmer");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch, isRefetching } = useListUsers({ role });

  const users = useMemo(() => {
    const list = data?.users ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u: any) =>
        u.name?.toLowerCase().includes(q) ||
        u.phone?.includes(q) ||
        u.location?.toLowerCase().includes(q) ||
        u.farmName?.toLowerCase().includes(q),
    );
  }, [data, search]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Users" subtitle={`${data?.total ?? 0} ${role}s`} />

      <View style={styles.controls}>
        <View style={styles.tabs}>
          {(["farmer", "retailer", "admin"] as Role[]).map((r) => {
            const active = r === role;
            return (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active ? colors.primary : colors.muted,
                  },
                ]}
              >
                <Text style={[styles.tabTxt, { color: active ? "#fff" : colors.mutedForeground }]}>
                  {r === "farmer" ? "Farmers" : r === "retailer" ? "Retailers" : "Admins"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, phone, location"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchTxt, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u: any) => String(u.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="users"
              title={search ? "No matches" : `No ${role}s yet`}
              description={search ? "Try a different search term." : "Users will appear here once they register."}
            />
          }
          renderItem={({ item }: { item: any }) => {
            const initials = (item.name ?? "")
              .split(" ")
              .map((p: string) => p[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <Card style={{ marginBottom: 10 }}>
                <View style={styles.row}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary + "1A" }]}>
                    <Text style={[styles.avatarTxt, { color: colors.primary }]}>{initials || "?"}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {item.phone}
                    </Text>
                    {item.farmName ? (
                      <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
                        🌾 {item.farmName}
                      </Text>
                    ) : null}
                    {item.location ? (
                      <Text style={[styles.meta, { color: colors.mutedForeground }]} numberOfLines={1}>
                        📍 {item.location}
                      </Text>
                    ) : null}
                  </View>
                  <View style={[styles.rolePill, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.roleTxt, { color: colors.mutedForeground }]}>
                      {item.role}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 12 },
  tabs: { flexDirection: "row", gap: 8 },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  tabTxt: { fontSize: 13, fontWeight: "700" },
  search: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  searchTxt: { flex: 1, fontSize: 14, paddingVertical: 0 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontSize: 15, fontWeight: "800" },
  name: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  meta: { fontSize: 12, marginTop: 1 },
  rolePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  roleTxt: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
});
