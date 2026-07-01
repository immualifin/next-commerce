import Link from "next/link"
import { getBrands } from "@/app/_data/landing"

export default async function ListBrands() {
  const brands = await getBrands()

  return (
    <div id="brands" className="flex flex-col gap-[30px]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold leading-[34px] text-gray-900">
          Explore Our <br /> Popular Brands
        </h2>
        <a
          href="/brands"
          className="rounded-full border border-[#E5E5E5] px-6 py-3 font-semibold text-gray-700 transition-all hover:border-[#0D5CD7] hover:text-[#0D5CD7]"
        >
          Explore All
        </a>
      </div>
      <div className="grid grid-cols-5 gap-[30px]">
        {brands.map((item) => (
          <Link
            key={`${item.id}-${item.name}`}
            href={`/products?brand=${item.id}`}
            className="logo-card"
          >
            <div className="flex w-full items-center justify-center rounded-[20px] bg-white p-[30px_20px] ring-1 ring-[#E5E5E5] transition-all duration-300 hover:ring-2 hover:ring-[#FFC736]">
              <div className="flex h-[30px] w-full shrink-0 items-center justify-center overflow-hidden">
                <img
                  src={item.logo_url}
                  className="h-full w-full object-contain"
                  alt={item.name}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
