import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { purchaseEntry, purchasableItem } from "@/lib/db/schema";
import { normalizePurchasableItemName } from "@/lib/domain/onboarding";

export function calculateTotalQuantityCanonical(
  packCount: number,
  packQuantity: number,
) {
  return Number((packCount * packQuantity).toFixed(4));
}

export function calculateUnitCost(
  totalPrice: number,
  totalQuantityCanonical: number,
) {
  if (totalQuantityCanonical <= 0) {
    return 0;
  }

  return totalPrice / totalQuantityCanonical;
}

export async function listCatalogItems(organizationId: string) {
  const items = await db
    .select()
    .from(purchasableItem)
    .where(
      and(
        eq(purchasableItem.organizationId, organizationId),
        isNull(purchasableItem.deletedAt),
      ),
    )
    .orderBy(purchasableItem.category, purchasableItem.name);

  const entries = await db
    .select()
    .from(purchaseEntry)
    .where(
      and(
        eq(purchaseEntry.organizationId, organizationId),
        isNull(purchaseEntry.deletedAt),
      ),
    )
    .orderBy(desc(purchaseEntry.purchasedAt), desc(purchaseEntry.createdAt));

  const entriesByItemId = new Map<string, typeof entries>();

  for (const entry of entries) {
    const itemEntries = entriesByItemId.get(entry.itemId) ?? [];
    itemEntries.push(entry);
    entriesByItemId.set(entry.itemId, itemEntries);
  }

  return items.map((item) => {
    const itemEntries = entriesByItemId.get(item.id) ?? [];
    const latestEntry = itemEntries[0] ?? null;

    return {
      ...item,
      purchaseEntryCount: itemEntries.length,
      latestEntry,
    };
  });
}

export async function getCatalogItem(organizationId: string, itemId: string) {
  const [item] = await db
    .select()
    .from(purchasableItem)
    .where(
      and(
        eq(purchasableItem.id, itemId),
        eq(purchasableItem.organizationId, organizationId),
        isNull(purchasableItem.deletedAt),
      ),
    )
    .limit(1);

  if (!item) {
    return null;
  }

  const entries = await db
    .select()
    .from(purchaseEntry)
    .where(
      and(
        eq(purchaseEntry.itemId, itemId),
        eq(purchaseEntry.organizationId, organizationId),
        isNull(purchaseEntry.deletedAt),
      ),
    )
    .orderBy(desc(purchaseEntry.purchasedAt), desc(purchaseEntry.createdAt));

  return {
    item,
    entries,
  };
}

export function buildPurchasableItemInsert({
  organizationId,
  userId,
  category,
  name,
  canonicalUnit,
}: {
  organizationId: string;
  userId: string;
  category: "ingredient" | "packaging";
  name: string;
  canonicalUnit: string;
}) {
  return {
    id: crypto.randomUUID(),
    organizationId,
    category,
    name: name.trim(),
    nameNormalized: normalizePurchasableItemName(name),
    canonicalUnit: canonicalUnit.trim(),
    createdBy: userId,
    updatedBy: userId,
  } as const;
}

export function buildPurchaseEntryInsert({
  organizationId,
  userId,
  itemId,
  supplierName,
  packCount,
  packQuantity,
  packUnit,
  totalPrice,
  purchasedAt,
}: {
  organizationId: string;
  userId: string;
  itemId: string;
  supplierName?: string;
  packCount: number;
  packQuantity: number;
  packUnit: string;
  totalPrice: number;
  purchasedAt: Date;
}) {
  return {
    id: crypto.randomUUID(),
    organizationId,
    itemId,
    supplierName: supplierName?.trim() || null,
    packCount,
    packQuantity: packQuantity.toFixed(4),
    packUnit: packUnit.trim(),
    totalQuantityCanonical: calculateTotalQuantityCanonical(
      packCount,
      packQuantity,
    ).toFixed(4),
    totalPrice: totalPrice.toFixed(2),
    purchasedAt,
    createdBy: userId,
  } as const;
}
