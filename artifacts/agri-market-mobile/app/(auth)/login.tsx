import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLogin } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useAuth();
  const loginMutation = useLogin();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your phone and password.");
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

  const topPad = Platform.OS === "web" ? 67 : insets.top + 20;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.logoWrap, { backgroundColor: colors.primary, borderRadius: colors.radius * 2 }]}>
          <MaterialCommunityIcons name="leaf" size={40} color="#fff" />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Sign in to your AgriMarket account
        </Text>

        <View style={[styles.inputWrap, { borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.card }]}>
          <Feather name="phone" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="+211 9XX XXX XXX"
            placeholderTextColor={colors.mutedForeground}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputWrap, { borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.card }]}>
          <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Password"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.signInBtn,
            { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleLogin}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signInText}>Sign In</Text>
          )}
        </Pressable>

        <View style={[styles.demoBox, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          <Text style={[styles.demoTitle, { color: colors.mutedForeground }]}>Demo accounts:</Text>
          <Text style={[styles.demoRow, { color: colors.mutedForeground }]}>Admin: +211900000001 / admin123</Text>
          <Text style={[styles.demoRow, { color: colors.mutedForeground }]}>Farmer: +211900000002 / farmer123</Text>
          <Text style={[styles.demoRow, { color: colors.mutedForeground }]}>Retailer: +211900000004 / retailer123</Text>
        </View>

        <Pressable onPress={() => router.push("/(auth)/register")} style={styles.registerLink}>
          <Text style={[styles.registerText, { color: colors.mutedForeground }]}>
            No account?{" "}
            <Text style={{ color: colors.primary, fontWeight: "700" }}>Register here</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, alignItems: "stretch" },
  logoWrap: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    alignSelf: "center",
  },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: "center", marginBottom: 32 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, height: "100%" },
  eyeBtn: { padding: 4 },
  signInBtn: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  signInText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  demoBox: { padding: 14, marginBottom: 20 },
  demoTitle: { fontWeight: "700", marginBottom: 6, fontSize: 13 },
  demoRow: { fontSize: 12, marginBottom: 2 },
  registerLink: { alignItems: "center" },
  registerText: { fontSize: 14 },
});
