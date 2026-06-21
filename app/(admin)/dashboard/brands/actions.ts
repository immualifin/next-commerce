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
    await prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  } catch {
    return { message: "Failed to delete brand." }
  }
  revalidatePath("/dashboard/brands")
  return { message: "Brand moved to trash." }
}

export async function restoreBrandAction(id: string) {
  try {
    await prisma.brand.update({
      where: { id },
      data: { deletedAt: null },
    })
  } catch {
    return { message: "Failed to restore brand." }
  }
  revalidatePath("/dashboard/brands")
  return { message: "Brand restored successfully." }
}

export async function permanentDeleteBrandAction(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // Cascade: delete products under this brand first
      const products = await tx.product.findMany({ where: { brandId: id }, select: { id: true } })
      const productIds = products.map((p) => p.id)
      if (productIds.length > 0) {
        await tx.orderProduct.deleteMany({ where: { productId: { in: productIds } } })
        await tx.product.deleteMany({ where: { brandId: id } })
      }
      await tx.brand.delete({ where: { id } })
    })
  } catch (e) {
    console.error("[permanentDeleteBrand]", e)
    return { message: "Failed to permanently delete brand." }
  }
  revalidatePath("/dashboard/brands")
  return { message: "Brand permanently deleted." }
}
