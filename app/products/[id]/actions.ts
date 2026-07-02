"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const testimonialSchema = z.object({
  productId: z.string().min(1),
  stars: z.coerce.number().int().min(1).max(5),
  text: z.string().min(10, "Testimonial must be at least 10 characters").max(500),
})

export async function saveTestimonial(
  prevState: {
    errors: Record<string, string[]> | null
    message: string | null
    success: boolean
  },
  formData: FormData,
) {
  try {
    // Auth check
    const cookieHeader = (await headers()).get("cookie")
    const session = await auth.api.getSession({
      headers: new Headers(cookieHeader ? { cookie: cookieHeader } : {}),
    })

    if (!session?.user) {
      return { errors: null, message: "You must be logged in to write a testimonial.", success: false }
    }

    // Validate
    const parsed = testimonialSchema.safeParse({
      productId: formData.get("productId"),
      stars: formData.get("stars"),
      text: formData.get("text"),
    })

    if (!parsed.success) {
      return {
        errors: parsed.error.flatten().fieldErrors,
        message: "Please fix the errors below.",
        success: false,
      }
    }

    const { productId, stars, text } = parsed.data

    // Check product exists
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    })
    if (!product) {
      return { errors: null, message: "Product not found.", success: false }
    }

    // Prevent duplicate — one testimonial per user per product
    const existing = await prisma.testimonial.findFirst({
      where: { productId, userId: session.user.id },
    })
    if (existing) {
      return {
        errors: null,
        message: "You've already submitted a testimonial for this product.",
        success: false,
      }
    }

    // Save testimonial
    await prisma.testimonial.create({
      data: {
        productId,
        userId: session.user.id,
        stars,
        text,
      },
    })

    revalidatePath(`/products/${productId}`)

    return { errors: null, message: null, success: true }
  } catch (error) {
    console.error("saveTestimonial error:", error)
    return {
      errors: null,
      message: "Something went wrong. Please try again.",
      success: false,
    }
  }
}
