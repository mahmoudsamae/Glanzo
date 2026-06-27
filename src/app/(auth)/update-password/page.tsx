import { AuthShell, UpdatePasswordForm } from "@/features/auth";
import { updatePassword } from "@/server/modules/auth/actions";

export default function UpdatePasswordPage() {
  return (
    <AuthShell title="Neues Passwort wählen" subtitle="Mindestens 8 Zeichen.">
      <UpdatePasswordForm updateAction={updatePassword} />
    </AuthShell>
  );
}
