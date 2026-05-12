import { Stack } from "expo-router";

import { AuthOnlyGuard } from "@/components/RoleGuard";

export default function AuthLayout() {
  return (
    <AuthOnlyGuard>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </AuthOnlyGuard>
  );
}
