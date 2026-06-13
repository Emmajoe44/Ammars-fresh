import { usersTable } from "@workspace/db";

export function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    farmName: user.farmName,
    location: user.location,
    locationLat: user.locationLat,
    locationLng: user.locationLng,
    language: user.language,
    currency: user.currency,
    isActive: user.isActive,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}
