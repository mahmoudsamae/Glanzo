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
      title="Salon einrichten"
      subtitle="Drei kurze Schritte — ohne Entwurf; bei Reload startest du neu."
    >
      <OnboardingWizard
        checkSlugAction={checkShopSlugAvailability}
        createShopAction={createShopAndRedirect}
      />
    </AuthShell>
  );
}
