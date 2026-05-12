import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

type Role = "retailer" | "farmer" | "admin";

const HOME: Record<Role, "/(retailer)" | "/(farmer)" | "/(admin)"> = {
  retailer: "/(retailer)",
  farmer: "/(farmer)",
  admin: "/(admin)",
};

export function RoleGuard({
  allow,
  children,
}: {
  allow: Role;
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== allow) {
    const role = (user.role as Role) ?? "retailer";
    return <Redirect href={HOME[role] ?? "/(retailer)"} />;
  }

  return <>{children}</>;
}

export function AuthOnlyGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated && user) {
    const role = (user.role as Role) ?? "retailer";
    return <Redirect href={HOME[role] ?? "/(retailer)"} />;
  }

  return <>{children}</>;
}
