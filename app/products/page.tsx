import Link from "next/link"
import { headers } from "next/headers"
import type { Prisma } from "@prisma/client"
import { XIcon } from "lucide-react"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import CardProduct from "@/components/landing/card-product"
import { LandingNavbar } from "@/components/landing/landing-navbar"

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

// ── Page ──

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; brand?: string }>
}) {
  const user = await getCurrentUser()
  const { category: categoryId, brand: brandId } = await searchParams

  // Build where clause
  const where: Prisma.ProductWhereInput = { deletedAt: null }
  if (categoryId) where.categoryId = categoryId
  if (brandId) where.brandId = brandId

  // Fetch products, categories, brands in parallel
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, brand: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    }),
  ])

  // Resolve active filter names
  const activeCategory = categoryId
    ? categories.find((c) => c.id === categoryId)
    : null
  const activeBrand = brandId ? brands.find((b) => b.id === brandId) : null

  // Build remaining-params helper for filter chips
  function clearFilter(key: "category" | "brand") {
    const params = new URLSearchParams()
    if (key === "category" && brandId) params.set("brand", brandId)
    if (key === "brand" && categoryId) params.set("category", categoryId)
    const qs = params.toString()
    return qs ? `?${qs}` : ""
  }

  const hasFilter = !!activeCategory || !!activeBrand

  return (
    <div className="min-h-svh bg-white">
      {/* ── Header ── */}
      <header className="bg-[#EFF3FA] pb-[50px] pt-[30px]">
        <LandingNavbar user={user} />

        {/* Page Title */}
        <div className="container mx-auto mt-[50px] max-w-[1130px]">
          <h1 className="text-[42px] font-bold leading-[48px] text-gray-900">
            All Products
          </h1>
          <p className="mt-3 text-lg text-[#6A7789]">
            {hasFilter
              ? "Filtered results — browse and find your next favorite."
              : "Browse our collection — find exactly what you need."}
          </p>
        </div>
      </header>

      {/* ── Content ── */}
      <section className="container mx-auto max-w-[1130px] pb-[100px] pt-[50px]">
        {/* Filter chips */}
        {hasFilter && (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-[#6A7789]">
              Active filters:
            </span>
            {activeCategory && (
              <Link
                href={clearFilter("category") || "/products"}
                className="inline-flex items-center gap-2 rounded-full bg-[#0D5CD7] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#0D5CD7]/80"
              >
                {activeCategory.name}
                <XIcon className="size-4" />
              </Link>
            )}
            {activeBrand && (
              <Link
                href={clearFilter("brand") || "/products"}
                className="inline-flex items-center gap-2 rounded-full bg-[#0D5CD7] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#0D5CD7]/80"
              >
                {activeBrand.name}
                <XIcon className="size-4" />
              </Link>
            )}
            <Link
              href="/products"
              className="text-sm font-medium text-[#6A7789] underline transition-colors hover:text-[#0D5CD7]"
            >
              Clear all
            </Link>
          </div>
        )}

        {/* Products grid */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EFF3FA]">
              <img
                src="/assets/icons/box.svg"
                alt="empty"
                className="size-10 opacity-40"
              />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              No products found
            </h2>
            <p className="mt-2 text-sm text-[#6A7789]">
              {hasFilter
                ? "Try adjusting or clearing the filters."
                : "Products will appear here once they are added."}
            </p>
            {hasFilter && (
              <Link
                href="/products"
                className="mt-6 rounded-full bg-[#0D5CD7] px-6 py-3 font-semibold text-white transition-all hover:bg-[#0D5CD7]/90"
              >
                Clear Filters
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-[30px]">
            {products.map((p) => (
              <CardProduct
                key={p.id}
                item={{
                  id: p.id,
                  name: p.name,
                  price: Number(p.price),
                  image_url: p.image[0] ?? "",
                  category_name: p.category.name,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E5E5E5] bg-white px-6 py-8 text-center text-sm text-[#6A7789]">
        &copy; {new Date().getFullYear()} Next Commerce. All rights reserved.
      </footer>
    </div>
  )
}
