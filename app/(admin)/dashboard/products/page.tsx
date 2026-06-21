import { PackageIcon } from "lucide-react"
import prisma from "@/lib/prisma"
import { serialize } from "@/lib/utils"
import { ProductList } from "@/components/product-list"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  const isTrash = tab === "trash"

  const [products, brands, categories, locations] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: isTrash ? { not: null } : null },
      orderBy: { createdAt: "desc" },
      include: { brand: true, category: true, location: true },
    }),
    prisma.brand.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.location.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
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
            products={serialize(products)}
            brands={serialize(brands)}
            categories={serialize(categories)}
            locations={serialize(locations)}
            tab={isTrash ? "trash" : "active"}
          />
        </div>
      </div>
    </div>
  )
}
