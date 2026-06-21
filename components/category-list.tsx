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
import { CategoryForm } from "@/components/category-form"
import { deleteCategoryAction, restoreCategoryAction, permanentDeleteCategoryAction } from "@/app/(admin)/dashboard/categories/actions"

type Category = { id: string; name: string; deletedAt?: Date | null }

export function CategoryList({
  categories,
  tab = "active",
}: {
  categories: Category[]
  tab?: "active" | "trash"
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

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
              New Category
            </Button>
          )}
        </div>
      </Tabs>

      {categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {tab === "trash" ? "Trash is empty." : "No categories yet."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {tab === "trash" && <TableHead>Deleted</TableHead>}
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                {tab === "trash" && (
                  <TableCell className="text-sm text-muted-foreground">
                    {c.deletedAt ? new Date(c.deletedAt).toLocaleDateString() : "—"}
                  </TableCell>
                )}
                <TableCell>
                  {tab === "active" ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditing(c); setFormOpen(true) }}>
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await deleteCategoryAction(c.id); toast.success(r?.message ?? "Deleted."); router.refresh() })}>
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="size-8" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await restoreCategoryAction(c.id); toast.success(r?.message ?? "Restored."); router.refresh() })}>
                        <RotateCcwIcon className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" disabled={isPending}
                        onClick={() => startTransition(async () => { const r = await permanentDeleteCategoryAction(c.id); toast.success(r?.message ?? "Deleted."); router.refresh() })}>
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
        <CategoryForm open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null) }} category={editing} />
      )}
    </>
  )
}
