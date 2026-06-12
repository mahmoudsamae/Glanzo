import { AuthLink, AuthShell, ForgotPasswordForm } from "@/features/auth";
import { requestPasswordReset } from "@/server/modules/auth/actions";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll email you a recovery link."
      footer={<AuthLink href="/login">Back to sign in</AuthLink>}
    >
      <ForgotPasswordForm resetAction={requestPasswordReset} />
    </AuthShell>
  );
}
