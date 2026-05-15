import { Feather } from "@expo/vector-icons";
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

import { Brand } from "@/components/ui/Brand";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PJS } from "@/components/ui/typography";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn } = useAuth();
  const loginMutation = useLogin();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert("Missing info", "Please enter your email or phone and password.");
      return;
    }
    try {
      const raw = identifier.trim();
      const id = raw.includes("@") ? raw.toLowerCase() : raw.replace(/\s+/g, "");
      const response = await loginMutation.mutateAsync({
        data: { identifier: id, password },
      });
      await signIn(response.token, response.user as any);
      const role = response.user.role;
      if (role === "farmer") router.replace("/(farmer)");
      else if (role === "admin") router.replace("/(admin)");
      else router.replace("/(retailer)");
    } catch {
      Alert.alert("Login failed", "Invalid email/phone or password.");
    }
  };

  const fillDemo = (p: string, pw: string) => {
    setIdentifier(p);
    setPassword(pw);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.primary + "22", colors.background, colors.secondary + "14"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: "center", marginBottom: 26 }}>
            <Brand size="lg" showTag />
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.eyebrowRow}>
              <Feather name="log-in" size={12} color={colors.primary} />
              <Text style={[styles.eyebrow, { color: colors.primary, fontFamily: PJS.bold }]}>SIGN IN</Text>
            </View>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: PJS.black }]}>
              Welcome back
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
              Sign in to your AgriMarket account
            </Text>

            <Text style={[styles.label, { color: colors.foreground, fontFamily: PJS.semibold }]}>
              Email or phone
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="at-sign" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: PJS.medium }]}
                placeholder="you@example.com or +211 9XX XXX XXX"
                placeholderTextColor={colors.mutedForeground}
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
              />
            </View>

            <Text style={[styles.label, { color: colors.foreground, marginTop: 14, fontFamily: PJS.semibold }]}>
              Password
            </Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground, fontFamily: PJS.medium }]}
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

            <View style={{ marginTop: 22 }}>
              <PrimaryButton
                label={loginMutation.isPending ? "Signing in..." : "Sign In"}
                onPress={handleSubmit}
                loading={loginMutation.isPending}
                trailingIcon="arrow-right"
              />
            </View>

            <View style={[styles.demoBox, { backgroundColor: colors.muted + "70", borderColor: colors.border }]}>
              <View style={styles.demoHeadRow}>
                <Feather name="zap" size={11} color={colors.secondary} />
                <Text style={[styles.demoTitle, { color: colors.foreground, fontFamily: PJS.bold }]}>
                  DEMO ACCOUNTS
                </Text>
              </View>
              {[
                { role: "Admin", phone: "+211900000001", pw: "admin123" },
                { role: "Farmer", phone: "+211900000002", pw: "farmer123" },
                { role: "Retailer", phone: "+211900000004", pw: "retailer123" },
              ].map((d) => (
                <TouchableOpacity
                  key={d.phone}
                  onPress={() => fillDemo(d.phone, d.pw)}
                  style={[styles.demoRow, { borderColor: colors.border }]}
                >
                  <Text style={[styles.demoRole, { color: colors.primary, fontFamily: PJS.bold }]}>
                    {d.role}
                  </Text>
                  <Text style={[styles.demoText, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
                    {d.phone}
                  </Text>
                  <Feather name="arrow-up-right" size={13} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.footerRow}>
              <Text style={{ color: colors.mutedForeground, fontSize: 14, fontFamily: PJS.medium }}>
                No account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={[styles.link, { color: colors.primary, fontFamily: PJS.bold }]}>
                  Register here
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
            South Sudan's agricultural marketplace · Farm to market
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20, paddingTop: 60, paddingBottom: 40 },
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 26,
    ...Platform.select({
      ios: { shadowColor: "#1a1410", shadowOpacity: 0.08, shadowRadius: 28, shadowOffset: { width: 0, height: 12 } },
      android: { elevation: 6 },
      web: { boxShadow: "0 18px 40px rgba(26, 20, 16, 0.08)" } as any,
      default: {},
    }),
  },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  eyebrow: { fontSize: 10, letterSpacing: 1.5 },
  title: { fontSize: 28, letterSpacing: -0.6, marginBottom: 6 },
  subtitle: { fontSize: 14, marginBottom: 22 },
  label: { fontSize: 12, marginBottom: 6, letterSpacing: 0.2, textTransform: "uppercase" },
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
  demoBox: {
    marginTop: 22,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  demoHeadRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
  demoTitle: { fontSize: 10, letterSpacing: 1.4 },
  demoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  demoRole: { fontSize: 12, width: 70 },
  demoText: { flex: 1, fontSize: 12, fontVariant: ["tabular-nums"] },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  link: { fontSize: 14 },
  tagline: { fontSize: 12, textAlign: "center", marginTop: 26 },
});
