"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { createProductAction, updateProductAction } from "@/app/(admin)/dashboard/products/actions"

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
}

export function ProductForm({
  open,
  onOpenChange,
  product,
  brands,
  categories,
  locations,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  brands: SelectOption[]
  categories: SelectOption[]
  locations: SelectOption[]
}) {
  const isEditing = !!product
  const action = isEditing
    ? updateProductAction.bind(null, product!.id)
    : createProductAction

  const [state, formAction, isPending] = useActionState(action, { errors: null, message: null })
  const router = useRouter()

  useEffect(() => {
    if (state.message && !state.errors) { toast.success(state.message); onOpenChange(false); router.refresh() }
    if (state.message && state.errors) { toast.error(state.message) }
  }, [state, onOpenChange, router])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Product" : "New Product"}</SheetTitle>
          <SheetDescription>
            {isEditing ? "Update product details." : "Add a new product to the catalog."}
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={product?.name ?? ""} required placeholder="Product name" />
            {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={product?.description ?? ""}
              required
              rows={3}
              placeholder="Product description..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" defaultValue={product?.price?.toString() ?? ""} required placeholder="100000" type="number" />
            {state.errors?.price && <p className="text-sm text-destructive">{state.errors.price[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="stock">Stock Status</Label>
            <Select name="stock" defaultValue={product?.stock ?? "ready"}>
              <SelectTrigger id="stock">
                <SelectValue placeholder="Select stock status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ready">Ready Stock</SelectItem>
                  <SelectItem value="preorder">Pre-Order</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {state.errors?.stock && <p className="text-sm text-destructive">{state.errors.stock[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="image">Image URLs (comma-separated)</Label>
            <Input id="image" name="image" defaultValue={product?.image?.join(", ") ?? ""} required placeholder="https://img1.jpg, https://img2.jpg" />
            {state.errors?.image && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="brandId">Brand</Label>
            <Select name="brandId" defaultValue={product?.brandId ?? ""}>
              <SelectTrigger id="brandId">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {state.errors?.brandId && <p className="text-sm text-destructive">{state.errors.brandId[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select name="categoryId" defaultValue={product?.categoryId ?? ""}>
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {state.errors?.categoryId && <p className="text-sm text-destructive">{state.errors.categoryId[0]}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="locationId">Location</Label>
            <Select name="locationId" defaultValue={product?.locationId ?? ""}>
              <SelectTrigger id="locationId">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {state.errors?.locationId && <p className="text-sm text-destructive">{state.errors.locationId[0]}</p>}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
