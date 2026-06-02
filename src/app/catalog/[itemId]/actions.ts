"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { purchaseEntry } from "@/lib/db/schema";
import { buildPurchaseEntryInsert, getCatalogItem } from "@/lib/domain/catalog";
import { getOnboardingState } from "@/lib/domain/onboarding";
import { getActionFormValue } from "@/lib/utils/form-data";

type PurchaseActionState = {
  error: string | null;
};

const addPurchaseEntrySchema = z.object({
  itemId: z.string().trim().min(1),
  supplierName: z.string().trim().optional(),
  packCount: z.coerce.number().int().min(1, "Pack count must be at least 1."),
  packQuantity: z.coerce
    .number()
    .positive("Pack quantity must be greater than 0."),
  totalPrice: z.coerce.number().positive("Total price must be greater than 0."),
  purchasedAt: z.string().trim().min(1, "Choose a purchase date and time."),
});

const initialPurchaseActionState = {
  error: null,
};

export async function addPurchaseEntry(
  _previousState: PurchaseActionState,
  formData: FormData,
): Promise<PurchaseActionState> {
  const session = await getSession();

  if (!session) {
    return {
      error: "You must be signed in to continue.",
    };
  }

  const onboardingState = await getOnboardingState(
    session.user.id,
    session.session.activeOrganizationId,
  );

  const organizationId = onboardingState.resolvedOrganizationId ?? null;

  if (!organizationId) {
    return {
      error: "Create a bakery before adding purchase history.",
    };
  }

  const parsed = addPurchaseEntrySchema.safeParse({
    itemId: getActionFormValue(formData, "itemId"),
    supplierName: getActionFormValue(formData, "supplierName"),
    packCount: getActionFormValue(formData, "packCount"),
    packQuantity: getActionFormValue(formData, "packQuantity"),
    totalPrice: getActionFormValue(formData, "totalPrice"),
    purchasedAt: getActionFormValue(formData, "purchasedAt"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid purchase data.",
    };
  }

  const catalogItem = await getCatalogItem(organizationId, parsed.data.itemId);

  if (!catalogItem) {
    return {
      error: "That item could not be found for the active bakery.",
    };
  }

  const purchasedAt = new Date(parsed.data.purchasedAt);

  if (Number.isNaN(purchasedAt.getTime())) {
    return {
      error: "Choose a valid purchase date and time.",
    };
  }

  const entry = buildPurchaseEntryInsert({
    organizationId,
    userId: session.user.id,
    itemId: catalogItem.item.id,
    supplierName: parsed.data.supplierName,
    packCount: parsed.data.packCount,
    packQuantity: parsed.data.packQuantity,
    packUnit: catalogItem.item.canonicalUnit,
    totalPrice: parsed.data.totalPrice,
    purchasedAt,
  });

  await db.insert(purchaseEntry).values(entry);

  revalidatePath("/catalog");
  revalidatePath(`/catalog/${catalogItem.item.id}`);

  return initialPurchaseActionState;
}
