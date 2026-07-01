import Link from "next/link"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { ArrowLeftIcon } from "lucide-react"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { rupiahFormat } from "@/lib/rupiah-format"

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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  const { id } = await params

  const product = await prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: true,
      brand: true,
      location: true,
    },
  })

  if (!product) {
    notFound()
  }

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
            <li className="font-bold text-[#FFC736]">
              <Link href="/products">Shop</Link>
            </li>
            <li className="text-white transition-all duration-300 hover:font-bold hover:text-[#FFC736]">
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
      </header>

      {/* ── Content ── */}
      <section className="container mx-auto max-w-[1130px] pb-[100px] pt-[50px]">
        {/* Back link */}
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#6A7789] transition-colors hover:text-[#0D5CD7]"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Products
        </Link>

        <div className="flex gap-[50px]">
          {/* Product Image */}
          <div className="flex h-[400px] w-[500px] shrink-0 items-center justify-center overflow-hidden rounded-[30px] bg-[#EFF3FA] p-10">
            {product.image[0] ? (
              <img
                src={product.image[0]}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <img
                src="/assets/icons/box.svg"
                alt="no image"
                className="size-20 opacity-30"
              />
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-1 flex-col gap-6">
            {/* Stock badge */}
            <div>
              <span
                className={`inline-block rounded-full px-4 py-1.5 text-xs font-semibold ${
                  product.stock === "ready"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {product.stock === "ready" ? "In Stock" : "Pre-Order"}
              </span>
            </div>

            {/* Name & Price */}
            <div className="flex flex-col gap-3">
              <h1 className="text-[32px] font-bold leading-[38px] text-gray-900">
                {product.name}
              </h1>
              <p className="text-[28px] font-bold leading-[34px] text-[#0D5CD7]">
                {rupiahFormat(Number(product.price))}
              </p>
            </div>

            {/* Description */}
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#6A7789]">
                Description
              </h2>
              <p className="text-base leading-relaxed text-gray-700">
                {product.description}
              </p>
            </div>

            {/* Meta: Brand, Category, Location */}
            <div className="flex flex-wrap gap-6">
              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#EFF3FA] p-2">
                  <img
                    src={product.brand.logo}
                    alt={product.brand.name}
                    className="size-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6A7789]">
                    Brand
                  </p>
                  <Link
                    href={`/products?brand=${product.brand.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-[#0D5CD7]"
                  >
                    {product.brand.name}
                  </Link>
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <p className="text-xs font-medium uppercase tracking-wide text-[#6A7789]">
                  Category
                </p>
                <Link
                  href={`/products?category=${product.category.id}`}
                  className="text-sm font-semibold text-gray-900 hover:text-[#0D5CD7]"
                >
                  {product.category.name}
                </Link>
              </div>

              {/* Location */}
              <div className="flex flex-col">
                <p className="text-xs font-medium uppercase tracking-wide text-[#6A7789]">
                  Location
                </p>
                <span className="text-sm font-semibold text-gray-900">
                  {product.location.name}
                </span>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              disabled
              className="mt-4 w-fit rounded-full bg-[#0D5CD7] px-10 py-4 font-semibold text-white opacity-50 transition-all hover:bg-[#0D5CD7]/90 enabled:hover:bg-[#0D5CD7]/90"
              title="Cart coming soon"
            >
              Add to Cart — Coming Soon
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E5E5E5] bg-white px-6 py-8 text-center text-sm text-[#6A7789]">
        &copy; {new Date().getFullYear()} Next Commerce. All rights reserved.
      </footer>
    </div>
  )
}
