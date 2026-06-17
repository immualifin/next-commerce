import { LayoutGridIcon } from "lucide-react"
import prisma from "@/lib/prisma"
import { CategoryList } from "@/components/category-list"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <LayoutGridIcon className="size-5" />
            <h1 className="text-xl font-semibold">Categories</h1>
          </div>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">Manage product categories.</p>
          <CategoryList categories={JSON.parse(JSON.stringify(categories))} />
        </div>
      </div>
    </div>
  )
}
