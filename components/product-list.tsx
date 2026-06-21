"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon, PlusIcon, RotateCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductForm } from "@/components/product-form"
import { deleteProductAction, restoreProductAction, permanentDeleteProductAction } from "@/app/(admin)/dashboard/products/actions"

type SelectOption = { id: string; name: string }

type Product = {
  id: string
  name: string
  description: string
  price: bigint
  stock: string
  image: string[]
  brandId: string
  categoryId: string
  locationId: string
  deletedAt?: Date | null
  brand: { name: string }
  category: { name: string }
  location: { name: string }
}

export function ProductList({
  products,
  brands,
  categories,
  locations,
  tab = "active",
}: {
  products: Product[]
  brands: SelectOption[]
  categories: SelectOption[]
  locations: SelectOption[]
  tab?: "active" | "trash"
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)

  const formatPrice = (price: bigint) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(price))

  return (
    <>
      <Tabs
        value={tab}
        onValueChange={(v) => router.push(v === "trash" ? "?tab=trash" : "?")}
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="trash">Trash</TabsTrigger>
          </TabsList>
          {tab === "active" && (
            <Button onClick={() => { setEditing(null); setFormOpen(true) }} size="sm">
              <PlusIcon className="mr-1 size-4" />
              New Product
            </Button>
          )}
        </div>
      </Tabs>

      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tab === "trash" ? "Trash is empty." : "No products yet."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              {tab === "trash" && <TableHead>Deleted</TableHead>}
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{formatPrice(p.price)}</TableCell>
                <TableCell>
                  <Badge variant={p.stock === "ready" ? "default" : "secondary"}>
                    {p.stock === "ready" ? "Ready" : "Pre-Order"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.brand?.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.category?.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{p.location?.name}</TableCell>
                {tab === "trash" && (
                  <TableCell className="text-sm text-muted-foreground">
                    {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : "—"}
                  </TableCell>
                )}
                <TableCell>
                  {tab === "active" ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditing(p); setFormOpen(true) }}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await deleteProductAction(p.id); toast.success(r?.message ?? "Deleted."); router.refresh() })}>
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-8" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await restoreProductAction(p.id); toast.success(r?.message ?? "Restored."); router.refresh() })}>
                        <RotateCcwIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await permanentDeleteProductAction(p.id); toast.success(r?.message ?? "Deleted."); router.refresh() })}>
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {tab === "active" && (
        <ProductForm
          open={formOpen}
          onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null) }}
          product={editing}
          brands={brands}
          categories={categories}
          locations={locations}
        />
      )}
    </>
  )
}
