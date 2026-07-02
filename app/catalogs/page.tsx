import { headers } from "next/headers"
import type { Prisma, StockProduct } from "@prisma/client"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { serialize } from "@/lib/utils"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import SearchBar from "./_components/search-bar"
import FilterPrice from "./_components/filter-price"
import FilterSection from "./_components/filter-section"
import ProductGrid from "./_components/product-grid"

// ── Auth helper ──

async function getCurrentUser() {
  try {
    const h = await headers()
    const cookieHeader = h.get("cookie")
    if (!cookieHeader) return null

    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    })

    if (!session?.user) return null

    return {
      name: session.user.name ?? "User",
      image: session.user.image ?? null,
    }
  } catch {
    return null
  }
}

// ── Types ──

interface CatalogSearchParams {
  search?: string | string[]
  minPrice?: string | string[]
  maxPrice?: string | string[]
  stock?: string | string[]
  brand?: string | string[]
  category?: string | string[]
  location?: string | string[]
}

// ── Helpers ──

function getParam(
  param: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(param)) return param[0]
  return param
}

function getAllParam(param: string | string[] | undefined): string[] {
  if (!param) return []
  if (Array.isArray(param)) return param
  return [param]
}

// ── Page ──

export default async function CatalogsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>
}) {
  const user = await getCurrentUser()
  const sp = await searchParams

  // Parse filter values
  const search = getParam(sp.search)
  const minPriceRaw = getParam(sp.minPrice)
  const maxPriceRaw = getParam(sp.maxPrice)
  const stock = getAllParam(sp.stock).filter(
    (s): s is StockProduct => s === "ready" || s === "preorder",
  )
  const brandIds = getAllParam(sp.brand)
  const categoryIds = getAllParam(sp.category)
  const locationIds = getAllParam(sp.location)

  const minPrice = minPriceRaw ? Number(minPriceRaw) : undefined
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined

  // Build where clause
  const where: Prisma.ProductWhereInput = { deletedAt: null }

  if (search) {
    where.name = { contains: search, mode: "insensitive" }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && minPrice > 0
        ? { gte: BigInt(minPrice) }
        : {}),
      ...(maxPrice !== undefined && maxPrice > 0
        ? { lte: BigInt(maxPrice) }
        : {}),
    }
  }

  if (stock.length > 0) {
    where.stock = { in: stock }
  }

  if (brandIds.length > 0) {
    where.brandId = { in: brandIds }
  }

  if (categoryIds.length > 0) {
    where.categoryId = { in: categoryIds }
  }

  if (locationIds.length > 0) {
    where.locationId = { in: locationIds }
  }

  // Check if any filters are active
  const hasFilters =
    !!search ||
    !!minPrice ||
    !!maxPrice ||
    stock.length > 0 ||
    brandIds.length > 0 ||
    categoryIds.length > 0 ||
    locationIds.length > 0

  // Fetch data in parallel
  const [products, brands, categories, locations] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    }),
    prisma.location.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    }),
  ])

  // Serialize products for client component
  const serialized = serialize(products).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    name: p.name as string,
    price: Number(p.price),
    image_url: (p.image as string[])[0] ?? "",
    category_name: (p.category as { name: string }).name,
  }))

  // Build filter options from DB data
  const brandOptions = serialize(brands).map(
    (b: Record<string, unknown>) => ({
      id: b.id as string,
      label: b.name as string,
    }),
  )

  const categoryOptions = serialize(categories).map(
    (c: Record<string, unknown>) => ({
      id: c.id as string,
      label: c.name as string,
    }),
  )

  const locationOptions = serialize(locations).map(
    (l: Record<string, unknown>) => ({
      id: l.id as string,
      label: l.name as string,
    }),
  )

  const stockOptions = [
    { id: "ready", label: "Ready" },
    { id: "preorder", label: "Pre-order" },
  ]

  return (
    <div className="min-h-svh bg-white">
      {/* ── Header ── */}
      <header className="h-[351px] -mb-[181px] bg-[#EFF3FA] pt-[30px]">
        <LandingNavbar user={user} />
      </header>

      <SearchBar />

      {/* ── Content: Filters + Products ── */}
      <div className="container mx-auto mt-[50px] flex max-w-[1130px] gap-[30px] pb-[100px]">
        {/* Filter Sidebar */}
        <aside className="flex h-fit flex-1 flex-col gap-5 rounded-[30px] border border-[#E5E5E5] bg-white p-[30px]">
          <h2 className="text-2xl font-bold leading-[34px]">Filters</h2>

          <FilterPrice />

          <hr className="border-[#E5E5E5]" />

          <FilterSection
            title="Stocks"
            paramKey="stock"
            options={stockOptions}
          />

          <hr className="border-[#E5E5E5]" />

          <FilterSection
            title="Brands"
            paramKey="brand"
            options={brandOptions}
          />

          <hr className="border-[#E5E5E5]" />

          <FilterSection
            title="Location"
            paramKey="location"
            options={locationOptions}
          />

          <hr className="border-[#E5E5E5]" />

          <FilterSection
            title="Categories"
            paramKey="category"
            options={categoryOptions}
          />
        </aside>

        {/* Product Grid */}
        <div className="flex w-[780px] h-fit flex-col gap-[30px] rounded-[30px] border border-[#E5E5E5] bg-white p-[30px]">
          <h2 className="text-2xl font-bold leading-[34px]">Products</h2>
          <ProductGrid products={serialized} hasFilters={hasFilters} />
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E5E5E5] bg-white px-6 py-8 text-center text-sm text-[#6A7789]">
        &copy; {new Date().getFullYear()} Next Commerce. All rights reserved.
      </footer>
    </div>
  )
}
