import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "@/components/sign-out-button";
import { getAppShellState } from "@/lib/domain/app-shell";

export default async function Home() {
  const appShellState = await getAppShellState();

  if (!appShellState.session) {
    redirect("/login");
  }

  if (appShellState.needsOnboarding) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-12 md:px-10">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
          <div className="flex flex-col gap-2">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance">
              {appShellState.activeOrganization?.name}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              The app shell is now authenticated and linked to your active
              bakery. The next slice is catalog, purchase history, and recipe
              CRUD.
            </p>
          </div>
        </div>
        <SignOutButton />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bakery defaults</CardTitle>
            <CardDescription>
              These values came from onboarding and are now persisted.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
              <li>Currency: {appShellState.settings?.currencyCode}</li>
              <li>Locale: {appShellState.settings?.locale}</li>
              <li>
                Default markup:{" "}
                {appShellState.settings?.defaultMarkupPercentage?.toString()}%
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schema foundation</CardTitle>
            <CardDescription>
              The first org-scoped app tables are now in Drizzle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
              <li>Purchasable items and purchase entries</li>
              <li>Recipe lineages, versions, and sub-recipes</li>
              <li>Production runs and organization settings</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next build slice</CardTitle>
            <CardDescription>
              The next coding pass should start real business CRUD.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-muted-foreground">
              <li>Ingredient and packaging catalog management</li>
              <li>Dated supplier pack purchase entry flow</li>
              <li>Recipe creation with versioned saves</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
