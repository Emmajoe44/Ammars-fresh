import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRegister } from "@workspace/api-client-react";
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
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
          phone: phone.trim(),
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
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: topPad }]}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>

        <View style={[styles.logoWrap, { backgroundColor: colors.primary, borderRadius: colors.radius * 2 }]}>
          <MaterialCommunityIcons name="leaf" size={40} color="#fff" />
        </View>

        <Text style={[styles.title, { color: colors.foreground }]}>Join AgriMarket</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Create your free account</Text>

        <Text style={[styles.label, { color: colors.mutedForeground }]}>I am a</Text>
        <View style={[styles.roleRow]}>
          {(["retailer", "farmer"] as Role[]).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRole(r)}
              style={[
                styles.roleBtn,
                {
                  borderRadius: colors.radius,
                  borderColor: role === r ? colors.primary : colors.border,
                  backgroundColor: role === r ? colors.primary + "18" : colors.card,
                },
              ]}
            >
              <Feather
                name={r === "retailer" ? "shopping-bag" : "sun"}
                size={18}
                color={role === r ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.roleText,
                  { color: role === r ? colors.primary : colors.mutedForeground, fontWeight: role === r ? "700" : "500" },
                ]}
              >
                {r === "retailer" ? "Retailer (Buyer)" : "Farmer (Seller)"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {[
          { label: "Full name *", value: name, onChange: setName, placeholder: "Your full name", icon: "user" },
          { label: "Phone number *", value: phone, onChange: setPhone, placeholder: "+211 9XX XXX XXX", icon: "phone", keyboardType: "phone-pad" },
          { label: "Location", value: location, onChange: setLocation, placeholder: "e.g. Juba, Central Equatoria", icon: "map-pin" },
        ].map(({ label, value, onChange, placeholder, icon, keyboardType }) => (
          <View key={label}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.card }]}>
              <Feather name={icon as any} size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder={placeholder}
                placeholderTextColor={colors.mutedForeground}
                value={value}
                onChangeText={onChange}
                keyboardType={(keyboardType as any) ?? "default"}
                autoCapitalize="none"
              />
            </View>
          </View>
        ))}

        {role === "farmer" && (
          <View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Farm name</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.card }]}>
              <Feather name="home" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="e.g. Deng Family Farm"
                placeholderTextColor={colors.mutedForeground}
                value={farmName}
                onChangeText={setFarmName}
              />
            </View>
          </View>
        )}

        <Text style={[styles.label, { color: colors.mutedForeground }]}>Password *</Text>
        <View style={[styles.inputWrap, { borderColor: colors.border, borderRadius: colors.radius, backgroundColor: colors.card }]}>
          <Feather name="lock" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Min 6 characters"
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
            styles.createBtn,
            { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleRegister}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.createText}>Create Account</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.signInLink}>
          <Text style={[styles.signInText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign in</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, alignItems: "stretch" },
  backBtn: { position: "absolute", left: 24 },
  logoWrap: { width: 72, height: 72, alignItems: "center", justifyContent: "center", marginBottom: 20, alignSelf: "center", marginTop: 28 },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 24 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8, marginTop: 6 },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  roleBtn: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderWidth: 1.5 },
  roleText: { fontSize: 14 },
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, marginBottom: 14, paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  eyeBtn: { padding: 4 },
  createBtn: { height: 54, alignItems: "center", justifyContent: "center", marginTop: 8, marginBottom: 20 },
  createText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  signInLink: { alignItems: "center" },
  signInText: { fontSize: 14 },
});
