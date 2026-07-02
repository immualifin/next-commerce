import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import prisma from "../lib/prisma";

// ── Helper: idempotent create (findFirst → create if missing) ──

async function ensure<T>(
  label: string,
  findFn: () => Promise<T | null>,
  createFn: () => Promise<T>,
): Promise<T> {
  const existing = await findFn();
  if (existing) {
    console.log(`  ⏭  ${label} — already exists`);
    return existing;
  }
  const created = await createFn();
  console.log(`  ✅ ${label} — created`);
  return created;
}

// ── Seed Data ──

const LOCATIONS = [
  { name: "Jakarta Pusat" },
  { name: "Bandung" },
  { name: "Surabaya" },
];

const BRANDS = [
  { name: "Apple", logo: "/assets/logos/apple.svg" },
  { name: "Samsung", logo: "/assets/logos/samsung.svg" },
  { name: "Microsoft", logo: "/assets/logos/microsoft.svg" },
  { name: "Huawei", logo: "/assets/logos/huawei.svg" },
  { name: "Nokia", logo: "/assets/logos/nokia.svg" },
];

const CATEGORIES = [
  "Electronics",
  "Accessories",
  "Gaming",
  "Home & Living",
  "Food & Beverage",
  "Computers",
  "Audio",
  "Wearables",
] as const;

