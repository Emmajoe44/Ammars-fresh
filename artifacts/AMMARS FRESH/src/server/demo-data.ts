import {
  db,
  usersTable,
  categoriesTable,
  productsTable,
  trucksTable,
  ordersTable,
  pricingRulesTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

const USD_SSP = 4500;

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "agrimarket_salt").digest("hex");
}

function usd(ssp: number) {
  return Number((ssp / USD_SSP).toFixed(2));
}

export const DEMO_USERS = [
  { name: "Admin User", phone: "+211900000001", password: "admin123", role: "admin" as const, location: "Juba" },
  { name: "Super Admin", phone: "+211911111111", password: "Admin@2024", role: "admin" as const, location: "Juba HQ" },
  { name: "Akuei Deng", phone: "+211900000002", password: "farmer123", role: "farmer" as const, farmName: "Deng Family Farm", location: "Bor, Jonglei" },
  { name: "Amara Lado", phone: "+211900000003", password: "farmer123", role: "farmer" as const, farmName: "Lado Green Farm", location: "Nimule, Eastern Equatoria" },
  { name: "Mary Wani", phone: "+211900000004", password: "retailer123", role: "retailer" as const, location: "Konyo Konyo Market, Juba" },
  { name: "James Lual", phone: "+211900000005", password: "retailer123", role: "retailer" as const, location: "Munuki Market, Juba" },
];

const DEMO_CATEGORIES = [
  { name: "Vegetables", nameAr: "خضروات", icon: "Carrot" },
  { name: "Fruits", nameAr: "فواكه", icon: "Apple" },
  { name: "Grains", nameAr: "حبوب", icon: "Wheat" },
  { name: "Legumes", nameAr: "بقوليات", icon: "Bean" },
  { name: "Leafy Greens", nameAr: "ورقيات", icon: "Leaf" },
];

const DEMO_TRUCKS = [
  { plateNumber: "SS-014", driverName: "Peter Majok", driverPhone: "+211920000014", status: "in_transit" as const, lat: 4.85, lng: 31.58 },
  { plateNumber: "SS-027", driverName: "Deng Arok", driverPhone: "+211920000027", status: "available" as const, lat: 4.86, lng: 31.6 },
  { plateNumber: "SS-031", driverName: "Mary Achol", driverPhone: "+211920000031", status: "available" as const, lat: 4.84, lng: 31.55 },
];

type DemoProduct = {
  name: string;
  nameAr: string;
  category: string;
  farmerPhone: string;
  quantity: number;
  unit: string;
  priceSSP: number;
  qualityGrade: "A" | "B" | "C";
  harvestDate: string;
  description: string;
  image: string;
};

function productImageUrl(image: string) {
  return `/demo-products/${image}.jpg`;
}

const DEMO_PRODUCTS: DemoProduct[] = [
  { name: "Fresh Tomatoes", nameAr: "طماطم طازجة", category: "Vegetables", farmerPhone: "+211900000002", quantity: 120, unit: "kg", priceSSP: 5000, qualityGrade: "A", harvestDate: "2026-06-10", description: "Ripe red tomatoes from Bor.", image: "tomatoes" },
  { name: "Red Onions", nameAr: "بصل أحمر", category: "Vegetables", farmerPhone: "+211900000002", quantity: 80, unit: "kg", priceSSP: 3500, qualityGrade: "A", harvestDate: "2026-06-09", description: "Bulb onions, good shelf life.", image: "onions" },
  { name: "Okra", nameAr: "بامية", category: "Vegetables", farmerPhone: "+211900000003", quantity: 45, unit: "kg", priceSSP: 4200, qualityGrade: "B", harvestDate: "2026-06-11", description: "Tender okra pods.", image: "okra" },
  { name: "Bananas", nameAr: "موز", category: "Fruits", farmerPhone: "+211900000003", quantity: 200, unit: "kg", priceSSP: 6000, qualityGrade: "A", harvestDate: "2026-06-08", description: "Sweet bananas from Nimule.", image: "bananas" },
  { name: "Mangoes", nameAr: "مانجو", category: "Fruits", farmerPhone: "+211900000003", quantity: 90, unit: "kg", priceSSP: 7500, qualityGrade: "A", harvestDate: "2026-06-07", description: "Seasonal mangoes.", image: "mangoes" },
  { name: "Sorghum", nameAr: "ذرة رفيعة", category: "Grains", farmerPhone: "+211900000002", quantity: 500, unit: "kg", priceSSP: 2800, qualityGrade: "A", harvestDate: "2026-05-20", description: "Dry sorghum grain.", image: "sorghum" },
  { name: "Groundnuts", nameAr: "فول سوداني", category: "Legumes", farmerPhone: "+211900000002", quantity: 150, unit: "kg", priceSSP: 4500, qualityGrade: "A", harvestDate: "2026-05-15", description: "Shelled groundnuts.", image: "groundnuts" },
  { name: "Kale", nameAr: "كرنب", category: "Leafy Greens", farmerPhone: "+211900000003", quantity: 60, unit: "kg", priceSSP: 4000, qualityGrade: "B", harvestDate: "2026-06-11", description: "Fresh leafy kale.", image: "kale" },
  { name: "Watermelon", nameAr: "بطيخ", category: "Fruits", farmerPhone: "+211900000002", quantity: 40, unit: "kg", priceSSP: 3200, qualityGrade: "A", harvestDate: "2026-06-06", description: "Large watermelons.", image: "watermelon" },
  { name: "Beans", nameAr: "فاصوليا", category: "Legumes", farmerPhone: "+211900000003", quantity: 100, unit: "kg", priceSSP: 3800, qualityGrade: "A", harvestDate: "2026-05-28", description: "Dried beans.", image: "beans" },
];

