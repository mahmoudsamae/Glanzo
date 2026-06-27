import { AuthLink, AuthShell, ForgotPasswordForm } from "@/features/auth";
import { requestPasswordReset } from "@/server/modules/auth/actions";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Passwort zurücksetzen"
      subtitle="Wir senden dir einen Link per E-Mail."
      footer={<AuthLink href="/login">Zurück zur Anmeldung</AuthLink>}
    >
      <ForgotPasswordForm resetAction={requestPasswordReset} />
    </AuthShell>
  );
}
