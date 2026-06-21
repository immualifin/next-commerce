"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PencilIcon, Trash2Icon, PlusIcon, RotateCcwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BrandForm } from "@/components/brand-form"
import { deleteBrandAction, restoreBrandAction, permanentDeleteBrandAction } from "@/app/(admin)/dashboard/brands/actions"

type Brand = {
  id: string
  name: string
  logo: string
  deletedAt?: Date | null
}

export function BrandList({
  brands,
  tab = "active",
}: {
  brands: Brand[]
  tab?: "active" | "trash"
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

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
            <Button onClick={() => { setEditingBrand(null); setFormOpen(true) }} size="sm">
              <PlusIcon className="mr-1 size-4" />
              New Brand
            </Button>
          )}
        </div>
      </Tabs>

      {brands.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tab === "trash" ? "Trash is empty." : "No brands yet. Create your first brand."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              {tab === "trash" && <TableHead>Deleted</TableHead>}
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="size-8 rounded object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{brand.name}</TableCell>
                {tab === "trash" && (
                  <TableCell className="text-sm text-muted-foreground">
                    {brand.deletedAt ? new Date(brand.deletedAt).toLocaleDateString() : "—"}
                  </TableCell>
                )}
                <TableCell>
                  {tab === "active" ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditingBrand(brand); setFormOpen(true) }}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await deleteBrandAction(brand.id); toast.success(r?.message ?? "Deleted."); router.refresh() })}>
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-8" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await restoreBrandAction(brand.id); toast.success(r?.message ?? "Restored."); router.refresh() })}>
                        <RotateCcwIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await permanentDeleteBrandAction(brand.id); toast.success(r?.message ?? "Deleted."); router.refresh() })}>
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
        <BrandForm open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingBrand(null) }} brand={editingBrand} />
      )}
    </>
  )
}