async function userIdByPhone(phone: string) {
  const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.phone, phone));
  return user?.id;
}

async function seedUsers() {
  let seeded = 0;
  for (const u of DEMO_USERS) {
    const [existing] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.phone, u.phone));
    if (!existing) {
      await db.insert(usersTable).values({
        name: u.name,
        phone: u.phone,
        email: null,
        passwordHash: hashPassword(u.password),
        role: u.role,
        farmName: u.farmName ?? null,
        location: u.location ?? null,
        language: "en",
        currency: "SSP",
        isActive: true,
        avatarUrl: null,
      });
      seeded++;
    }
  }
  return seeded;
}

async function seedCategories() {
  const existing = await db.select({ id: categoriesTable.id }).from(categoriesTable).limit(1);
  if (existing.length > 0) return 0;

  await db.insert(categoriesTable).values(DEMO_CATEGORIES);
  return DEMO_CATEGORIES.length;
}

async function categoryMap() {
  const rows = await db.select().from(categoriesTable);
  return new Map(rows.map((c) => [c.name, c.id]));
}

async function seedProducts() {
  const existing = await db.select({ id: productsTable.id }).from(productsTable).limit(1);
  if (existing.length > 0) return 0;

  const cats = await categoryMap();
  let seeded = 0;
  for (const p of DEMO_PRODUCTS) {
    const farmerId = await userIdByPhone(p.farmerPhone);
    const categoryId = cats.get(p.category);
    if (!farmerId || !categoryId) continue;
    await db.insert(productsTable).values({
      name: p.name,
      nameAr: p.nameAr,
      description: p.description,
      categoryId,
      farmerId,
      quantity: p.quantity,
      unit: p.unit,
      priceSSP: p.priceSSP,
      priceUSD: usd(p.priceSSP),
      available: true,
      harvestDate: p.harvestDate,
      imageUrl: productImageUrl(p.image),
      qualityGrade: p.qualityGrade,
    });
    seeded++;
  }
  return seeded;
}

async function seedProductImages() {
  let updated = 0;
  for (const p of DEMO_PRODUCTS) {
    const [row] = await db
      .select({ id: productsTable.id, imageUrl: productsTable.imageUrl })
      .from(productsTable)
      .where(eq(productsTable.name, p.name))
      .limit(1);
    if (row && !row.imageUrl) {
      await db
        .update(productsTable)
        .set({ imageUrl: productImageUrl(p.image) })
        .where(eq(productsTable.id, row.id));
      updated++;
    }
  }
  return updated;
}

async function seedTrucks() {
  let seeded = 0;
  for (const t of DEMO_TRUCKS) {
    const [existing] = await db
      .select({ id: trucksTable.id })
      .from(trucksTable)
      .where(eq(trucksTable.plateNumber, t.plateNumber));
    if (!existing) {
      await db.insert(trucksTable).values(t);
      seeded++;
    }
  }
  return seeded;
}

