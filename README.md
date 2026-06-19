# Next Commerce

Ecommerce app built with Next.js 16, Prisma, and Better Auth.

## Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 6
- **Auth**: Better Auth (email/password + Google OAuth, password: scrypt)
- **Validation**: Zod (server actions)
- **UI**: Tailwind CSS 4 + shadcn (base-vega, `@base-ui/react`)
- **Charts**: Recharts
- **Table**: @tanstack/react-table + @dnd-kit
- **Toast**: Sonner
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

# (Optional) Seed superadmin
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Default Admin

| Field | Value |
|-------|-------|
| Email | `admin@example.com` |
| Password | `admin123456` |

## Database Viewer

```bash
npx prisma studio
```

Opens Prisma Studio at [http://localhost:5555](http://localhost:5555) — a visual GUI to browse, edit, and filter all 11 tables.

## Project Structure

```
app/
├── (admin)/
│   └── dashboard/
│       ├── layout.tsx              # Shared shell: sidebar + header
│       ├── (index)/
│       │   ├── page.tsx            # Dashboard overview (charts + table)
│       │   └── data.json           # Sample data
│       ├── (auth)/
│       │   ├── layout.tsx          # Auth wrapper (centered card)
│       │   └── sign-in/
│       │       ├── page.tsx        # Login form
│       │       └── actions.ts      # Sign-in server action
│       ├── products/
│       │   ├── page.tsx            # Product list (server fetch)
│       │   └── actions.ts          # CRUD server actions
│       ├── orders/
│       │   ├── page.tsx
│       │   └── actions.ts
│       ├── customers/
│       │   ├── page.tsx
│       │   └── actions.ts
│       ├── brands/
│       │   ├── page.tsx
│       │   └── actions.ts
│       ├── categories/
│       │   ├── page.tsx
│       │   └── actions.ts
│       ├── locations/
│       │   ├── page.tsx
│       │   └── actions.ts
│       ├── settings/
│       │   └── page.tsx
│       └── help/
│           └── page.tsx
├── api/auth/[...all]/route.ts      # Better Auth API handler
├── layout.tsx                      # Root layout + TooltipProvider
└── page.tsx
components/
├── app-sidebar.tsx                 # Sidebar shell + menu data
├── nav-main.tsx                    # Main navigation (with active state)
├── nav-secondary.tsx               # Secondary nav (Settings, Help)
├── nav-user.tsx                    # User dropdown + logout
├── site-header.tsx                 # Top header bar
├── section-cards.tsx               # Dashboard metric cards
├── chart-area-interactive.tsx      # Dashboard area chart
├── data-table.tsx                  # Dashboard data table
├── login-form.tsx                  # Sign-in form
├── brand-form.tsx / brand-list.tsx
├── category-form.tsx / category-list.tsx
├── location-form.tsx / location-list.tsx
├── product-form.tsx / product-list.tsx
├── customer-form.tsx / customer-list.tsx
├── order-form.tsx / order-list.tsx
└── ui/                             # 22 shadcn components
lib/
├── auth.ts                         # Better Auth server config
├── auth-client.ts                  # Better Auth client
├── prisma.ts                       # Prisma singleton
├── utils.ts                        # cn(), serialize() helpers
└── validations.ts                  # Zod schemas (auth + 6 entities)
hooks/
└── use-mobile.ts                   # Mobile detection hook
prisma/
├── schema.prisma                   # Auth + ecommerce models
├── seed.ts                         # Superadmin seeder
├── config.ts
└── migrations/
```

## Routes

| URL | Page | Description |
|-----|------|-------------|
| `/dashboard` | Dashboard overview | Charts, cards, data table |
| `/dashboard/sign-in` | Sign in | Email/password + Google OAuth |
| `/dashboard/products` | Products | Product catalog CRUD |
| `/dashboard/orders` | Orders | Order management + shipping detail |
| `/dashboard/customers` | Customers | User management |
| `/dashboard/brands` | Brands | Brand CRUD |
| `/dashboard/categories` | Categories | Category CRUD |
| `/dashboard/locations` | Locations | Location CRUD |
| `/dashboard/settings` | Settings | App settings (placeholder) |
| `/dashboard/help` | Help | Help & docs (placeholder) |

## CRUD Architecture

Each entity follows the same pattern:

```
Server Action (actions.ts)
  → Zod safeParse for validation
  → Prisma mutation (create/update/delete)
  → revalidatePath("/dashboard/<entity>")
  → return { errors, message }

Client Form (<entity>-form.tsx)
  → useActionState with server action
  → Sheet modal (create/edit)
  → Field errors from state.errors
  → Sonner toast on success

Client List (<entity>-list.tsx)
  → Table with edit/delete row actions
  → New button opens Sheet form
  → useTransition for async delete

Page (page.tsx)
  → Server component
  → Fetch data via prisma.findMany()
  → Pass to client list component
```
