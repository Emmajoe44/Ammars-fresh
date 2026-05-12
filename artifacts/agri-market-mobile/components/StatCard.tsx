import { Feather } from "@expo/vector-icons";
import React from "react";

import { KpiTile } from "@/components/ui/KpiTile";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof Feather>["name"];
  tone?: "primary" | "secondary" | "info" | "warning" | "success" | "destructive";
  variant?: "plain" | "gradient";
  hint?: string;
  onPress?: () => void;
}

export function StatCard({ label, value, icon, tone = "primary", variant = "plain", hint, onPress }: StatCardProps) {
  const colors = useColors();
  const tint = (colors as any)[tone] as string;
  return (
    <KpiTile
      label={label}
      value={value}
      icon={icon}
      tint={tint}
      variant={variant}
      hint={hint}
      onPress={onPress}
    />
  );
}
