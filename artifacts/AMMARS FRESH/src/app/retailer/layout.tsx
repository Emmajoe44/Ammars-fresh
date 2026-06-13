"use client";

import { RoleGuard } from "@/components/RoleGuard";

export default function RetailerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard role="retailer">{children}</RoleGuard>;
}
