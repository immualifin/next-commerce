import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <span className="text-lg font-bold">Next Commerce</span>
        <nav className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Welcome to Next Commerce
        </h1>
        <p className="mt-4 max-w-md text-lg text-muted-foreground">
          The modern ecommerce platform for your next project.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/sign-up"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium shadow-xs hover:bg-muted"
          >
            Sign in
          </Link>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Next Commerce. All rights reserved.
      </footer>
    </div>
  );
}
