import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

// ── Auth helper ──

async function getLandingUser() {
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

// ── Dummy data ──

const CATEGORIES = [
  { id: "cat-0", name: "Electronics", icon: "mobile.svg", count: 12 },
  { id: "cat-1", name: "Accessories", icon: "watch.svg", count: 8 },
  { id: "cat-2", name: "Gaming", icon: "game.svg", count: 15 },
  { id: "cat-3", name: "Home & Living", icon: "lamp.svg", count: 5 },
  { id: "cat-4", name: "Food & Beverage", icon: "cake.svg", count: 10 },
  { id: "cat-5", name: "Computers", icon: "monitor.svg", count: 7 },
  { id: "cat-6", name: "Audio", icon: "airpods.svg", count: 4 },
  { id: "cat-7", name: "Wearables", icon: "tag.svg", count: 6 },
]

const PRODUCTS = [
  { id: "p-1", name: "iMac 24\" M3 2024", price: "Rp 22.999.000", image_url: "/assets/thumbnails/imac24-digitalmat-gallery-1-202310-Photoroom 1.png", category_name: "Computers" },
  { id: "p-2", name: "iPhone 15 Pro Max", price: "Rp 16.999.000", image_url: "/assets/thumbnails/iphone15pro-digitalmat-gallery-3-202309-Photoroom 1.png", category_name: "Electronics" },
  { id: "p-3", name: "AirPods Max Sky Blue", price: "Rp 8.499.000", image_url: "/assets/thumbnails/airpods-max-select-skyblue-202011-Photoroom 1.png", category_name: "Audio" },
  { id: "p-4", name: "MacBook Pro 16\" M3", price: "Rp 36.999.000", image_url: "/assets/thumbnails/246c3a1bf608fed816e2e038784fa995.png", category_name: "Computers" },
  { id: "p-5", name: "iPad Air 11\" M2", price: "Rp 11.499.000", image_url: "/assets/thumbnails/ea49dfcfcaa4513d799050c989d2f177.png", category_name: "Electronics" },
  { id: "p-6", name: "Apple Watch Ultra 2", price: "Rp 12.999.000", image_url: "/assets/thumbnails/color_back_green__buxxfjccqjzm_large_2x-Photoroom 1.png", category_name: "Wearables" },
  { id: "p-7", name: "Samsung Galaxy S24 Ultra", price: "Rp 18.999.000", image_url: "/assets/thumbnails/iphone15pro-digitalmat-gallery-3-202309-Photoroom 1.png", category_name: "Electronics" },
  { id: "p-8", name: "PlayStation 5 Digital", price: "Rp 7.299.000", image_url: "/assets/thumbnails/ea49dfcfcaa4513d799050c989d2f177.png", category_name: "Gaming" },
  { id: "p-9", name: "Nintendo Switch OLED", price: "Rp 4.999.000", image_url: "/assets/thumbnails/color_back_green__buxxfjccqjzm_large_2x-Photoroom 1.png", category_name: "Gaming" },
  { id: "p-10", name: "Sony WH-1000XM5", price: "Rp 4.799.000", image_url: "/assets/thumbnails/airpods-max-select-skyblue-202011-Photoroom 1.png", category_name: "Audio" },
]

const BRANDS = [
  { id: "b-1", name: "Apple", logo_url: "/assets/logos/apple.svg" },
  { id: "b-2", name: "Samsung", logo_url: "/assets/logos/samsung.svg" },
  { id: "b-3", name: "Microsoft", logo_url: "/assets/logos/microsoft.svg" },
  { id: "b-4", name: "Huawei", logo_url: "/assets/logos/huawei.svg" },
  { id: "b-5", name: "Nokia", logo_url: "/assets/logos/nokia.svg" },
]

const TESTIMONIALS = [
  { img: "/assets/photos/p1.png", quote: "Awesome product!", name: "Jemmie Pemilia" },
  { img: "/assets/photos/p2.png", quote: "Money saver 25%", name: "Angga Risky" },
  { img: "/assets/photos/p3.png", quote: "I love the warranty", name: "Petina Malaka" },
  { img: "/assets/photos/p4.png", quote: "Big deals ever!", name: "Udin Sarifun" },
]

export default async function HomePage() {
  const user = await getLandingUser()

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
              <Link href="/#categories">Categories</Link>
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
                <img src="/assets/icons/cart.svg" alt="cart" className="size-12" />
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

        {/* Hero */}
        <div className="container mx-auto mt-[50px] flex max-w-[1130px] items-center justify-between gap-1">
          <div className="flex flex-col gap-[30px]">
            <div className="flex w-fit items-center gap-[10px] rounded-full bg-white p-[8px_16px]">
              <div className="flex size-[22px] shrink-0">
                <img src="/assets/icons/crown.svg" alt="icon" />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Most Popular 100th Product in Next Commerce
              </p>
            </div>
            <div className="flex flex-col gap-[14px]">
              <h1 className="text-[55px] font-bold leading-[55px] text-gray-900">
                Working Faster 10x
              </h1>
              <p className="text-lg leading-[34px] text-[#6A7789]">
                Dolor si amet lorem super-power features riches than any other
                platform devices AI integrated.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/products"
                className="rounded-full bg-[#0D5CD7] p-[18px_24px] font-semibold text-white transition-all hover:bg-[#0D5CD7]/90"
              >
                Add to Cart
              </Link>
              <Link
                href="/products"
                className="rounded-full bg-white p-[18px_24px] font-semibold text-gray-900 transition-all hover:bg-gray-50"
              >
                View Details
              </Link>
            </div>
          </div>
          <div className="relative flex h-[360px] w-[588px] shrink-0 overflow-hidden">
            <img
              src="/assets/banners/mba13-m2-digitalmat-gallery-1-202402-Photoroom 2.png"
              className="object-contain"
              alt="hero product"
            />
            <div className="absolute top-[60%] flex items-center gap-[10px] rounded-3xl bg-white p-[14px_16px]">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC736]">
                <img src="/assets/icons/code-circle.svg" className="size-6" alt="icon" />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Bonus Mac OS <br /> Capitan Pro
              </p>
            </div>
            <div className="absolute right-0 top-[30%] flex flex-col items-center gap-[10px] rounded-3xl bg-white p-[14px_16px]">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FFC736]">
                <img src="/assets/icons/star-outline.svg" className="size-6" alt="icon" />
              </div>
              <p className="text-center text-sm font-semibold text-gray-900">
                Include <br /> Warranty
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="container mx-auto mt-[50px] flex max-w-[1130px] items-center justify-center gap-10">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="flex items-center gap-[10px]">
              <div className="flex size-[50px] shrink-0 overflow-hidden rounded-full border-[5px] border-white">
                <img src={t.img} className="size-full object-cover" alt={t.name} />
              </div>
              <div className="flex flex-col gap-[2px]">
                <p className="text-sm font-semibold leading-[22px] text-gray-900">{t.quote}</p>
                <p className="text-xs leading-[18px] text-[#6A7789]">{t.name}</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <section className="container mx-auto flex max-w-[1130px] flex-col gap-[50px] pb-[100px] pt-[50px]">
        {/* Categories */}
        <div id="categories" className="flex flex-col gap-[30px]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold leading-[34px] text-gray-900">
              Browse Products <br /> by Categories
            </h2>
            <Link
              href="/products"
              className="rounded-full border border-[#E5E5E5] px-6 py-3 font-semibold text-gray-700 transition-all hover:border-[#0D5CD7] hover:text-[#0D5CD7]"
            >
              Explore All
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-[30px]">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className="categories-card"
              >
                <div className="flex w-full items-center gap-[14px] rounded-[20px] bg-white p-5 ring-1 ring-[#E5E5E5] transition-all duration-300 hover:ring-2 hover:ring-[#FFC736]">
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0D5CD7]">
                    <img src={`/assets/icons/${c.icon}`} alt={c.name} className="size-6" />
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <p className="font-semibold leading-[22px] text-gray-900">{c.name}</p>
                    <p className="text-sm text-[#616369]">{c.count} products</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Most Picked Products */}
        <div className="flex flex-col gap-[30px]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold leading-[34px] text-gray-900">
              Most Picked <br /> Quality Products
            </h2>
            <Link
              href="/products"
              className="rounded-full border border-[#E5E5E5] px-6 py-3 font-semibold text-gray-700 transition-all hover:border-[#0D5CD7] hover:text-[#0D5CD7]"
            >
              Explore All
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-[30px]">
            {PRODUCTS.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} className="product-card">
                <div className="flex w-full flex-col gap-[24px] rounded-[20px] bg-white p-5 ring-1 ring-[#E5E5E5] transition-all duration-300 hover:ring-2 hover:ring-[#FFC736]">
                  <div className="flex h-[90px] w-full shrink-0 items-center justify-center overflow-hidden">
                    <img className="h-full object-contain" src={p.image_url} alt={p.name} />
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold leading-[22px] text-gray-900">{p.name}</p>
                      <p className="text-sm text-[#616369]">{p.category_name}</p>
                    </div>
                    <p className="font-semibold leading-[22px] text-[#0D5CD7]">{p.price}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div id="brands" className="flex flex-col gap-[30px]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold leading-[34px] text-gray-900">
              Explore Our <br /> Popular Brands
            </h2>
            <Link
              href="/brands"
              className="rounded-full border border-[#E5E5E5] px-6 py-3 font-semibold text-gray-700 transition-all hover:border-[#0D5CD7] hover:text-[#0D5CD7]"
            >
              Explore All
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-[30px]">
            {BRANDS.map((b) => (
              <Link key={b.id} href={`/products?brand=${b.id}`} className="logo-card">
                <div className="flex w-full items-center justify-center rounded-[20px] bg-white p-[30px_20px] ring-1 ring-[#E5E5E5] transition-all duration-300 hover:ring-2 hover:ring-[#FFC736]">
                  <div className="flex h-[30px] w-full shrink-0 items-center justify-center overflow-hidden">
                    <img src={b.logo_url} className="h-full w-full object-contain" alt={b.name} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* New Releases */}
        <div className="flex flex-col gap-[30px]">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold leading-[34px] text-gray-900">
              New Releases <br /> From Official Stores
            </h2>
            <Link
              href="/products"
              className="rounded-full border border-[#E5E5E5] px-6 py-3 font-semibold text-gray-700 transition-all hover:border-[#0D5CD7] hover:text-[#0D5CD7]"
            >
              Explore All
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-[30px]">
            {PRODUCTS.map((p) => (
              <Link key={`new-${p.id}`} href={`/products/${p.id}`} className="product-card">
                <div className="flex w-full flex-col gap-[24px] rounded-[20px] bg-white p-5 ring-1 ring-[#E5E5E5] transition-all duration-300 hover:ring-2 hover:ring-[#FFC736]">
                  <div className="flex h-[90px] w-full shrink-0 items-center justify-center overflow-hidden">
                    <img className="h-full object-contain" src={p.image_url} alt={p.name} />
                  </div>
                  <div className="flex flex-col gap-[10px]">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold leading-[22px] text-gray-900">{p.name}</p>
                      <p className="text-sm text-[#616369]">{p.category_name}</p>
                    </div>
                    <p className="font-semibold leading-[22px] text-[#0D5CD7]">{p.price}</p>
                  </div>
                </div>
              </Link>
            ))}
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
