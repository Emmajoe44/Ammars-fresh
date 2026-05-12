import React from "react";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  eyebrow?: string;
  variant?: "plain" | "gradient";
}

export function Header(props: HeaderProps) {
  return <ScreenHeader {...props} />;
}
