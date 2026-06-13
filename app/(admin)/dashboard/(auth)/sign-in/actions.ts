"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { signInSchema } from "@/lib/validations";

export async function signInAction(
  prevState: SignInState,
  formData: FormData,
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
    const response = await auth.api.signInEmail({
      body: { email, password },
      headers: new Headers(),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return {
        errors: null,
        message: body?.message ?? "Invalid email or password",
      };
    }

    // Forward cookies from better-auth response
    const setCookie = response.headers.getSetCookie();
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
  } catch {
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
