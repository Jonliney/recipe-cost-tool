import { getSession } from "@/lib/auth/session";
import { getOnboardingState } from "@/lib/domain/onboarding";

export async function getAppShellState() {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      activeOrganization: null,
      settings: null,
      needsOnboarding: false,
    };
  }

  const onboardingState = await getOnboardingState(
    session.user.id,
    session.session.activeOrganizationId,
  );

  return {
    session,
    activeOrganization: onboardingState.activeOrganization ?? null,
    settings: onboardingState.settings ?? null,
    needsOnboarding: onboardingState.needsOnboarding,
  };
}
