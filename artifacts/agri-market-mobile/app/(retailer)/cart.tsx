import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCreateOrder } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function CartScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currency } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, totalSSP, totalUSD, count } = useCart();
  const createOrderMutation = useCreateOrder();
  const [address, setAddress] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const total = currency === "USD" ? `$${totalUSD.toFixed(2)}` : `SSP ${totalSSP.toLocaleString()}`;

  const handleCheckout = async () => {
    if (!address.trim()) {
      Alert.alert("Delivery address required", "Please enter your delivery address.");
      return;
    }
    if (items.length === 0) return;

    setIsCheckingOut(true);
    try {
      await createOrderMutation.mutateAsync({
        data: {
          currency,
          deliveryLocation: address.trim(),
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            quantity: i.quantity,
            priceSSP: i.priceSSP,
            priceUSD: i.priceUSD,
            unit: i.unit,
          })),
        },
      });
      clearCart();
      setAddress("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Order placed!", "Your order has been submitted successfully.");
    } catch {
      Alert.alert("Order failed", "Something went wrong. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Cart</Text>
        {count > 0 && (
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); clearCart(); }}>
            <Text style={[styles.clearText, { color: colors.destructive }]}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="shopping-cart" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your cart is empty</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Browse produce and add items to your cart
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.productId)}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.itemFarm, { color: colors.mutedForeground }]}>
                    {item.farmName ?? item.farmerName}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.primary }]}>
                    {currency === "USD" ? `$${item.priceUSD.toFixed(2)}` : `SSP ${item.priceSSP}`} / {item.unit}
                  </Text>
                </View>
                <View style={styles.qtyControls}>
                  <Pressable
                    onPress={() => { Haptics.selectionAsync(); updateQuantity(item.productId, item.quantity - 1); }}
                    style={[styles.qtyBtn, { borderColor: colors.border, borderRadius: colors.radius / 2 }]}
                  >
                    <Feather name="minus" size={16} color={colors.foreground} />
                  </Pressable>
                  <Text style={[styles.qtyText, { color: colors.foreground }]}>{item.quantity}</Text>
                  <Pressable
                    onPress={() => { Haptics.selectionAsync(); updateQuantity(item.productId, item.quantity + 1); }}
                    style={[styles.qtyBtn, { borderColor: colors.border, borderRadius: colors.radius / 2 }]}
                  >
                    <Feather name="plus" size={16} color={colors.foreground} />
                  </Pressable>
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); removeItem(item.productId); }}
                    style={styles.removeBtn}
                  >
                    <Feather name="trash-2" size={16} color={colors.destructive} />
                  </Pressable>
                </View>
              </View>
            )}
            ListFooterComponent={
              <View style={styles.checkoutSection}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Delivery address</Text>
                <View style={[styles.addressInput, { borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.card }]}>
                  <Feather name="map-pin" size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
                  <TextInput
                    style={[styles.addressText, { color: colors.foreground }]}
                    placeholder="Enter delivery address"
                    placeholderTextColor={colors.mutedForeground}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                  />
                </View>

                <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total</Text>
                  <Text style={[styles.totalAmount, { color: colors.primary }]}>{total}</Text>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.checkoutBtn,
                    { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed || isCheckingOut ? 0.8 : 1 },
                  ]}
                  onPress={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Feather name="check-circle" size={20} color="#fff" />
                      <Text style={styles.checkoutText}>Place Order</Text>
                    </>
                  )}
                </Pressable>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: "800" },
  clearText: { fontSize: 14, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
  list: { padding: 16, paddingBottom: 40 },
  cartItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderWidth: 1, marginBottom: 12 },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  itemFarm: { fontSize: 12, marginBottom: 4 },
  itemPrice: { fontSize: 14, fontWeight: "600" },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 32, height: 32, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: 16, fontWeight: "700", minWidth: 24, textAlign: "center" },
  removeBtn: { padding: 4 },
  checkoutSection: { paddingTop: 8 },
  sectionLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  addressInput: { flexDirection: "row", alignItems: "flex-start", borderWidth: 1, padding: 14, marginBottom: 20, minHeight: 54 },
  addressText: { flex: 1, fontSize: 15 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: 16, marginBottom: 16 },
  totalLabel: { fontSize: 16, fontWeight: "600" },
  totalAmount: { fontSize: 22, fontWeight: "800" },
  checkoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, height: 56 },
  checkoutText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
