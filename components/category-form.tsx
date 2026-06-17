"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { CategoryState } from "@/app/(admin)/dashboard/categories/actions"
import { createCategoryAction, updateCategoryAction } from "@/app/(admin)/dashboard/categories/actions"

type Category = { id: string; name: string }

export function CategoryForm({
  open,
  onOpenChange,
  category,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
}) {
  const isEditing = !!category
  const action = isEditing
    ? updateCategoryAction.bind(null, category!.id)
    : createCategoryAction

  const [state, formAction, isPending] = useActionState(action, {
    errors: null,
    message: null,
  })

  const router = useRouter()

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Category" : "New Category"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the category name."
              : "Create a new product category."}
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={category?.name ?? ""}
              required
              placeholder="Electronics"
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
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
