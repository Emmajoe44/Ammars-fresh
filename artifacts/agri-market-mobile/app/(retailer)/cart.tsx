import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCreateOrder } from "@workspace/api-client-react";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { Pill, PJS, PrimaryButton, SectionLabel } from "@/components/ui";

export default function CartScreen() {
  const colors = useColors();
  const { currency } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, totalSSP, totalUSD, count } = useCart();
  const createOrderMutation = useCreateOrder();
  const [address, setAddress] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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
      <Header
        title="My Cart"
        subtitle={count > 0 ? `${count} item${count === 1 ? "" : "s"} ready` : "Your basket is empty"}
        eyebrow="Checkout"
        variant="gradient"
        right={
          count > 0 ? (
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); clearCart(); }}
              hitSlop={8}
              style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.18)" }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontFamily: PJS.bold }}>Clear all</Text>
            </Pressable>
          ) : null
        }
      />

      {items.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Feather name="shopping-cart" size={36} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: PJS.bold }]}>Your cart is empty</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
            Browse produce and add items to your cart
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.productId)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.foreground, fontFamily: PJS.bold }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.itemFarm, { color: colors.mutedForeground, fontFamily: PJS.medium }]} numberOfLines={1}>
                  {item.farmName ?? item.farmerName}
                </Text>
                <View style={{ flexDirection: "row", marginTop: 6 }}>
                  <Pill
                    label={`${currency === "USD" ? `$${item.priceUSD.toFixed(2)}` : `SSP ${item.priceSSP}`} / ${item.unit}`}
                    color={colors.primary}
                    icon="tag"
                  />
                </View>
              </View>
              <View style={styles.qtyControls}>
                <Pressable
                  onPress={() => { Haptics.selectionAsync(); updateQuantity(item.productId, item.quantity - 1); }}
                  style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}
                >
                  <Feather name="minus" size={14} color={colors.foreground} />
                </Pressable>
                <Text style={[styles.qtyText, { color: colors.foreground, fontFamily: PJS.bold }]}>{item.quantity}</Text>
                <Pressable
                  onPress={() => { Haptics.selectionAsync(); updateQuantity(item.productId, item.quantity + 1); }}
                  style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}
                >
                  <Feather name="plus" size={14} color={colors.foreground} />
                </Pressable>
                <Pressable
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); removeItem(item.productId); }}
                  style={styles.removeBtn}
                  hitSlop={8}
                >
                  <Feather name="trash-2" size={16} color={colors.destructive} />
                </Pressable>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={{ marginTop: 8 }}>
              <SectionLabel label="Delivery address" />
              <View style={[styles.addressInput, { borderColor: colors.border, backgroundColor: colors.card }]}>
                <Feather name="map-pin" size={18} color={colors.mutedForeground} style={{ marginRight: 10, marginTop: 2 }} />
                <TextInput
                  style={[styles.addressText, { color: colors.foreground, fontFamily: PJS.medium }]}
                  placeholder="Enter delivery address"
                  placeholderTextColor={colors.mutedForeground}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                />
              </View>

              <Card style={{ marginTop: 4 }}>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>Subtotal</Text>
                  <Text style={[styles.totalAmount, { color: colors.foreground, fontFamily: PJS.bold }]}>{total}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>Delivery</Text>
                  <Text style={[styles.totalAmount, { color: colors.foreground, fontFamily: PJS.bold }]}>Calculated at dispatch</Text>
                </View>
                <View style={[styles.divider, { borderTopColor: colors.border }]} />
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.foreground, fontFamily: PJS.bold, fontSize: 16 }]}>Total</Text>
                  <Text style={[styles.totalAmount, { color: colors.primary, fontFamily: PJS.black, fontSize: 22 }]}>{total}</Text>
                </View>
              </Card>

              <View style={{ marginTop: 18 }}>
                <PrimaryButton
                  label={isCheckingOut ? "Placing order..." : "Place order"}
                  icon="check-circle"
                  trailingIcon={null}
                  onPress={handleCheckout}
                  disabled={isCheckingOut}
                  loading={isCheckingOut}
                />
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 18 },
  emptyText: { fontSize: 13, textAlign: "center" },
  list: { padding: 16, paddingBottom: 60 },
  cartItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, marginBottom: 10 },
  itemInfo: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 15, marginBottom: 2 },
  itemFarm: { fontSize: 12 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: { width: 30, height: 30, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  qtyText: { fontSize: 15, minWidth: 20, textAlign: "center" },
  removeBtn: { padding: 6, marginLeft: 4 },
  addressInput: { flexDirection: "row", alignItems: "flex-start", borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 14, marginBottom: 14, minHeight: 56 },
  addressText: { flex: 1, fontSize: 15 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 },
  totalLabel: { fontSize: 14 },
  totalAmount: { fontSize: 14 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, marginVertical: 6 },
});
