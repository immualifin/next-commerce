import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
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

export default async function BrandsPage() {
  const user = await getCurrentUser()

  const brands = await prisma.brand.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <div className="min-h-svh bg-white">
      {/* ── Header ── */}
      <header className="bg-[#EFF3FA] pb-[50px] pt-[30px]">
        <LandingNavbar user={user} />

        {/* Page Title */}
        <div className="container mx-auto mt-[50px] max-w-[1130px]">
          <h1 className="text-[42px] font-bold leading-[48px] text-gray-900">
            All Brands
          </h1>
          <p className="mt-3 text-lg text-[#6A7789]">
            Browse products by brand — explore our trusted partners.
          </p>
        </div>
      </header>

      {/* ── Brand Grid ── */}
      <section className="container mx-auto max-w-[1130px] pb-[100px] pt-[50px]">
        {brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EFF3FA]">
              <img
                src="/assets/icons/box.svg"
                alt="empty"
                className="size-10 opacity-40"
              />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              No brands yet
            </h2>
            <p className="mt-2 text-sm text-[#6A7789]">
              Brands will appear here once they are added.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-[30px]">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products?brand=${b.id}`}
                className="brands-card"
              >
                <div className="flex w-full flex-col items-center gap-3 rounded-[20px] bg-white p-[30px_20px] ring-1 ring-[#E5E5E5] transition-all duration-300 hover:ring-2 hover:ring-[#FFC736]">
                  <div className="flex h-[40px] w-full shrink-0 items-center justify-center overflow-hidden">
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-[2px]">
                    <p className="text-center font-semibold leading-[22px] text-gray-900">
                      {b.name}
                    </p>
                    <p className="text-sm text-[#616369]">
                      {b._count.products}{" "}
                      {b._count.products === 1 ? "product" : "products"}
                    </p>
                  </div>
                </div>
              </Link>
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
