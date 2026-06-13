"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signInSchema } from "@/lib/validations";

export async function signInAction(
  prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: null,
    };
  }

  const { email, password } = parsed.data;

  try {
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: baseUrl,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || data.redirect !== false) {
      return {
        errors: null,
        message: data.message ?? "Invalid email or password",
      };
    }

    // Forward session cookie from Better Auth response
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
    console.error("[signInAction]", e);
    return {
      errors: null,
      message: "Something went wrong. Please try again.",
    };
  }

  redirect("/dashboard");
}

export type SignInState = {
  errors: Record<string, string[]> | null;
  message: string | null;
};
