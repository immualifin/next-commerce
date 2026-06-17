"use server"

import { revalidatePath } from "next/cache"
import { categorySchema } from "@/lib/validations"
import prisma from "@/lib/prisma"

export type CategoryState = {
  errors: Record<string, string[]> | null
  message: string | null
}

export async function createCategoryAction(
  prevState: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  const parsed = categorySchema.safeParse({ name: formData.get("name") })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: null }
  }

  try {
    await prisma.category.create({ data: { name: parsed.data.name } })
  } catch {
    return { errors: null, message: "Failed to create category." }
  }

  revalidatePath("/dashboard/categories")
  return { errors: null, message: "Category created successfully." }
}

export async function updateCategoryAction(
  id: string,
  prevState: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  const parsed = categorySchema.safeParse({ name: formData.get("name") })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: null }
  }

  try {
    await prisma.category.update({ where: { id }, data: { name: parsed.data.name } })
  } catch {
    return { errors: null, message: "Failed to update category." }
  }

  revalidatePath("/dashboard/categories")
  return { errors: null, message: "Category updated successfully." }
}

export async function deleteCategoryAction(id: string) {
  try {
    await prisma.category.delete({ where: { id } })
  } catch {
    return { message: "Failed to delete category." }
  }
  revalidatePath("/dashboard/categories")
  return { message: "Category deleted successfully." }
}