const PRODUCTS = [
  {
    name: 'iMac 24" M3 2024',
    description: "Apple iMac 24-inch with M3 chip (2024)",
    price: 22_999_000,
    image: [
      "/assets/thumbnails/imac24-digitalmat-gallery-1-202310-Photoroom 1.png",
    ],
    brandName: "Apple",
    categoryName: "Computers",
    stock: "ready" as const,
  },
  {
    name: "iPhone 15 Pro Max",
    description: "Apple iPhone 15 Pro Max",
    price: 16_999_000,
    image: [
      "/assets/thumbnails/iphone15pro-digitalmat-gallery-3-202309-Photoroom 1.png",
    ],
    brandName: "Apple",
    categoryName: "Electronics",
    stock: "ready" as const,
  },
  {
    name: "AirPods Max Sky Blue",
    description: "Apple AirPods Max — Sky Blue",
    price: 8_499_000,
    image: [
      "/assets/thumbnails/airpods-max-select-skyblue-202011-Photoroom 1.png",
    ],
    brandName: "Apple",
    categoryName: "Audio",
    stock: "ready" as const,
  },
  {
    name: 'MacBook Pro 16" M3',
    description: "Apple MacBook Pro 16-inch with M3 chip",
    price: 36_999_000,
    image: ["/assets/thumbnails/246c3a1bf608fed816e2e038784fa995.png"],
    brandName: "Apple",
    categoryName: "Computers",
    stock: "ready" as const,
  },
  {
    name: 'iPad Air 11" M2',
    description: "Apple iPad Air 11-inch with M2 chip",
    price: 11_499_000,
    image: ["/assets/thumbnails/ea49dfcfcaa4513d799050c989d2f177.png"],
    brandName: "Apple",
    categoryName: "Electronics",
    stock: "ready" as const,
  },
  {
    name: "Apple Watch Ultra 2",
    description: "Apple Watch Ultra 2",
    price: 12_999_000,
    image: [
      "/assets/thumbnails/color_back_green__buxxfjccqjzm_large_2x-Photoroom 1.png",
    ],
    brandName: "Apple",
    categoryName: "Wearables",
    stock: "ready" as const,
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Samsung Galaxy S24 Ultra",
    price: 18_999_000,
    image: [
      "/assets/thumbnails/iphone15pro-digitalmat-gallery-3-202309-Photoroom 1.png",
    ],
    brandName: "Samsung",
    categoryName: "Electronics",
    stock: "ready" as const,
  },
  {
    name: "PlayStation 5 Digital",
    description: "PlayStation 5 Digital Edition",
    price: 7_299_000,
    image: ["/assets/thumbnails/ea49dfcfcaa4513d799050c989d2f177.png"],
    brandName: "Microsoft",
    categoryName: "Gaming",
    stock: "ready" as const,
  },
  {
    name: "Nintendo Switch OLED",
    description: "Nintendo Switch OLED Model",
    price: 4_999_000,
    image: [
      "/assets/thumbnails/color_back_green__buxxfjccqjzm_large_2x-Photoroom 1.png",
    ],
    brandName: "Nokia",
    categoryName: "Gaming",
    stock: "ready" as const,
  },
  {
    name: "Sony WH-1000XM5",
    description: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    price: 4_799_000,
    image: [
      "/assets/thumbnails/airpods-max-select-skyblue-202011-Photoroom 1.png",
    ],
    brandName: "Huawei",
    categoryName: "Audio",
    stock: "ready" as const,
  },
  // ── Additional products (Phase 17 — catalog seeding) ──
  {
    name: "Samsung Galaxy Tab S9 Ultra",
    description: "Samsung Galaxy Tab S9 Ultra 14.6-inch",
    price: 15_999_000,
    image: [
      "/assets/thumbnails/ea49dfcfcaa4513d799050c989d2f177.png",
    ],
    brandName: "Samsung",
    categoryName: "Electronics",
    stock: "ready" as const,
    locationName: "Bandung",
  },
  {
    name: "Samsung Galaxy Watch 6 Classic",
    description: "Samsung Galaxy Watch 6 Classic 47mm",
    price: 5_499_000,
    image: [
      "/assets/thumbnails/color_back_green__buxxfjccqjzm_large_2x-Photoroom 1.png",
    ],
    brandName: "Samsung",
    categoryName: "Wearables",
    stock: "preorder" as const,
    locationName: "Bandung",
  },
  {
    name: "Microsoft Surface Pro 10",
    description: "Microsoft Surface Pro 10 — 2-in-1 tablet & laptop",
    price: 16_999_000,
    image: [
      "/assets/thumbnails/246c3a1bf608fed816e2e038784fa995.png",
    ],
    brandName: "Microsoft",
    categoryName: "Computers",
    stock: "preorder" as const,
    locationName: "Surabaya",
  },
  {
    name: "Xbox Series X",
    description: "Microsoft Xbox Series X — 1TB SSD",
    price: 8_199_000,
    image: [
      "/assets/thumbnails/ea49dfcfcaa4513d799050c989d2f177.png",
    ],
    brandName: "Microsoft",
    categoryName: "Gaming",
    stock: "ready" as const,
    locationName: "Surabaya",
  },
  {
    name: "Huawei MatePad Pro 13.2",
    description: "Huawei MatePad Pro 13.2-inch OLED",
    price: 9_999_000,
    image: [
      "/assets/thumbnails/imac24-digitalmat-gallery-1-202310-Photoroom 1.png",
    ],
    brandName: "Huawei",
    categoryName: "Electronics",
    stock: "preorder" as const,
    locationName: "Bandung",
  },
  {
    name: "Huawei Watch GT 4",
    description: "Huawei Watch GT 4 — 46mm smartwatch",
    price: 3_299_000,
    image: [
      "/assets/thumbnails/color_back_green__buxxfjccqjzm_large_2x-Photoroom 1.png",
    ],
    brandName: "Huawei",
    categoryName: "Wearables",
    stock: "ready" as const,
    locationName: "Bandung",
  },
  {
    name: "Nokia XR21 5G",
    description: "Nokia XR21 5G — rugged smartphone",
    price: 5_999_000,
    image: [
      "/assets/thumbnails/iphone15pro-digitalmat-gallery-3-202309-Photoroom 1.png",
    ],
    brandName: "Nokia",
    categoryName: "Electronics",
    stock: "preorder" as const,
    locationName: "Surabaya",
  },
  {
    name: "Nokia T21 Tablet",
    description: "Nokia T21 10.36-inch tablet",
    price: 2_999_000,
    image: [
      "/assets/thumbnails/ea49dfcfcaa4513d799050c989d2f177.png",
    ],
    brandName: "Nokia",
    categoryName: "Electronics",
    stock: "ready" as const,
    locationName: "Surabaya",
  },
  {
    name: "SteelSeries Arctis Nova Pro",
    description: "SteelSeries Arctis Nova Pro — wireless gaming headset",
    price: 3_799_000,
    image: [
      "/assets/thumbnails/airpods-max-select-skyblue-202011-Photoroom 1.png",
    ],
    brandName: "Microsoft",
    categoryName: "Audio",
    stock: "ready" as const,
    locationName: "Bandung",
  },
  {
    name: "Samsung Galaxy Buds 3 Pro",
    description: "Samsung Galaxy Buds 3 Pro — noise cancelling earbuds",
    price: 2_799_000,
    image: [
      "/assets/thumbnails/airpods-max-select-skyblue-202011-Photoroom 1.png",
    ],
    brandName: "Samsung",
    categoryName: "Audio",
    stock: "preorder" as const,
    locationName: "Surabaya",
  },
  {
    name: "Logitech MX Master 3S",
    description: "Logitech MX Master 3S — wireless productivity mouse",
    price: 1_499_000,
    image: [
      "/assets/thumbnails/246c3a1bf608fed816e2e038784fa995.png",
    ],
    brandName: "Nokia",
    categoryName: "Accessories",
    stock: "ready" as const,
    locationName: "Bandung",
  },
  {
    name: 'Dell UltraSharp U2723QE 27" 4K',
    description: "Dell UltraSharp 27-inch 4K USB-C Hub Monitor",
    price: 9_299_000,
    image: [
      "/assets/thumbnails/imac24-digitalmat-gallery-1-202310-Photoroom 1.png",
    ],
    brandName: "Microsoft",
    categoryName: "Computers",
    stock: "preorder" as const,
    locationName: "Surabaya",
  },
] as {
  name: string
  description: string
  price: number
  image: string[]
  brandName: string
  categoryName: string
  stock: "ready" | "preorder"
  locationName?: string
}[];

