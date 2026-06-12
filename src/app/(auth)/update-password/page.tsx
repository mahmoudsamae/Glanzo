import { AuthShell, UpdatePasswordForm } from "@/features/auth";
import { updatePassword } from "@/server/modules/auth/actions";

export default function UpdatePasswordPage() {
  return (
    <AuthShell title="Choose a new password" subtitle="Make it at least 8 characters.">
      <UpdatePasswordForm updateAction={updatePassword} />
    </AuthShell>
  );
}
