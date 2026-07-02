"use client"

import CardProduct from "@/components/landing/card-product"

interface ProductGridItem {
  id: string
  name: string
  price: number
  image_url: string
  category_name: string
}

interface ProductGridProps {
  products: ProductGridItem[]
  hasFilters: boolean
}

export default function ProductGrid({
  products,
  hasFilters,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EFF3FA]">
          <img
            src="/assets/icons/box.svg"
            alt="empty"
            className="size-8 opacity-40"
          />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">
          No products found
        </h2>
        <p className="mt-1 text-sm text-[#6A7789]">
          {hasFilters
            ? "Try adjusting or clearing the filters."
            : "Products will appear here once they are added."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-[30px]">
      {products.map((product) => (
        <CardProduct key={product.id} item={product} />
      ))}
    </div>
  )
}
