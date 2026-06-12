import { AuthLink, AuthShell, RegisterForm } from "@/features/auth";
import { registerWithPassword } from "@/server/modules/auth/actions";
import { redirectIfAuthenticatedFromAuthPages } from "@/server/modules/shops/create-shop.service";

type RegisterPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  await redirectIfAuthenticatedFromAuthPages();
  const { next } = await searchParams;
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <AuthShell
      title="Start your shop"
      subtitle="The 15-minute promise begins here."
      footer={
        <>
          Already have an account? <AuthLink href={loginHref}>Sign in</AuthLink>
        </>
      }
    >
      <RegisterForm registerAction={registerWithPassword} nextPath={next} />
    </AuthShell>
  );
}
