export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateObjectStorageConfig } = await import("./server/validateObjectStorage");
    validateObjectStorageConfig();
    const { bootstrapDemoData } = await import("./server/bootstrap");
    void bootstrapDemoData();
  }
}
