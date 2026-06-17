"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BrandForm } from "@/components/brand-form"
import { deleteBrandAction } from "@/app/(admin)/dashboard/brands/actions"

type Brand = {
  id: string
  name: string
  logo: string
}

export function BrandList({ brands: initialBrands }: { brands: Brand[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormOpen(true)
  }

  const handleNew = () => {
    setEditingBrand(null)
    setFormOpen(true)
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteBrandAction(id)
      if (result?.message) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error("Failed to delete brand.")
      }
    })
  }

  const handleFormClose = (open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingBrand(null)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={handleNew} size="sm">
          <PlusIcon className="mr-1 size-4" />
          New Brand
        </Button>
      </div>
      {initialBrands.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No brands yet. Create your first brand.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialBrands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="size-8 rounded object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleEdit(brand)}
                    >
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive"
                      onClick={() => handleDelete(brand.id)}
                      disabled={isPending}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <BrandForm
        open={formOpen}
        onOpenChange={handleFormClose}
        brand={editingBrand}
      />
    </>
  )
}
