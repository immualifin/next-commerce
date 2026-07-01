import prisma from "@/lib/prisma"
import { getCategoryIcon } from "@/lib/category-icons"

// ── Types ──

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

// ── Data functions (Prisma-backed) ──

export async function getCategories(): Promise<CategoryItem[]> {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: getCategoryIcon(c.name),
    _count: { products: c._count.products },
  }))
}

export async function getProducts(): Promise<ProductItem[]> {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    image_url: p.image[0] ?? "",
    category_name: p.category.name,
  }))
}

export async function getBrands(): Promise<BrandItem[]> {
  const brands = await prisma.brand.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  })

  return brands.map((b) => ({
    id: b.id,
    name: b.name,
    logo_url: b.logo,
  }))
}
