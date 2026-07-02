import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

// ─── Brand ───────────────────────────────────────────────────

export const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  logo: z.string().min(1, "Logo URL is required"),
});

export type BrandInput = z.infer<typeof brandSchema>;

// ─── Category ────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// ─── Location ────────────────────────────────────────────────

export const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
});

export type LocationInput = z.infer<typeof locationSchema>;

// ─── Product ─────────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  stock: z.enum(["ready", "preorder"]),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  locationId: z.string().min(1, "Location is required"),
});

export type ProductInput = z.infer<typeof productSchema>;

// ─── Customer (User) ─────────────────────────────────────────

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  rule: z.enum(["superadmin", "customer"]),
});

export type CustomerInput = z.infer<typeof customerSchema>;

// ─── Order ───────────────────────────────────────────────────

export const orderSchema = z.object({
  code: z.string().min(1, "Order code is required"),
  userId: z.string().min(1, "Customer is required"),
  total: z.coerce.number().int().min(0, "Total must be non-negative"),
  status: z.enum(["pending", "success", "failed"]),
});

export type OrderInput = z.infer<typeof orderSchema>;
