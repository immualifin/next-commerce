# Development Guide

Next Commerce — Ecommerce app with Next.js 16, Prisma, and Better Auth.

## Prerequisites

- Node.js 20+
- PostgreSQL (Supabase)
- Google Cloud Console project (for OAuth)

## Environment Variables

```bash
# Supabase / Database
DATABASE_URL="postgresql://postgres.<id>:<pass>@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<id>:<pass>@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

# Better Auth
BETTER_AUTH_SECRET="..."    # openssl rand -hex 32
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PgBouncer pooler (transaction mode) — for queries |
| `DIRECT_URL` | Direct PostgreSQL (session mode) — for migrations |
| `BETTER_AUTH_SECRET` | Session encryption key |

## Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 (`engine: "classic"`) |
| Auth | Better Auth (email/password + Google OAuth) |
| Validation | Zod (server actions) |
| UI | Tailwind CSS 4 |
| Components | shadcn (base-vega style, `components.json`) |
| Icons | Lucide React |

## Project Structure

```
app/
├── (admin)/
│   └── dashboard/
│       └── (auth)/              # auth layout wrapper
│           ├── layout.tsx        # centered + logo
│           └── sign-in/
│               ├── page.tsx      # <LoginForm />
│               └── actions.ts    # server action
├── api/
│   └── auth/
│       └── [...all]/
│           └── route.ts          # Better Auth API handler
├── layout.tsx
└── page.tsx
components/
├── login-form.tsx
└── ui/                          # shadcn components
lib/
├── auth.ts                      # Better Auth server config
├── auth-client.ts               # Better Auth client (for OAuth)
├── prisma.ts                    # Prisma singleton
├── utils.ts                     # cn() helper
└── validations.ts               # Zod schemas
prisma/
├── schema.prisma
├── config.ts                    # Prisma 6 config
└── migrations/
```

## Route Groups

| Group | Path | URL |
|-------|------|-----|
| `(admin)` | Admin pages | `/dashboard` |
| `(auth)` | Auth pages | `/dashboard/sign-in` |

Route groups don't affect the URL — they only organize layout inheritance.

## Database

### Prisma Config (`prisma.config.ts`)

```ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
    directUrl: env("DIRECT_URL"),   // required — migrations use this
  },
});
```

### Schema

All models use `String @id @default(cuid())` for primary keys.

**Auth models** (Better Auth):
- `User` — merged with ecommerce fields (`rule` enum)
- `Session` — with cascade delete on user
- `Account` — OAuth + credential passwords
- `Verification` — email verification tokens

**Ecommerce models**: `Brand`, `Category`, `Location`, `Product`, `Order`, `OrderDetail`, `OrderProduct`

### Migrations

```bash
npx prisma migrate dev --name <name>    # create + apply
npx prisma generate                     # regenerate client
npx prisma studio                       # GUI browser
```

## Auth

### Server Config (`lib/auth.ts`)

```ts
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
});
```

### Server Action Pattern

Sign-in uses a server action with Zod validation:

```
form submit → useActionState → signInAction (server)
                                   ├─ Zod parse
                                   ├─ auth.api.signInEmail()
                                   ├─ set cookies
                                   └─ redirect /dashboard
```

```tsx
// Client component
const [state, formAction, isPending] = useActionState(signInAction, {
  errors: null,
  message: null,
});

<form action={formAction}>
  <Input name="email" />
  {state.errors?.email && <p>{state.errors.email[0]}</p>}
</form>
```

```ts
// Server action
"use server";
const parsed = signInSchema.safeParse({ email, password });
if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, message: null };
const response = await auth.api.signInEmail({ body: parsed.data, headers: new Headers() });
redirect("/dashboard");
```

### Google OAuth

Uses client-side `authClient.signIn.social()` because OAuth requires browser redirect:

```tsx
authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
```

### Google Cloud Console Setup

1. Create project → APIs & Services → Credentials
2. OAuth 2.0 Client ID → Web application
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

## UI Components

### Add shadcn Components

```bash
npx shadcn add <component>
```

### Base Style

`base-vega` style with neutral color, CSS variables, Lucide icons (see `components.json`).

## Conventions

### Client / Server Boundaries

- **Server Components** (default): pages, layouts, actions
- **Client Components** (`"use client"`): forms, interactive UI
- **Server Actions**: validate + mutate + redirect

### Imports

- `@/` alias → project root
- `@/components/ui/*` → shadcn components
- `@/lib/*` → utilities, config, validations

### Naming

- Page components: `PascalCase` (export default)
- Files: `kebab-case`
- Server actions: `camelCase` with `Action` suffix