async function seedPricingRules() {
  const existing = await db.select({ id: pricingRulesTable.id }).from(pricingRulesTable).limit(1);
  if (existing.length > 0) return 0;

  const cats = await categoryMap();
  const rules = [
    { category: "Vegetables", minSSP: 2500, maxSSP: 8000, minUSD: 0.5, maxUSD: 2 },
    { category: "Fruits", minSSP: 3000, maxSSP: 10000, minUSD: 0.6, maxUSD: 2.5 },
    { category: "Grains", minSSP: 2000, maxSSP: 5000, minUSD: 0.4, maxUSD: 1.2 },
    { category: "Legumes", minSSP: 2500, maxSSP: 6000, minUSD: 0.5, maxUSD: 1.5 },
    { category: "Leafy Greens", minSSP: 2000, maxSSP: 5500, minUSD: 0.4, maxUSD: 1.3 },
  ];
  let seeded = 0;
  for (const r of rules) {
    const categoryId = cats.get(r.category);
    if (!categoryId) continue;
    await db.insert(pricingRulesTable).values({
      categoryId,
      minPriceSSP: r.minSSP,
      maxPriceSSP: r.maxSSP,
      minPriceUSD: r.minUSD,
      maxPriceUSD: r.maxUSD,
    });
    seeded++;
  }
  return seeded;
}

async function seedOrders() {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(ordersTable);
  if (Number(count) > 0) return 0;

  const maryId = await userIdByPhone("+211900000004");
  const jamesId = await userIdByPhone("+211900000005");
  const [truck] = await db.select().from(trucksTable).where(eq(trucksTable.plateNumber, "SS-014"));
  if (!maryId || !jamesId) return 0;

  const products = await db
    .select({
      id: productsTable.id,
      name: productsTable.name,
      unit: productsTable.unit,
      priceSSP: productsTable.priceSSP,
      priceUSD: productsTable.priceUSD,
    })
    .from(productsTable)
    .limit(4);

  if (products.length < 2) return 0;

  const item1 = products[0];
  const item2 = products[1];
  const item3 = products[2] ?? products[0];

  await db.insert(ordersTable).values([
    {
      retailerId: maryId,
      truckId: truck?.id ?? null,
      status: "in_transit",
      paymentStatus: "paid",
      paidAt: new Date(),
      totalSSP: item1.priceSSP * 10 + item2.priceSSP * 5,
      totalUSD: item1.priceUSD * 10 + item2.priceUSD * 5,
      currency: "SSP",
      deliveryLocation: "Konyo Konyo Market, Juba",
      deliveryLat: 4.8517,
      deliveryLng: 31.5825,
      notes: "Deliver before 2pm",
      items: [
        { productId: item1.id, productName: item1.name, quantity: 10, unit: item1.unit, priceSSP: item1.priceSSP, priceUSD: item1.priceUSD },
        { productId: item2.id, productName: item2.name, quantity: 5, unit: item2.unit, priceSSP: item2.priceSSP, priceUSD: item2.priceUSD },
      ],
    },
    {
      retailerId: jamesId,
      truckId: null,
      status: "delivered",
      paymentStatus: "paid",
      paidAt: new Date(Date.now() - 86400000),
      totalSSP: item3.priceSSP * 8,
      totalUSD: item3.priceUSD * 8,
      currency: "USD",
      deliveryLocation: "Munuki Market, Juba",
      deliveryLat: 4.838,
      deliveryLng: 31.569,
      notes: null,
      items: [
        { productId: item3.id, productName: item3.name, quantity: 8, unit: item3.unit, priceSSP: item3.priceSSP, priceUSD: item3.priceUSD },
      ],
    },
    {
      retailerId: maryId,
      truckId: null,
      status: "pending",
      paymentStatus: "unpaid",
      paidAt: null,
      totalSSP: item2.priceSSP * 12,
      totalUSD: item2.priceUSD * 12,
      currency: "USG",
      deliveryLocation: "Custom Market, Juba",
      deliveryLat: 4.855,
      deliveryLng: 31.59,
      notes: "Call on arrival",
      items: [
        { productId: item2.id, productName: item2.name, quantity: 12, unit: item2.unit, priceSSP: item2.priceSSP, priceUSD: item2.priceUSD },
      ],
    },
  ]);

  if (truck?.id) {
    const [order] = await db
      .select({ id: ordersTable.id })
      .from(ordersTable)
      .where(eq(ordersTable.status, "in_transit"))
      .limit(1);
    if (order) {
      await db.update(trucksTable).set({ currentOrderId: order.id }).where(eq(trucksTable.id, truck.id));
    }
  }

  return 3;
}

export async function seedDemoData(): Promise<void> {
  const users = await seedUsers();
  const categories = await seedCategories();
  const products = await seedProducts();
  const images = await seedProductImages();
  const trucks = await seedTrucks();
  const pricing = await seedPricingRules();
  const orders = await seedOrders();

  const total = users + categories + products + images + trucks + pricing + orders;
  if (total > 0) {
    console.info(
      `Demo data seeded (users=${users}, categories=${categories}, products=${products}, images=${images}, trucks=${trucks}, pricing=${pricing}, orders=${orders})`,
    );
  }
}
