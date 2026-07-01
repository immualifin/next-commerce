"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signUpSchema } from "@/lib/validations";

export type SignUpState = {
  errors: Record<string, string[]> | null;
  message: string | null;
};

export async function signUpAction(
  prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: null,
    };
  }

  const { name, email, password } = parsed.data;

  try {
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: baseUrl,
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        errors: null,
        message: data.message ?? data.error ?? "Could not create account",
      };
    }

    // Forward session cookie — Better Auth auto-signs in after sign-up
    const setCookie = res.headers.getSetCookie();
    if (setCookie) {
      const cookieStore = await cookies();
      for (const cookie of setCookie) {
        const [name, ...rest] = cookie.split("=");
        const value = rest.join("=").split(";")[0];
        cookieStore.set(name, value, {
          path: "/",
          httpOnly: true,
          secure: true,
          sameSite: "lax",
        });
      }
    }
  } catch (e) {
    console.error("[signUpAction]", e);
    return {
      errors: null,
      message: "Something went wrong. Please try again.",
    };
  }

  redirect("/");
}
