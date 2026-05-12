import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useListCategories, useListProducts } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { Brand, PJS } from "@/components/ui";

export default function RetailerHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, currency } = useAuth();
  const { addItem, count } = useCart();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  const { data: categories, isLoading: catsLoading } = useListCategories();
  const { data: productsData, isLoading: prodsLoading } = useListProducts({
    available: true,
    categoryId: selectedCategory,
    search: search || undefined,
    limit: 50,
  });

  const products = productsData?.products ?? [];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.primary + "EE", colors.secondary + "DD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 18 }]}
      >
        <View style={styles.brandRow}>
          <Brand size="sm" inverted />
          <View style={styles.cartBadge}>
            <Feather name="shopping-cart" size={20} color="#fff" />
            {count > 0 && (
              <View style={styles.badgeDot}>
                <Text style={[styles.badgeText, { fontFamily: PJS.bold }]}>{count}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={[styles.greeting, { fontFamily: PJS.medium }]}>{greeting()},</Text>
        <Text style={[styles.userName, { fontFamily: PJS.black }]}>{user?.name ?? "Retailer"}</Text>
        <Text style={[styles.tagline, { fontFamily: PJS.medium }]}>Fresh produce, direct from South Sudan farmers</Text>

        <View style={[styles.searchBar, { backgroundColor: "rgba(255,255,255,0.97)" }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground, fontFamily: PJS.medium }]}
            placeholder="Search produce..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.catScroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.catContent}
      >
        <Pressable
          onPress={() => setSelectedCategory(undefined)}
          style={[
            styles.catChip,
            {
              backgroundColor: !selectedCategory ? colors.primary : colors.muted,
              borderColor: !selectedCategory ? colors.primary : colors.border,
            },
          ]}
        >
          <Text style={[styles.catText, { color: !selectedCategory ? "#fff" : colors.foreground, fontFamily: PJS.bold }]}>
            All
          </Text>
        </Pressable>
        {(categories ?? []).map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedCategory(active ? undefined : cat.id);
              }}
              style={[
                styles.catChip,
                {
                  backgroundColor: active ? colors.primary : colors.muted,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.catText, { color: active ? "#fff" : colors.foreground, fontFamily: PJS.bold }]}>
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {prodsLoading || catsLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Feather name="inbox" size={32} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: PJS.bold }]}>No produce found</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
            Try a different category or search term
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <ProductCard
              {...item}
              unit={item.unit ?? "unit"}
              currency={currency}
              onAddToCart={() => {
                addItem({
                  productId: item.id,
                  name: item.name,
                  nameAr: item.nameAr,
                  priceSSP: item.priceSSP,
                  priceUSD: item.priceUSD,
                  unit: item.unit ?? "unit",
                  farmerName: item.farmerName ?? "",
                  farmName: item.farmName ?? null,
                  available: item.available,
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 22, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  cartBadge: { padding: 10, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 14 },
  badgeDot: { position: "absolute", top: -2, right: -2, backgroundColor: "#ef4444", borderRadius: 10, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  badgeText: { color: "#fff", fontSize: 10 },
  greeting: { color: "rgba(255,255,255,0.85)", fontSize: 14 },
  userName: { color: "#fff", fontSize: 24, marginTop: 2 },
  tagline: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 6, marginBottom: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 48, borderRadius: 14 },
  searchInput: { flex: 1, fontSize: 15, height: "100%" },
  catScroll: { flexGrow: 0 },
  catContent: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth },
  catText: { fontSize: 13 },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 40 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 16 },
  emptyText: { fontSize: 13, textAlign: "center" },
  grid: { padding: 10, paddingBottom: 100 },
});
