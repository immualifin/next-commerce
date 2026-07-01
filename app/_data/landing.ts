// ── Static dummy data using bwa-belanja assets ──

const DUMMY_CATEGORIES = [
  { name: "Electronics", icon: "mobile.svg", count: 12 },
  { name: "Accessories", icon: "watch.svg", count: 8 },
  { name: "Gaming", icon: "game.svg", count: 15 },
  { name: "Home & Living", icon: "lamp.svg", count: 5 },
  { name: "Food & Beverage", icon: "cake.svg", count: 10 },
  { name: "Computers", icon: "monitor.svg", count: 7 },
  { name: "Audio", icon: "airpods.svg", count: 4 },
  { name: "Wearables", icon: "tag.svg", count: 6 },
]

const DUMMY_PRODUCTS = [
  {
    id: "dummy-1",
    name: "iMac 24\" M3 2024",
    price: 22_999_000,
    image_url:
      "/assets/thumbnails/imac24-digitalmat-gallery-1-202310-Photoroom 1.png",
    category_name: "Computers",
  },
  {
    id: "dummy-2",
    name: "iPhone 15 Pro Max",
    price: 16_999_000,
    image_url:
      "/assets/thumbnails/iphone15pro-digitalmat-gallery-3-202309-Photoroom 1.png",
    category_name: "Electronics",
  },
  {
    id: "dummy-3",
    name: "AirPods Max Sky Blue",
    price: 8_499_000,
    image_url:
      "/assets/thumbnails/airpods-max-select-skyblue-202011-Photoroom 1.png",
    category_name: "Audio",
  },
  {
    id: "dummy-4",
    name: "MacBook Pro 16\" M3",
    price: 36_999_000,
    image_url:
      "/assets/thumbnails/246c3a1bf608fed816e2e038784fa995.png",
    category_name: "Computers",
  },
  {
    id: "dummy-5",
    name: "iPad Air 11\" M2",
    price: 11_499_000,
    image_url:
      "/assets/thumbnails/ea49dfcfcaa4513d799050c989d2f177.png",
    category_name: "Electronics",
  },
  {
    id: "dummy-6",
    name: "Apple Watch Ultra 2",
    price: 12_999_000,
    image_url:
      "/assets/thumbnails/color_back_green__buxxfjccqjzm_large_2x-Photoroom 1.png",
    category_name: "Wearables",
  },
  {
    id: "dummy-7",
    name: "Samsung Galaxy S24 Ultra",
    price: 18_999_000,
    image_url:
      "/assets/thumbnails/iphone15pro-digitalmat-gallery-3-202309-Photoroom 1.png",
    category_name: "Electronics",
  },
  {
    id: "dummy-8",
    name: "PlayStation 5 Digital",
    price: 7_299_000,
    image_url:
      "/assets/thumbnails/ea49dfcfcaa4513d799050c989d2f177.png",
    category_name: "Gaming",
  },
  {
    id: "dummy-9",
    name: "Nintendo Switch OLED",
    price: 4_999_000,
    image_url:
      "/assets/thumbnails/color_back_green__buxxfjccqjzm_large_2x-Photoroom 1.png",
    category_name: "Gaming",
  },
  {
    id: "dummy-10",
    name: "Sony WH-1000XM5",
    price: 4_799_000,
    image_url:
      "/assets/thumbnails/airpods-max-select-skyblue-202011-Photoroom 1.png",
    category_name: "Audio",
  },
]

const DUMMY_BRANDS = [
  { id: "brand-1", name: "Apple", logo_url: "/assets/logos/apple.svg" },
  { id: "brand-2", name: "Samsung", logo_url: "/assets/logos/samsung.svg" },
  { id: "brand-3", name: "Microsoft", logo_url: "/assets/logos/microsoft.svg" },
  { id: "brand-4", name: "Huawei", logo_url: "/assets/logos/huawei.svg" },
  { id: "brand-5", name: "Nokia", logo_url: "/assets/logos/nokia.svg" },
]

export type CategoryItem = {
  id: string
  name: string
  icon: string
  _count: { products: number }
}

export type ProductItem = {
  id: string
  name: string
  price: number
  image_url: string
  category_name: string
}

export type BrandItem = {
  id: string
  name: string
  logo_url: string
}

export async function getCategories(): Promise<CategoryItem[]> {
  return DUMMY_CATEGORIES.map((c, i) => ({
    id: `cat-${i}`,
    name: c.name,
    icon: c.icon,
    _count: { products: c.count },
  }))
}

export async function getProducts(): Promise<ProductItem[]> {
  return DUMMY_PRODUCTS
}

export async function getBrands(): Promise<BrandItem[]> {
  return DUMMY_BRANDS
}
