import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config/app";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-12 md:px-10">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          Scaffold ready
        </p>
        <div className="flex flex-col gap-3">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance">
            {appConfig.name}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {appConfig.description}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>What&apos;s in place</CardTitle>
            <CardDescription>
              The app shell is ready for milestone 1 implementation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
              <li>Next.js App Router with Tailwind v4</li>
              <li>Stock shadcn/ui setup with generated components</li>
              <li>Initial `lib/` namespaces for auth, db, domain, and costing</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milestone 1</CardTitle>
            <CardDescription>
              The first usable release stays ingredient-first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
              <li>Bakery auth and onboarding</li>
              <li>Ingredients, packaging, and dated purchase history</li>
              <li>Recipes, sub-recipes, and production runs</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next build slice</CardTitle>
            <CardDescription>
              The next coding pass should establish the product backbone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
              <li>Better Auth with organization support</li>
              <li>Drizzle schema and Neon database wiring</li>
              <li>Test-first costing engine foundations</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Reference docs</CardTitle>
          <CardDescription>
            The scaffold is intentionally thin. These are the main references
            for the next implementation step.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row">
          <Button asChild>
            <Link href="https://nextjs.org/docs" target="_blank">
              Next.js Docs
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="https://ui.shadcn.com/docs" target="_blank">
              shadcn/ui Docs
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
