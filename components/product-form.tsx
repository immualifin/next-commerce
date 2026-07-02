"use client"

import {
  useActionState,
  useEffect,
  useState,
  useRef,
  startTransition,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { XIcon, ImagePlusIcon } from "lucide-react"
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
import {
  createProductAction,
  updateProductAction,
} from "@/app/(admin)/dashboard/products/actions"

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

  const [state, formAction, isPending] = useActionState(action, {
    errors: null,
    message: null,
  })
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  // ── Image state ──

  const [keptImages, setKeptImages] = useState<string[]>(product?.image ?? [])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.message && !state.errors) {
      toast.success(state.message)
      onOpenChange(false)
      router.refresh()
    }
    if (state.message && state.errors) {
      toast.error(state.message)
    }
  }, [state, onOpenChange, router])

  // ── Handlers ──

  function handleFilesSelected(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return

    const incoming = Array.from(files)
    setPendingFiles((prev) => [...prev, ...incoming])

    for (const file of incoming) {
      setNewPreviews((prev) => [...prev, URL.createObjectURL(file)])
    }

    // Reset input so the same file(s) can be re-selected
    e.target.value = ""
  }

  function removeNewPreview(index: number) {
    setNewPreviews((prev) => prev.filter((_, i) => i !== index))
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function removeKeptImage(index: number) {
    setKeptImages((prev) => prev.filter((_, i) => i !== index))
  }

  /**
   * Intercept the form submission so we can inject the accumulated
   * File objects that were cleared from the <input> on every selection.
   */
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const fd = new FormData(e.currentTarget)

    // Remove any stale "images" entries from the hidden file input
    fd.delete("images")

    // Append accumulated files
    for (const file of pendingFiles) {
      fd.append("images", file)
    }

    // Append kept existing URLs
    for (const url of keptImages) {
      fd.append("existing", url)
    }

    // Dispatch via the useActionState action (must be wrapped in startTransition)
    startTransition(() => formAction(fd))
  }

  const hasImages = keptImages.length > 0 || newPreviews.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Product" : "New Product"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update product details."
              : "Add a new product to the catalog."}
          </SheetDescription>
        </SheetHeader>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4"
        >
          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name ?? ""}
              required
              placeholder="Product name"
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>

          {/* Description */}
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
            {state.errors?.description && (
              <p className="text-sm text-destructive">
                {state.errors.description[0]}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              defaultValue={product?.price?.toString() ?? ""}
              required
              placeholder="100000"
              type="number"
            />
            {state.errors?.price && (
              <p className="text-sm text-destructive">{state.errors.price[0]}</p>
            )}
          </div>

          {/* Stock */}
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
            {state.errors?.stock && (
              <p className="text-sm text-destructive">{state.errors.stock[0]}</p>
            )}
          </div>

          {/* ── Images (file upload) ── */}
          <div className="flex flex-col gap-2">
            <Label>Images</Label>

            {/* Existing images (kept from DB) */}
            {keptImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {keptImages.map((url, i) => (
                  <div
                    key={url}
                    className="group relative overflow-hidden rounded-lg border"
                  >
                    <img
                      src={url}
                      alt={`img-${i}`}
                      className="h-20 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeKeptImage(i)}
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* New file previews */}
            {newPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {newPreviews.map((preview, i) => (
                  <div
                    key={preview}
                    className="group relative overflow-hidden rounded-lg border"
                  >
                    <img
                      src={preview}
                      alt={`new-${i}`}
                      className="h-20 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewPreview(i)}
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 py-4 text-sm text-muted-foreground transition-colors hover:border-[#0D5CD7] hover:text-[#0D5CD7]"
            >
              <ImagePlusIcon className="size-5" />
              {hasImages ? "Add more images" : "Upload product images"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFilesSelected}
              className="hidden"
            />

            {state.errors?.image && (
              <p className="text-sm text-destructive">{state.errors.image[0]}</p>
            )}
          </div>

          {/* Brand */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="brandId">Brand</Label>
            <Select name="brandId" defaultValue={product?.brandId ?? ""}>
              <SelectTrigger id="brandId">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {state.errors?.brandId && (
              <p className="text-sm text-destructive">
                {state.errors.brandId[0]}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select name="categoryId" defaultValue={product?.categoryId ?? ""}>
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {state.errors?.categoryId && (
              <p className="text-sm text-destructive">
                {state.errors.categoryId[0]}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="locationId">Location</Label>
            <Select name="locationId" defaultValue={product?.locationId ?? ""}>
              <SelectTrigger id="locationId">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {state.errors?.locationId && (
              <p className="text-sm text-destructive">
                {state.errors.locationId[0]}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
