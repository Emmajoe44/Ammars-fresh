import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{user?.name ?? "Retailer"}</Text>
          </View>
          <View style={[styles.cartBadge, { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: colors.radius }]}>
            <Feather name="shopping-cart" size={20} color="#fff" />
            {count > 0 && (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: colors.radius }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search produce..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

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
              borderRadius: 20,
            },
          ]}
        >
          <Text style={[styles.catText, { color: !selectedCategory ? "#fff" : colors.mutedForeground }]}>
            All
          </Text>
        </Pressable>
        {(categories ?? []).map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedCategory(cat.id === selectedCategory ? undefined : cat.id);
            }}
            style={[
              styles.catChip,
              {
                backgroundColor: selectedCategory === cat.id ? colors.primary : colors.muted,
                borderRadius: 20,
              },
            ]}
          >
            <Text style={[styles.catText, { color: selectedCategory === cat.id ? "#fff" : colors.mutedForeground }]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {prodsLoading || catsLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Feather name="inbox" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No produce found</Text>
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
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  greeting: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  userName: { color: "#fff", fontSize: 22, fontWeight: "800" },
  cartBadge: { padding: 10 },
  badgeDot: { position: "absolute", top: -2, right: -2, backgroundColor: "#ef4444", borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, height: 46 },
  searchInput: { flex: 1, fontSize: 15, height: "100%" },
  catScroll: { flexGrow: 0 },
  catContent: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8 },
  catText: { fontSize: 13, fontWeight: "600" },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 16 },
  grid: { padding: 10, paddingBottom: 100 },
});
