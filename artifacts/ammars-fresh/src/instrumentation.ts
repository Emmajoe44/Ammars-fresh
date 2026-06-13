export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateObjectStorageConfig } = await import("./server/validateObjectStorage");
    validateObjectStorageConfig();
    const seedDemo =
      process.env.SEED_DEMO === "true" ||
      (process.env.DATABASE_URL && process.env.VERCEL_ENV !== "production");
    if (seedDemo && process.env.DATABASE_URL) {
      const { bootstrapDemoData } = await import("./server/bootstrap");
      void bootstrapDemoData();
    }
  }
}
