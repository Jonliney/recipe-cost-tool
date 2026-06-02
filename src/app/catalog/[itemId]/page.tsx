import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PurchaseEntryForm } from "@/components/purchase-entry-form";
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
  getCatalogItem,
} from "@/lib/domain/catalog";
import { getAppShellState } from "@/lib/domain/app-shell";

type CatalogItemPageProps = {
  params: Promise<{
    itemId: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function CatalogItemPage({ params }: CatalogItemPageProps) {
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

  const { itemId } = await params;
  const catalogItem = await getCatalogItem(appShellState.organizationId, itemId);

  if (!catalogItem) {
    notFound();
  }

  const currencyCode = appShellState.settings?.currencyCode ?? "GBP";
  const currencyFormatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currencyCode,
  });

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-12 md:px-10">
      <section className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            <Link href="/catalog" className="underline underline-offset-4">
              Catalog
            </Link>{" "}
            / {catalogItem.item.name}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            {catalogItem.item.name}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Record supplier pack purchases over time. This item is currently
            costed in `{catalogItem.item.canonicalUnit}`.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/catalog">Back to catalog</Link>
        </Button>
      </section>

      <section className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Add purchase entry</CardTitle>
            <CardDescription>
              Record a dated supplier purchase for this item.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PurchaseEntryForm
              itemId={catalogItem.item.id}
              canonicalUnit={catalogItem.item.canonicalUnit}
            />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {catalogItem.entries.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No purchase history yet</CardTitle>
                <CardDescription>
                  Add the first dated purchase for this item to establish its
                  current cost.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            catalogItem.entries.map((entry) => {
              const unitCost = calculateUnitCost(
                Number(entry.totalPrice),
                Number(entry.totalQuantityCanonical),
              );

              return (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-1">
                      <CardTitle>
                        {entry.packCount} × {Number(entry.packQuantity)}{" "}
                        {entry.packUnit}
                      </CardTitle>
                      <CardDescription>
                        Purchased {dateFormatter.format(entry.purchasedAt)}
                        {entry.supplierName ? ` · ${entry.supplierName}` : ""}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                      <p>
                        Total quantity: {Number(entry.totalQuantityCanonical)}{" "}
                        {catalogItem.item.canonicalUnit}
                      </p>
                      <p>
                        Total price: {currencyFormatter.format(Number(entry.totalPrice))}
                      </p>
                      <p>
                        Unit cost:{" "}
                        {currencyFormatter.format(unitCost)}/
                        {catalogItem.item.canonicalUnit}
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
