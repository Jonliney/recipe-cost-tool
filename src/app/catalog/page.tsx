import Link from "next/link";
import { redirect } from "next/navigation";

import { CatalogItemForm } from "@/components/catalog-item-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  calculateUnitCost,
  listCatalogItems,
} from "@/lib/domain/catalog";
import { getAppShellState } from "@/lib/domain/app-shell";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function CatalogPage() {
  const appShellState = await getAppShellState();

  if (!appShellState.session) {
    redirect("/login");
  }

  if (appShellState.needsOnboarding) {
    redirect("/onboarding");
  }

  if (!appShellState.organizationId || !appShellState.activeOrganization) {
    redirect("/onboarding");
  }

  const items = await listCatalogItems(appShellState.organizationId);
  const currencyCode = appShellState.settings?.currencyCode ?? "GBP";
  const formattedCurrency = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
  });

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-12 md:px-10">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">Catalog</p>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            Purchasable items
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Manage ingredients and packaging at the bakery level, then record
            dated purchase entries against each item.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Add an item</CardTitle>
            <CardDescription>
              Create an ingredient or packaging item using its canonical costing
              unit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CatalogItemForm />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {items.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No items yet</CardTitle>
                <CardDescription>
                  Add your first ingredient or packaging item to start recording
                  purchase history.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            items.map((item) => {
              const latestUnitCost = item.latestEntry
                ? calculateUnitCost(
                    Number(item.latestEntry.totalPrice),
                    Number(item.latestEntry.totalQuantityCanonical),
                  )
                : null;

              return (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-col gap-1">
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>
                          {item.category} · Costed in `{item.canonicalUnit}`
                        </CardDescription>
                      </div>
                      <Button asChild variant="outline">
                        <Link href={`/catalog/${item.id}`}>View history</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                      <p>Purchase entries: {item.purchaseEntryCount}</p>
                      <p>
                        Latest purchase:{" "}
                        {item.latestEntry
                          ? dateFormatter.format(item.latestEntry.purchasedAt)
                          : "None yet"}
                      </p>
                      <p>
                        Latest unit cost:{" "}
                        {latestUnitCost !== null
                          ? `${formattedCurrency.format(latestUnitCost)}/${item.canonicalUnit}`
                          : "Not available"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
