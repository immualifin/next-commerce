import { PackageIcon } from "lucide-react"
import prisma from "@/lib/prisma"
import { ProductList } from "@/components/product-list"

export default async function ProductsPage() {
  const [products, brands, categories, locations] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { brand: true, category: true, location: true },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ])

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <PackageIcon className="size-5" />
            <h1 className="text-xl font-semibold">Products</h1>
          </div>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Manage your product catalog.</p>
          <ProductList
            products={JSON.parse(JSON.stringify(products))}
            brands={JSON.parse(JSON.stringify(brands))}
            categories={JSON.parse(JSON.stringify(categories))}
            locations={JSON.parse(JSON.stringify(locations))}
          />
        </div>
      </div>
    </div>
  )
}