// Add locationName to existing products (all Jakarta Pusat)
for (const p of PRODUCTS) {
  p.locationName ??= "Jakarta Pusat";
}


// ── Main ──

async function seed() {
  console.log("🌱 Seeding database…\n");

  // ── Superadmin ──
  const email = "admin@example.com";
  const password = "admin123456";
  const name = "Super Admin";

  console.log("👤 Superadmin:");
  const hashed = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, rule: "superadmin", emailVerified: true },
  });
  await prisma.account.upsert({
    where: {
      providerId_accountId: { providerId: "credential", accountId: email },
    },
    update: { password: hashed },
    create: {
      userId: user.id,
      accountId: email,
      providerId: "credential",
      password: hashed,
    },
  });
  console.log(`  ✅ Email:    ${email}`);
  console.log(`  ✅ Password: ${password}`);
  console.log(`  ✅ Role:     superadmin\n`);

  // ── Locations ──
  console.log("📍 Locations:");
  const locationMap: Record<string, string> = {};
  for (const loc of LOCATIONS) {
    const location = await ensure(
      loc.name,
      () =>
        prisma.location.findFirst({
          where: { name: loc.name, deletedAt: null },
        }),
      () => prisma.location.create({ data: loc }),
    );
    locationMap[location.name] = location.id;
  }

  // ── Brands ──
  console.log("\n🏷️  Brands:");
  const brandMap: Record<string, string> = {};
  for (const b of BRANDS) {
    const brand = await ensure(
      b.name,
      () =>
        prisma.brand.findFirst({ where: { name: b.name, deletedAt: null } }),
      () => prisma.brand.create({ data: b }),
    );
    brandMap[brand.name] = brand.id;
  }

  // ── Categories ──
  console.log("\n📦 Categories:");
  const categoryMap: Record<string, string> = {};
  for (const catName of CATEGORIES) {
    const category = await ensure(
      catName,
      () =>
        prisma.category.findFirst({
          where: { name: catName, deletedAt: null },
        }),
      () => prisma.category.create({ data: { name: catName } }),
    );
    categoryMap[category.name] = category.id;
  }

  // ── Products ──
  console.log("\n🛒 Products:");
  for (const p of PRODUCTS) {
    // Assign location: spread across Jakarta, Bandung, Surabaya
    const locName =
      p.locationName ??
      LOCATIONS[PRODUCTS.indexOf(p) % LOCATIONS.length].name;

    await ensure(
      p.name,
      () =>
        prisma.product.findFirst({
          where: { name: p.name, deletedAt: null },
        }),
      () =>
        prisma.product.create({
          data: {
            name: p.name,
            description: p.description,
            price: BigInt(p.price),
            image: p.image,
            stock: p.stock,
            brandId: brandMap[p.brandName],
            categoryId: categoryMap[p.categoryName],
            locationId: locationMap[locName],
          },
        }),
    );
  }

  console.log("\n🎉 Seed complete!\n");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
