import { AuthShell } from "@/features/auth";
import { OnboardingWizard } from "@/features/onboarding";
import { requireOnboardingAccess } from "@/server/modules/shops/create-shop.service";
import {
  checkShopSlugAvailability,
  createShopAndRedirect,
} from "@/server/modules/shops/create-shop.actions";

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
