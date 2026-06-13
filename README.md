# Next Commerce

Ecommerce app built with Next.js 16, Prisma, and Better Auth.

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6
- **Auth**: Better Auth (email/password + Google OAuth, password: scrypt)
- **Validation**: Zod (server actions)
- **UI**: Tailwind CSS 4 + shadcn
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Run database migration
npx prisma migrate dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── (admin)/
│   └── dashboard/
│       └── (auth)/
│           ├── layout.tsx
│           └── sign-in/
│               └── page.tsx
├── api/auth/[...all]/route.ts
├── layout.tsx
└── page.tsx
components/
├── login-form.tsx
└── ui/          # shadcn components
lib/
├── auth.ts          # Better Auth server config
├── auth-client.ts   # Better Auth client
├── prisma.ts        # Prisma singleton
├── utils.ts         # shadcn utils
└── validations.ts   # Zod schemas
prisma/
├── schema.prisma
└── config.ts
```
