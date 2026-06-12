import { AuthShell } from "@/features/auth";
import { OnboardingWizard } from "@/features/onboarding";
import {
  checkShopSlugAvailability,
  createShopAndRedirect,
  requireOnboardingAccess,
} from "@/server/modules/shops/create-shop.service";

export default async function OnboardingPage() {
  await requireOnboardingAccess();

  return (
    <AuthShell
      title="Set up your shop"
      subtitle="Three quick steps — no draft saves; refresh starts clean."
    >
      <OnboardingWizard
        checkSlugAction={checkShopSlugAvailability}
        createShopAction={createShopAndRedirect}
      />
    </AuthShell>
  );
}
