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
import { CategoryForm } from "@/components/category-form"
import { deleteCategoryAction } from "@/app/(admin)/dashboard/categories/actions"

type Category = { id: string; name: string }

export function CategoryList({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)

  return (
    <>
      <div className="flex items-center justify-between">
        <div />
        <Button onClick={() => { setEditing(null); setFormOpen(true) }} size="sm">
          <PlusIcon className="mr-1 size-4" />
          New Category
        </Button>
      </div>
      {categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No categories yet.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditing(c); setFormOpen(true) }}>
                      <PencilIcon className="size-4" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="size-8 text-destructive"
                      disabled={isPending}
                      onClick={() => startTransition(async () => {
                        const r = await deleteCategoryAction(c.id)
                        toast.success(r?.message ?? "Deleted.")
                        router.refresh()
                      })}
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
      <CategoryForm open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null) }} category={editing} />
    </>
  )
}
