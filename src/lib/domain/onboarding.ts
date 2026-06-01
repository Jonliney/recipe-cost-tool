import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { member, organization, organizationSettings } from "@/lib/db/schema";

export function normalizePurchasableItemName(name: string) {
  return name.trim().toLocaleLowerCase("en-GB");
}

export function slugifyOrganizationName(name: string) {
  const normalized = name
    .trim()
    .toLocaleLowerCase("en-GB")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "bakery";
}

export async function ensureUniqueOrganizationSlug(baseName: string) {
  const baseSlug = slugifyOrganizationName(baseName);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const candidate = `${baseSlug}${suffix}`;
    const existing = await db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.slug, candidate))
      .limit(1);

    if (existing.length === 0) {
      return candidate;
    }
  }

  return `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getOnboardingState(userId: string, activeOrganizationId?: string | null) {
  let resolvedOrganizationId = activeOrganizationId ?? null;

  if (!resolvedOrganizationId) {
    const [fallbackMembership] = await db
      .select({
        organizationId: member.organizationId,
      })
      .from(member)
      .where(eq(member.userId, userId))
      .orderBy(asc(member.createdAt))
      .limit(1);

    resolvedOrganizationId = fallbackMembership?.organizationId ?? null;
  }

  if (!resolvedOrganizationId) {
    return {
      needsOnboarding: true,
      activeOrganization: null,
      settings: null,
    };
  }

  const [activeOrganization] = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
    })
    .from(organization)
    .where(eq(organization.id, resolvedOrganizationId))
    .limit(1);

  const [settings] = await db
    .select()
    .from(organizationSettings)
    .where(eq(organizationSettings.organizationId, resolvedOrganizationId))
    .limit(1);

  return {
    needsOnboarding: !settings,
    activeOrganization,
    settings: settings ?? null,
    userId,
    resolvedOrganizationId,
  };
}
