"use server"

import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { productSchema } from "@/lib/validations"
import prisma from "@/lib/prisma"

export type ProductState = {
  errors: Record<string, string[]> | null
  message: string | null
}

// ── Helpers ──

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products")

async function ensureUploadDir() {
  try { await mkdir(UPLOAD_DIR, { recursive: true }) } catch { /* exists */ }
}

/**
 * Save uploaded files and return their public paths.
 */
async function saveFiles(files: File[]): Promise<string[]> {
  if (files.length === 0) return []

  await ensureUploadDir()

  const paths: string[] = []
  for (const file of files) {
    // Generate unique filename
    const ext = file.name.split(".").pop() ?? "jpg"
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filePath = path.join(UPLOAD_DIR, uniqueName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)
    paths.push(`/uploads/products/${uniqueName}`)
  }
  return paths
}

/**
 * Parse image data from FormData:
 * - "images" → new File objects (upload)
 * - "existing" → repeated hidden fields carrying already-stored URLs
 */
async function parseImages(formData: FormData): Promise<string[]> {
  const newFiles = formData.getAll("images").filter(
    (v): v is File => v instanceof File && v.size > 0,
  )
  const existingUrls = formData.getAll("existing").filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  )

  const newPaths = await saveFiles(newFiles)
  return [...existingUrls, ...newPaths]
}

function parseProductData(formData: FormData) {
  return {
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    brandId: formData.get("brandId"),
    categoryId: formData.get("categoryId"),
    locationId: formData.get("locationId"),
  }
}

// ── Actions ──

export async function createProductAction(
  prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  const parsed = productSchema.safeParse(parseProductData(formData))

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: null }
  }

  const { name, description, price, stock, brandId, categoryId, locationId } =
    parsed.data

  let image: string[]
  try {
    image = await parseImages(formData)
  } catch (e) {
    console.error("[createProduct] upload error", e)
    return { errors: null, message: "Failed to upload images." }
  }

  if (image.length === 0) {
    return { errors: { image: ["At least one image is required"] }, message: null }
  }

  try {
    await prisma.product.create({
      data: {
        name,
        description,
        price: BigInt(price),
        stock,
        image,
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
  const parsed = productSchema.safeParse(parseProductData(formData))

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: null }
  }

  const { name, description, price, stock, brandId, categoryId, locationId } =
    parsed.data

  let image: string[]
  try {
    image = await parseImages(formData)
  } catch (e) {
    console.error("[updateProduct] upload error", e)
    return { errors: null, message: "Failed to upload images." }
  }

  if (image.length === 0) {
    return { errors: { image: ["At least one image is required"] }, message: null }
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: BigInt(price),
        stock,
        image,
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
