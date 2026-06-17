"use server"

import { revalidatePath } from "next/cache"
import { brandSchema } from "@/lib/validations"
import prisma from "@/lib/prisma"

export type BrandState = {
  errors: Record<string, string[]> | null
  message: string | null
}

export async function createBrandAction(
  prevState: BrandState,
  formData: FormData
): Promise<BrandState> {
  const parsed = brandSchema.safeParse({
    name: formData.get("name"),
    logo: formData.get("logo"),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: null,
    }
  }

  const { name, logo } = parsed.data

  try {
    await prisma.brand.create({ data: { name, logo } })
  } catch {
    return { errors: null, message: "Failed to create brand." }
  }

  revalidatePath("/dashboard/brands")
  return { errors: null, message: "Brand created successfully." }
}

export async function updateBrandAction(
  id: string,
  prevState: BrandState,
  formData: FormData
): Promise<BrandState> {
  const parsed = brandSchema.safeParse({
    name: formData.get("name"),
    logo: formData.get("logo"),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: null,
    }
  }

  const { name, logo } = parsed.data

  try {
    await prisma.brand.update({ where: { id }, data: { name, logo } })
  } catch {
    return { errors: null, message: "Failed to update brand." }
  }

  revalidatePath("/dashboard/brands")
  return { errors: null, message: "Brand updated successfully." }
}

export async function deleteBrandAction(id: string) {
  try {
    await prisma.brand.delete({ where: { id } })
  } catch {
    return { message: "Failed to delete brand." }
  }
  revalidatePath("/dashboard/brands")
  return { message: "Brand deleted successfully." }
}
