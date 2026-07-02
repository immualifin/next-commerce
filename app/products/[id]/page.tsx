import Link from "next/link"
import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { Suspense } from "react"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import ListProducts from "@/components/landing/list-products"
import CarouselImages from "./_components/carousel-images"
import PriceInfo from "./_components/price-info"
import TestimonialForm from "./_components/testimonial-form"

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
      testimonials: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { orders: true } },
    },
  })

  if (!product) {
    notFound()
  }

  const orderCount = product._count.orders

  const cardProduct = {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    image_url: product.image[0] ?? "",
    category_name: product.category.name,
  }

  return (
    <div className="min-h-svh bg-white">
      {/* ── Header ── */}
      <header className="h-[480px] -mb-[310px] bg-[#EFF3FA] pt-[30px]">
        <LandingNavbar user={user} />
      </header>

      {/* ── Title section: breadcrumb + name + rating ── */}
      <div
        id="title"
        className="container mx-auto flex max-w-[1130px] items-center justify-between"
      >
        <div className="flex flex-col gap-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-5">
            <Link
              href="/catalogs"
              className="text-sm text-[#6A7789] transition-colors hover:text-black"
            >
              Shop
            </Link>
            <span className="text-sm text-[#6A7789]">/</span>
            <Link
              href="/catalogs"
              className="text-sm text-[#6A7789] transition-colors hover:text-black"
            >
              Browse
            </Link>
            <span className="text-sm text-[#6A7789]">/</span>
            <span className="text-sm text-black">Details</span>
          </div>

          {/* Product name */}
          <h1 className="text-4xl font-bold leading-9 text-gray-900">
            {product.name}
          </h1>
        </div>

        {/* Star rating + order count */}
        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex shrink-0">
                <img
                  src={
                    i < 4
                      ? "/assets/icons/Star.svg"
                      : "/assets/icons/Star-gray.svg"
                  }
                  alt="star"
                />
              </div>
            ))}
          </div>
          <p className="font-semibold text-gray-900">({orderCount})</p>
        </div>
      </div>

      {/* ── Image Carousel ── */}
      <CarouselImages images={product.image} productName={product.name} />

      {/* ── Benefits bar ── */}
      <div
        id="details-benefits"
        className="container mx-auto mt-[50px] flex max-w-[1130px] items-center justify-center gap-[50px]"
      >
        <div className="flex items-center gap-[10px]">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC736]">
            <img src="/assets/icons/star-outline.svg" alt="icon" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Include Official <br /> Warranty
          </p>
        </div>
        <div className="h-12 border-[0.5px] border-[#E5E5E5]" />
        <div className="flex items-center gap-[10px]">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC736]">
            <img src="/assets/icons/code-circle.svg" alt="icon" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Bonus Mac OS <br /> Capitan Pro
          </p>
        </div>
        <div className="h-12 border-[0.5px] border-[#E5E5E5]" />
        <div className="flex items-center gap-[10px]">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC736]">
            <img src="/assets/icons/like.svg" alt="icon" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            100% Original <br /> From Factory
          </p>
        </div>
        <div className="h-12 border-[0.5px] border-[#E5E5E5]" />
        <div className="flex items-center gap-[10px]">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC736]">
            <img src="/assets/icons/tag.svg" alt="icon" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Free Tax On <br /> Every Sale
          </p>
        </div>
      </div>

      {/* ── Details section: about + testimonials | price sidebar ── */}
      <div
        id="details-info"
        className="container mx-auto mt-[50px] flex max-w-[1030px] justify-between gap-5"
      >
        {/* Left column: about + testimonials */}
        <div className="flex w-full max-w-[650px] flex-col gap-[30px]">
          {/* About */}
          <div id="about" className="flex flex-col gap-[10px]">
            <h3 className="font-semibold text-gray-900">About Product</h3>
            <p className="leading-[32px] text-gray-700">
              {product.description}
            </p>
          </div>

          {/* Testimonials */}
          <div id="testi" className="flex flex-col gap-[10px]">
            <h3 className="font-semibold text-gray-900">
              Real Testimonials
            </h3>
            {product.testimonials.length > 0 ? (
              <div className="grid grid-cols-2 gap-5">
                {product.testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="testi-card flex h-fit flex-col gap-5 rounded-[20px] border border-[#E5E5E5] bg-white p-5"
                  >
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex shrink-0">
                          <img
                            src={
                              i < t.stars
                                ? "/assets/icons/Star.svg"
                                : "/assets/icons/Star-gray.svg"
                            }
                            alt="star"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="line-clamp-2 leading-[28px] text-gray-700 hover:line-clamp-none">
                      {t.text}
                    </p>
                    <div className="flex items-center gap-[10px]">
                      <div className="flex size-[50px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E5E5E5] p-1">
                        <img
                          src={t.user.image ?? "/assets/photos/p1.png"}
                          className="h-full w-full rounded-full object-cover"
                          alt={t.user.name ?? "User"}
                        />
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <p className="text-sm font-semibold leading-[22px] text-gray-900">
                          {t.user.name ?? "Anonymous"}
                        </p>
                        <p className="text-xs leading-[18px] text-[#6A7789]">
                          {t.createdAt.toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#E5E5E5] bg-[#F9FAFB] p-10 text-center">
                <p className="text-sm font-medium text-[#6A7789]">
                  No testimonials yet. Be the first to share your experience!
                </p>
              </div>
            )}

            {/* Testimonial Input Form */}
            <TestimonialForm productId={product.id} isLogin={!!user} />
          </div>

          {/* Brand & Location info */}
          <div className="flex flex-wrap gap-6">
            {product.brand.logo && (
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-[#EFF3FA] p-2">
                  <img
                    src={product.brand.logo}
                    alt={product.brand.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6A7789]">
                    Brand
                  </p>
                  <Link
                    href={`/catalogs?brand=${product.brand.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-[#0D5CD7]"
                  >
                    {product.brand.name}
                  </Link>
                </div>
              </div>
            )}
            <div className="flex flex-col">
              <p className="text-xs font-medium uppercase tracking-wide text-[#6A7789]">
                Category
              </p>
              <Link
                href={`/catalogs?category=${product.category.id}`}
                className="text-sm font-semibold text-gray-900 hover:text-[#0D5CD7]"
              >
                {product.category.name}
              </Link>
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-medium uppercase tracking-wide text-[#6A7789]">
                Location
              </p>
              <span className="text-sm font-semibold text-gray-900">
                {product.location.name}
              </span>
            </div>
          </div>
        </div>

        {/* Right: PriceInfo widget */}
        <PriceInfo isLogin={!!user} item={cardProduct} />
      </div>

      {/* ── Recommendations ── */}
      <div
        id="recommendations"
        className="container mx-auto mt-[70px] flex max-w-[1130px] flex-col gap-[30px] pb-[100px]"
      >
        <Suspense fallback={<span className="text-[#6A7789]">Loading...</span>}>
          <ListProducts
            title={
              <>
                Other Products <br /> You Might Need
              </>
            }
            isShowDetail={false}
          />
        </Suspense>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E5E5E5] bg-white px-6 py-8 text-center text-sm text-[#6A7789]">
        &copy; {new Date().getFullYear()} Next Commerce. All rights reserved.
      </footer>
    </div>
  )
}
