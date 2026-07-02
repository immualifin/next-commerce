import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import ListCategory from "@/components/landing/list-category"
import ListProducts from "@/components/landing/list-products"
import ListBrands from "@/components/landing/list-brands"

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

// ── Static data ──

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
        <LandingNavbar user={user} />

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
        <div id="categories"><ListCategory /></div>
        <div id="products">
          <ListProducts
            title={
              <>
                Most Picked <br /> Quality Products
              </>
            }
          />
        </div>
        <div id="brands"><ListBrands /></div>
        <ListProducts
          title={
            <>
              New Releases <br /> From Official Stores
            </>
          }
        />
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E5E5E5] bg-white px-6 py-8 text-center text-sm text-[#6A7789]">
        &copy; {new Date().getFullYear()} Next Commerce. All rights reserved.
      </footer>
    </div>
  )
}
