"use server"

import { revalidatePath } from "next/cache"
import { productSchema } from "@/lib/validations"
import prisma from "@/lib/prisma"

export type ProductState = {
  errors: Record<string, string[]> | null
  message: string | null
}

export async function createProductAction(
  prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    image: formData.get("image"),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    locationId: formData.get("locationId"),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: null }
  }

  const { name, description, price, stock, image, brandId, categoryId, locationId } = parsed.data

  try {
    await prisma.product.create({
      data: {
        name,
        description,
        price: BigInt(price),
        stock,
        image: image.split(",").map((s) => s.trim()).filter(Boolean),
        brandId,
        categoryId,
        locationId,
      },
    })
  } catch (e) {
    console.error("[createProduct]", e)
    return { errors: null, message: "Failed to create product." }
  }

  revalidatePath("/dashboard/products")
  return { errors: null, message: "Product created successfully." }
}

export async function updateProductAction(
  id: string,
  prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    image: formData.get("image"),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    locationId: formData.get("locationId"),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: null }
  }

  const { name, description, price, stock, image, brandId, categoryId, locationId } = parsed.data

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: BigInt(price),
        stock,
        image: image.split(",").map((s) => s.trim()).filter(Boolean),
        brandId,
        categoryId,
        locationId,
      },
    })
  } catch (e) {
    console.error("[updateProduct]", e)
    return { errors: null, message: "Failed to update product." }
  }

  revalidatePath("/dashboard/products")
  return { errors: null, message: "Product updated successfully." }
}

export async function deleteProductAction(id: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  } catch {
    return { message: "Failed to delete product." }
  }
  revalidatePath("/dashboard/products")
  return { message: "Product moved to trash." }
}

export async function restoreProductAction(id: string) {
  try {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    })
  } catch {
    return { message: "Failed to restore product." }
  }
  revalidatePath("/dashboard/products")
  return { message: "Product restored successfully." }
}

export async function permanentDeleteProductAction(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.orderProduct.deleteMany({ where: { productId: id } })
      await tx.product.delete({ where: { id } })
    })
  } catch (e) {
    console.error("[permanentDeleteProduct]", e)
    return { message: "Failed to permanently delete product." }
  }
  revalidatePath("/dashboard/products")
  return { message: "Product permanently deleted." }
}
