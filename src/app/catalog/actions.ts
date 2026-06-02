"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { purchasableItem } from "@/lib/db/schema";
import { buildPurchasableItemInsert } from "@/lib/domain/catalog";
import { getOnboardingState } from "@/lib/domain/onboarding";
import { getActionFormValue } from "@/lib/utils/form-data";

type CatalogActionState = {
  error: string | null;
};

const createCatalogItemSchema = z.object({
  category: z.enum(["ingredient", "packaging"]),
  name: z.string().trim().min(2, "Enter an item name."),
  canonicalUnit: z.string().trim().min(1, "Enter a canonical unit."),
});

const initialCatalogActionState = {
  error: null,
};

export async function createCatalogItem(
  _previousState: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
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
      error: "Create a bakery before adding catalog items.",
    };
  }

  const parsed = createCatalogItemSchema.safeParse({
    category: getActionFormValue(formData, "category"),
    name: getActionFormValue(formData, "name"),
    canonicalUnit: getActionFormValue(formData, "canonicalUnit"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid item data.",
    };
  }

  const item = buildPurchasableItemInsert({
    organizationId,
    userId: session.user.id,
    category: parsed.data.category,
    name: parsed.data.name,
    canonicalUnit: parsed.data.canonicalUnit,
  });

  try {
    await db.insert(purchasableItem).values(item);
  } catch (error) {
    console.error(error);

    return {
      error:
        "Could not create the item. Active item names must be unique within a category.",
    };
  }

  revalidatePath("/catalog");

  if (!session.session.activeOrganizationId) {
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: {
        organizationId,
      },
    });
  }

  return initialCatalogActionState;
}
