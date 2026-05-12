import { Feather } from "@expo/vector-icons";
import { useRegister } from "@workspace/api-client-react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Brand } from "@/components/ui/Brand";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PJS } from "@/components/ui/typography";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

type Role = "retailer" | "farmer";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const registerMutation = useRegister();

  const [role, setRole] = useState<Role>("retailer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [farmName, setFarmName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    try {
      const response = await registerMutation.mutateAsync({
        data: {
          name: name.trim(),
          phone: phone.replace(/\s+/g, ""),
          password,
          role,
          location: location.trim() || null,
          farmName: role === "farmer" ? (farmName.trim() || null) : null,
        },
      });
      await signIn(response.token, response.user as any);
      if (role === "farmer") router.replace("/(farmer)");
      else router.replace("/(retailer)");
    } catch {
      Alert.alert("Registration failed", "This phone number may already be registered.");
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top + 14;

  const fields: { label: string; value: string; onChange: (s: string) => void; placeholder: string; icon: React.ComponentProps<typeof Feather>["name"]; keyboardType?: any }[] = [
    { label: "Full name", value: name, onChange: setName, placeholder: "Your full name", icon: "user" },
    { label: "Phone number", value: phone, onChange: setPhone, placeholder: "+211 9XX XXX XXX", icon: "phone", keyboardType: "phone-pad" },
    { label: "Location", value: location, onChange: setLocation, placeholder: "e.g. Juba, Central Equatoria", icon: "map-pin" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.primary + "22", colors.background, colors.secondary + "14"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: insets.bottom + 40 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>

          <View style={{ alignItems: "center", marginTop: 8, marginBottom: 18 }}>
            <Brand size="lg" showTag />
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.eyebrowRow}>
              <Feather name="user-plus" size={12} color={colors.primary} />
              <Text style={[styles.eyebrow, { color: colors.primary, fontFamily: PJS.bold }]}>JOIN THE NETWORK</Text>
            </View>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: PJS.black }]}>
              Create your account
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
              Free in seconds — start trading today
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: PJS.bold }]}>
              I AM A
            </Text>
            <View style={styles.roleRow}>
              {(["retailer", "farmer"] as Role[]).map((r) => {
                const active = role === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={[
                      styles.roleBtn,
                      {
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? colors.primary + "12" : colors.background,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.roleIcon,
                        { backgroundColor: active ? colors.primary : colors.muted },
                      ]}
                    >
                      <Feather
                        name={r === "retailer" ? "shopping-bag" : "sun"}
                        size={16}
                        color={active ? "#fff" : colors.mutedForeground}
                      />
                    </View>
                    <Text
                      style={[
                        styles.roleText,
                        {
                          color: active ? colors.primary : colors.foreground,
                          fontFamily: active ? PJS.bold : PJS.semibold,
                        },
                      ]}
                    >
                      {r === "retailer" ? "Retailer" : "Farmer"}
                    </Text>
                    <Text style={[styles.roleSub, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
                      {r === "retailer" ? "Buy produce" : "Sell produce"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {fields.map(({ label, value, onChange, placeholder, icon, keyboardType }) => (
              <View key={label}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: PJS.bold }]}>
                  {label.toUpperCase()}
                </Text>
                <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name={icon} size={16} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground, fontFamily: PJS.medium }]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.mutedForeground}
                    value={value}
                    onChangeText={onChange}
                    keyboardType={keyboardType ?? "default"}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ))}

            {role === "farmer" && (
              <View>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: PJS.bold }]}>
                  FARM NAME
                </Text>
                <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name="home" size={16} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground, fontFamily: PJS.medium }]}
                    placeholder="e.g. Deng Family Farm"
                    placeholderTextColor={colors.mutedForeground}
                    value={farmName}
                    onChangeText={setFarmName}
                  />
                </View>
              </View>
            )}

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: PJS.bold }]}>
              PASSWORD
            </Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: PJS.medium }]}
                placeholder="Min 6 characters"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={6}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <View style={{ marginTop: 22 }}>
              <PrimaryButton
                label={registerMutation.isPending ? "Creating account..." : "Create account"}
                onPress={handleRegister}
                loading={registerMutation.isPending}
              />
            </View>

            <Pressable onPress={() => router.back()} style={styles.signInLink}>
              <Text style={[styles.signInText, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
                Already have an account?{" "}
                <Text style={{ color: colors.primary, fontFamily: PJS.bold }}>Sign in</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20 },
  backBtn: {
    width: 38, height: 38, borderRadius: 999,
    alignItems: "center", justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: "#1a1410", shadowOpacity: 0.08, shadowRadius: 28, shadowOffset: { width: 0, height: 12 } },
      android: { elevation: 6 },
      web: { boxShadow: "0 18px 40px rgba(26, 20, 16, 0.08)" } as any,
      default: {},
    }),
  },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  eyebrow: { fontSize: 10, letterSpacing: 1.5 },
  title: { fontSize: 26, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 13, marginBottom: 22 },
  fieldLabel: { fontSize: 10, letterSpacing: 1.4, marginBottom: 8, marginTop: 14 },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 6 },
  roleBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 6,
  },
  roleIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  roleText: { fontSize: 14 },
  roleSub: { fontSize: 11 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  signInLink: { alignItems: "center", marginTop: 16 },
  signInText: { fontSize: 14 },
});
