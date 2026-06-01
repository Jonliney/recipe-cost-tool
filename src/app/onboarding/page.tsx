import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding-form";
import { getSession } from "@/lib/auth/session";
import { getOnboardingState } from "@/lib/domain/onboarding";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const onboardingState = await getOnboardingState(
    session.user.id,
    session.session.activeOrganizationId,
  );

  if (!onboardingState.needsOnboarding && onboardingState.activeOrganization) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12 md:px-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Onboarding</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Configure your bakery
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          This initial setup captures the business defaults needed for recipe
          costing, markup, and VAT-aware selling prices.
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-6 md:p-8">
        <OnboardingForm
          defaults={{
            bakeryName: onboardingState.activeOrganization?.name ?? "",
            countryCode: onboardingState.settings?.countryCode ?? "GB",
            locale: onboardingState.settings?.locale ?? "en-GB",
            currencyCode: onboardingState.settings?.currencyCode ?? "GBP",
            vatRegistered: onboardingState.settings?.vatRegistered
              ? "yes"
              : "no",
            defaultTaxRate:
              onboardingState.settings?.defaultTaxRate?.toString() ?? "20.00",
            defaultMarkupPercentage:
              onboardingState.settings?.defaultMarkupPercentage?.toString() ??
              "0.00",
            roundingMode: onboardingState.settings?.roundingMode ?? "none",
            roundingIncrement:
              onboardingState.settings?.roundingIncrement?.toString() ?? "0.50",
            roundingPriceEnding:
              onboardingState.settings?.roundingPriceEnding?.toString() ??
              "0.99",
          }}
        />
      </div>
    </main>
  );
}
