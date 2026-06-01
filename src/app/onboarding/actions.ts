"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { organizationSettings } from "@/lib/db/schema";
import { ensureUniqueOrganizationSlug } from "@/lib/domain/onboarding";

type OnboardingActionState = {
  error: string | null;
};

const onboardingSchema = z.object({
  bakeryName: z.string().trim().min(2, "Enter a bakery name."),
  currencyCode: z.string().trim().min(3),
  countryCode: z.string().trim().min(2),
  locale: z.string().trim().min(2),
  vatRegistered: z.enum(["yes", "no"]).default("no"),
  defaultTaxRate: z.coerce.number().min(0).max(100),
  defaultMarkupPercentage: z.coerce.number().min(0).max(1000),
  roundingMode: z.enum(["none", "increment", "price_ending"]),
  roundingIncrement: z.string().trim().optional(),
  roundingPriceEnding: z.string().trim().optional(),
});

function parseOptionalMoney(value?: string) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed;
}

function getFormValue(formData: FormData, fieldName: string) {
  const directValue = formData.get(fieldName);

  if (directValue !== null) {
    return directValue;
  }

  for (const [entryKey, entryValue] of formData.entries()) {
    if (entryKey === fieldName) {
      return entryValue;
    }

    if (entryKey.match(new RegExp(`^_\\d+_${fieldName}$`))) {
      return entryValue;
    }
  }

  return undefined;
}

export async function completeOnboarding(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await getSession();

  if (!session) {
    return {
      error: "You must be signed in to continue.",
    };
  }

  const parsed = onboardingSchema.safeParse({
    bakeryName: getFormValue(formData, "bakeryName"),
    currencyCode: getFormValue(formData, "currencyCode"),
    countryCode: getFormValue(formData, "countryCode"),
    locale: getFormValue(formData, "locale"),
    vatRegistered: getFormValue(formData, "vatRegistered"),
    defaultTaxRate: getFormValue(formData, "defaultTaxRate"),
    defaultMarkupPercentage: getFormValue(formData, "defaultMarkupPercentage"),
    roundingMode: getFormValue(formData, "roundingMode"),
    roundingIncrement: getFormValue(formData, "roundingIncrement"),
    roundingPriceEnding: getFormValue(formData, "roundingPriceEnding"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid onboarding data.",
    };
  }

  const values = parsed.data;
  let organizationId = session.session.activeOrganizationId ?? null;

  if (!organizationId) {
    const slug = await ensureUniqueOrganizationSlug(values.bakeryName);
    const created = await auth.api.createOrganization({
      headers: await headers(),
      body: {
        name: values.bakeryName,
        slug,
        keepCurrentActiveOrganization: false,
      },
    });

    organizationId = created.id;
  }

  if (!organizationId) {
    return {
      error: "Could not resolve an active bakery.",
    };
  }

  await db
    .insert(organizationSettings)
    .values({
      organizationId,
      countryCode: values.countryCode,
      locale: values.locale,
      currencyCode: values.currencyCode,
      vatRegistered: values.vatRegistered === "yes",
      defaultTaxRate: values.defaultTaxRate.toFixed(2),
      defaultMarkupPercentage: values.defaultMarkupPercentage.toFixed(2),
      roundingMode: values.roundingMode,
      roundingIncrement:
        values.roundingMode === "increment"
          ? parseOptionalMoney(values.roundingIncrement)
          : null,
      roundingPriceEnding:
        values.roundingMode === "price_ending"
          ? parseOptionalMoney(values.roundingPriceEnding)
          : null,
      createdBy: session.user.id,
      updatedBy: session.user.id,
    })
    .onConflictDoUpdate({
      target: organizationSettings.organizationId,
      set: {
        countryCode: values.countryCode,
        locale: values.locale,
        currencyCode: values.currencyCode,
        vatRegistered: values.vatRegistered === "yes",
        defaultTaxRate: values.defaultTaxRate.toFixed(2),
        defaultMarkupPercentage: values.defaultMarkupPercentage.toFixed(2),
        roundingMode: values.roundingMode,
        roundingIncrement:
          values.roundingMode === "increment"
            ? parseOptionalMoney(values.roundingIncrement)
            : null,
        roundingPriceEnding:
          values.roundingMode === "price_ending"
            ? parseOptionalMoney(values.roundingPriceEnding)
            : null,
        updatedBy: session.user.id,
        updatedAt: new Date(),
      },
    });

  redirect("/");
}
