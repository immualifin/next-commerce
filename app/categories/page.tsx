import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getCategoryIcon } from "@/lib/category-icons"

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

export default async function CategoriesPage() {
  const user = await getCurrentUser()

  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <div className="min-h-svh bg-white">
      {/* ── Header ── */}
      <header className="bg-[#EFF3FA] pb-[50px] pt-[30px]">
        {/* Navbar */}
        <nav className="container mx-auto flex max-w-[1130px] items-center justify-between rounded-3xl bg-[#0D5CD7] p-5">
          <div className="flex shrink-0 items-center gap-2">
            <Link href="/" className="text-xl font-bold text-white">
              Next Commerce
            </Link>
          </div>
          <ul className="flex items-center gap-[30px]">
            <li className="text-white transition-all duration-300 hover:font-bold hover:text-[#FFC736]">
              <Link href="/products">Shop</Link>
            </li>
            <li className="font-bold text-[#FFC736]">
              <Link href="/categories">Categories</Link>
            </li>
            <li className="text-white transition-all duration-300 hover:font-bold hover:text-[#FFC736]">
              <Link href="/#brands">Brands</Link>
            </li>
            <li className="text-white transition-all duration-300 hover:font-bold hover:text-[#FFC736]">
              <Link href="/products">Products</Link>
            </li>
          </ul>
          <div className="flex items-center gap-3">
            <Link href="/cart">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80">
                <img
                  src="/assets/icons/cart.svg"
                  alt="cart"
                  className="size-12"
                />
              </div>
            </Link>
            {user ? (
              <Link href="/account" className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  Hi, {user.name.split(" ")[0]}
                </span>
                <div className="flex size-[48px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E5E5E5] bg-white p-1">
                  {user.image ? (
                    <img
                      src={user.image}
                      className="size-full rounded-full object-cover"
                      alt={user.name}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-[#0D5CD7]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-full bg-white px-5 py-3 font-semibold text-[#0D5CD7] transition-all hover:bg-white/90"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-full bg-white px-5 py-3 font-semibold text-[#0D5CD7] transition-all hover:bg-white/90"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Page Title */}
        <div className="container mx-auto mt-[50px] max-w-[1130px]">
          <h1 className="text-[42px] font-bold leading-[48px] text-gray-900">
            All Categories
          </h1>
          <p className="mt-3 text-lg text-[#6A7789]">
            Browse products by category — find exactly what you need.
          </p>
        </div>
      </header>

      {/* ── Category Grid ── */}
      <section className="container mx-auto max-w-[1130px] pb-[100px] pt-[50px]">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EFF3FA]">
              <img
                src="/assets/icons/box.svg"
                alt="empty"
                className="size-10 opacity-40"
              />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">
              No categories yet
            </h2>
            <p className="mt-2 text-sm text-[#6A7789]">
              Categories will appear here once they are added.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-[30px]">
            {categories.map((c) => {
              const icon = getCategoryIcon(c.name)
              return (
                <Link
                  key={c.id}
                  href={`/products?category=${c.id}`}
                  className="categories-card"
                >
                  <div className="flex w-full items-center gap-[14px] rounded-[20px] bg-white p-5 ring-1 ring-[#E5E5E5] transition-all duration-300 hover:ring-2 hover:ring-[#FFC736]">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0D5CD7]">
                      <img
                        src={`/assets/icons/${icon}`}
                        alt={c.name}
                        className="size-6"
                      />
                    </div>
                    <div className="flex flex-col gap-[2px]">
                      <p className="font-semibold leading-[22px] text-gray-900">
                        {c.name}
                      </p>
                      <p className="text-sm text-[#616369]">
                        {c._count.products}{" "}
                        {c._count.products === 1 ? "product" : "products"}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
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
