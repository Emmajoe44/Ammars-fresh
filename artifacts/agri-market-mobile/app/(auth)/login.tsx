import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLogin } from "@workspace/api-client-react";
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

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn } = useAuth();
  const loginMutation = useLogin();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async () => {
    if (!phone.trim() || !password) {
      Alert.alert("Missing info", "Please enter your phone number and password.");
      return;
    }
    try {
      const response = await loginMutation.mutateAsync({ data: { phone: phone.trim(), password } });
      await signIn(response.token, response.user as any);
      const role = response.user.role;
      if (role === "farmer") router.replace("/(farmer)");
      else if (role === "admin") router.replace("/(admin)");
      else router.replace("/(retailer)");
    } catch {
      Alert.alert("Login failed", "Invalid phone number or password.");
    }
  };

  const fillDemo = (p: string, pw: string) => {
    setPhone(p);
    setPassword(pw);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.primary + "1A", colors.background, colors.secondary + "10"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandRow}>
            <View style={[styles.brandIcon, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="leaf" size={22} color="#fff" />
            </View>
            <Text style={[styles.brandText, { color: colors.foreground }]}>AgriMarket</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Sign in to your AgriMarket account
            </Text>

            <Text style={[styles.label, { color: colors.foreground }]}>Phone number</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="phone" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="+211 9XX XXX XXX"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoComplete="tel"
              />
            </View>

            <Text style={[styles.label, { color: colors.foreground, marginTop: 14 }]}>Password</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPwd}
                autoComplete="current-password"
              />
              <TouchableOpacity onPress={() => setShowPwd((v) => !v)} hitSlop={8}>
                <Feather name={showPwd ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={loginMutation.isPending}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: colors.primary, opacity: pressed || loginMutation.isPending ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Text>
            </Pressable>

            <View style={[styles.demoBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Text style={[styles.demoTitle, { color: colors.foreground }]}>Demo accounts</Text>
              {[
                { role: "Admin", phone: "+211900000001", pw: "admin123" },
                { role: "Farmer", phone: "+211900000002", pw: "farmer123" },
                { role: "Retailer", phone: "+211900000004", pw: "retailer123" },
              ].map((d) => (
                <TouchableOpacity
                  key={d.phone}
                  onPress={() => fillDemo(d.phone, d.pw)}
                  style={styles.demoRow}
                >
                  <Text style={[styles.demoRole, { color: colors.primary }]}>{d.role}</Text>
                  <Text style={[styles.demoText, { color: colors.mutedForeground }]}>{d.phone}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.footerRow}>
              <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>No account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={[styles.link, { color: colors.primary }]}>Register here</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            South Sudan's agricultural marketplace · Farm to market
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20, paddingTop: 60, paddingBottom: 40 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24, justifyContent: "center" },
  brandIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  brandText: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: "#1a1410", shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 4 },
      web: { boxShadow: "0 12px 32px rgba(26, 20, 16, 0.08)" } as any,
      default: {},
    }),
  },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 22 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  primaryBtn: {
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  demoBox: { marginTop: 18, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, gap: 4 },
  demoTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  demoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 4 },
  demoRole: { fontSize: 13, fontWeight: "700", width: 70 },
  demoText: { fontSize: 12, fontVariant: ["tabular-nums"] },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  link: { fontSize: 14, fontWeight: "700" },
  tagline: { fontSize: 12, textAlign: "center", marginTop: 24 },
});
